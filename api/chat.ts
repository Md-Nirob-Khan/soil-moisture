import type { IncomingMessage, ServerResponse } from 'node:http';

interface ChatRequest extends IncomingMessage {
  body?: unknown;
}

interface ChatMessageInput {
  sender: 'user' | 'ai';
  text: string;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

const SYSTEM_PROMPT = `You are AgriAI, an irrigation and agronomy assistant.
Answer the user's actual question. For greetings, reply briefly and offer 2-3 things you can help with. Do not provide telemetry unless it is relevant.
Use only numbers from the provided farm context. Never invent sensor values, rain probabilities, savings, or costs. If data is missing, say so.
Keep answers to 2-5 sentences in plain, farmer-friendly language. Use °C, %, and liters.
For irrigation advice, explain why using soil moisture compared with the selected zone's optimal range, rain chance, and temperature when available. The grower makes the final decision.
Reply in the user's language.
Return only JSON in this shape: {"text":"...","dataPoints":[{"label":"...","value":"..."}]}. Include no more than 4 dataPoints.`;

const REQUEST_TIMEOUT_MS = 18_000;
let flashModelsPromise: Promise<string[]> | undefined;

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readRequestBody(req: ChatRequest): Promise<unknown> {
  let body = req.body;

  if (body === undefined) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    body = Buffer.concat(chunks).toString('utf8');
  }

  if (typeof body === 'string') return JSON.parse(body);
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString('utf8'));
  return body;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseModelOutput(rawText: string): { text: string; dataPoints?: Array<{ label: string; value: string }> } {
  const jsonText = rawText
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  try {
    const parsed: unknown = JSON.parse(jsonText);
    if (!isRecord(parsed) || typeof parsed.text !== 'string') {
      return { text: rawText };
    }

    const dataPoints = Array.isArray(parsed.dataPoints)
      ? parsed.dataPoints
        .filter((point): point is Record<string, unknown> =>
          isRecord(point) && typeof point.label === 'string' && typeof point.value === 'string'
        )
        .slice(0, 4)
        .map((point) => ({ label: point.label as string, value: point.value as string }))
      : undefined;

    return { text: parsed.text, ...(dataPoints?.length ? { dataPoints } : {}) };
  } catch {
    return { text: rawText };
  }
}

function extractModelText(responseBody: unknown): string {
  if (!isRecord(responseBody) || !Array.isArray(responseBody.candidates)) {
    throw new Error('Gemini returned an invalid response');
  }
  const candidate = responseBody.candidates[0];
  if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) {
    throw new Error('Gemini returned no response content');
  }
  const text = candidate.content.parts
    .filter((part): part is Record<string, unknown> => isRecord(part) && typeof part.text === 'string')
    .map((part) => part.text as string)
    .join('');
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

async function requestGemini(
  model: string,
  apiKey: string,
  contents: GeminiContent[],
  includeJsonMimeType: boolean,
  deadline: number
): Promise<Response> {
  const remainingMs = deadline - Date.now();
  if (remainingMs <= 0) throw new Error('Gemini request deadline exceeded');

  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        ...(includeJsonMimeType ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
      }),
      signal: AbortSignal.timeout(remainingMs),
    }
  );
}

function retryAfterMs(response: Response): number | undefined {
  const retryAfter = response.headers.get('retry-after');
  if (!retryAfter) return undefined;
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(retryAfter);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 503;
}

async function waitForRetry(response: Response, retryIndex: number, deadline: number): Promise<boolean> {
  const delayMs = retryAfterMs(response) ?? [800, 2000][retryIndex] + Math.floor(Math.random() * 250);
  await response.body?.cancel();
  if (Date.now() + delayMs >= deadline) return false;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return Date.now() < deadline;
}

async function requestModelWithRetries(
  model: string,
  apiKey: string,
  contents: GeminiContent[],
  deadline: number
): Promise<Response> {
  let response: Response | undefined;
  for (let attempt = 0; attempt < 3 && Date.now() < deadline; attempt += 1) {
    response = await requestGemini(model, apiKey, contents, true, deadline);
    if (response.status === 400) {
      await response.body?.cancel();
      response = await requestGemini(model, apiKey, contents, false, deadline);
    }
    if (!isRetryableStatus(response.status) || attempt === 2) return response;
    console.warn(`Gemini model ${model} returned ${response.status}; retry ${attempt + 1}/2`);
    const canRetry = await waitForRetry(response, attempt, deadline);
    if (!canRetry) break;
  }
  return response ?? new Response(null, { status: 503 });
}

async function discoverFlashModels(apiKey: string, deadline: number): Promise<string[]> {
  if (!flashModelsPromise) {
    flashModelsPromise = (async () => {
      try {
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0) return [];
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
          { signal: AbortSignal.timeout(remainingMs) }
        );
        if (!response.ok) {
          console.error(`Gemini model listing failed (${response.status}): ${await response.text()}`);
          return [];
        }
        const body: unknown = await response.json();
        if (!isRecord(body) || !Array.isArray(body.models)) return [];

        return body.models
          .filter((item): item is Record<string, unknown> =>
            isRecord(item) &&
            typeof item.name === 'string' &&
            item.name.toLowerCase().includes('flash') &&
            !/(image|tts|audio)/i.test(item.name) &&
            Array.isArray(item.supportedGenerationMethods) &&
            item.supportedGenerationMethods.includes('generateContent')
          )
          .map((item) => (item.name as string).replace(/^models\//, ''))
          .sort((left, right) => {
            const leftPreview = /preview/i.test(left) ? 1 : 0;
            const rightPreview = /preview/i.test(right) ? 1 : 0;
            if (leftPreview !== rightPreview) return leftPreview - rightPreview;
            const leftVersion = Number(left.match(/^gemini-(\d+(?:\.\d+)?)-flash/i)?.[1] ?? 0);
            const rightVersion = Number(right.match(/^gemini-(\d+(?:\.\d+)?)-flash/i)?.[1] ?? 0);
            return rightVersion - leftVersion;
          });
      } catch (error) {
        console.error('Gemini model listing failed:', error);
        return [];
      }
    })();
  }
  return flashModelsPromise;
}

export default async function handler(req: ChatRequest, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    sendJson(res, 503, { error: 'Gemini is unavailable: GEMINI_API_KEY is not configured' });
    return;
  }

  let requestBody: unknown;
  try {
    requestBody = await readRequestBody(req);
  } catch {
    sendJson(res, 400, { error: 'Request body must be valid JSON' });
    return;
  }

  if (!isRecord(requestBody) || !Array.isArray(requestBody.messages)) {
    sendJson(res, 400, { error: 'Request must include a messages array' });
    return;
  }

  const messages: ChatMessageInput[] = requestBody.messages
    .filter((message): message is Record<string, unknown> =>
      isRecord(message) &&
      (message.sender === 'user' || message.sender === 'ai') &&
      typeof message.text === 'string'
    )
    .map((message) => ({
      sender: message.sender as ChatMessageInput['sender'],
      text: message.text as string,
    }))
    .slice(-12);

  const firstUserIndex = messages.findIndex((message) => message.sender === 'user');
  if (firstUserIndex < 0) {
    sendJson(res, 400, { error: 'At least one user message is required' });
    return;
  }

  const conversation = messages.slice(firstUserIndex);
  let latestUserIndex = -1;
  conversation.forEach((message, index) => {
    if (message.sender === 'user') latestUserIndex = index;
  });
  const context = isRecord(requestBody.context) ? requestBody.context : {};
  const contents: GeminiContent[] = conversation.map((message, index) => ({
    role: message.sender === 'user' ? 'user' as const : 'model' as const,
    parts: [{
      text: message.text + (index === latestUserIndex
        ? `\n\nFarm context (JSON): ${JSON.stringify(context)}`
        : ''),
    }],
  }));

  const deadline = Date.now() + REQUEST_TIMEOUT_MS;
  try {
    const availableModelsPromise = discoverFlashModels(apiKey, deadline);
    const models = [
      process.env.GEMINI_MODEL,
      'gemini-3.5-flash-lite',
      'gemini-flash-latest',
      'gemini-flash-lite-latest',
      ...(await availableModelsPromise),
    ].filter((model, index, list): model is string =>
      typeof model === 'string' && model.length > 0 && list.indexOf(model) === index
    );

    for (const [index, model] of models.entries()) {
      if (Date.now() >= deadline) break;
      if (index > 0) console.warn(`Gemini fallback: trying model ${model}`);

      let response: Response;
      try {
        response = await requestModelWithRetries(model, apiKey, contents, deadline);
      } catch (error) {
        console.error(`Gemini model ${model} request failed:`, error);
        continue;
      }

      if (response.ok) {
        const responseBody: unknown = await response.json();
        const rawText = extractModelText(responseBody);
        console.info(`AgriAI Gemini answered with model ${model}`);
        sendJson(res, 200, { ...parseModelOutput(rawText), model });
        return;
      }

      const errorText = await response.text();
      console.error(`Gemini model ${model} failed (${response.status}): ${errorText}`);
    }

    sendJson(res, 503, { error: 'Gemini is busy right now, please try again' });
  } catch (error) {
    console.error('AgriAI chat request failed:', error);
    sendJson(res, 503, { error: 'Gemini is busy right now, please try again' });
  }
}
