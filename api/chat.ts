import type { IncomingMessage, ServerResponse } from 'node:http';

interface ChatRequest extends IncomingMessage {
  body?: unknown;
}

interface ChatMessageInput {
  sender: 'user' | 'ai';
  text: string;
}

class GeminiApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly responseBody: string,
    message: string
  ) {
    super(message);
    this.name = 'GeminiApiError';
  }
}

const SYSTEM_PROMPT = `You are AgriAI, an irrigation and agronomy assistant.
Answer the user's actual question. For greetings, reply briefly and offer 2-3 things you can help with. Do not provide telemetry unless it is relevant.
Use only numbers from the provided farm context. Never invent sensor values, rain probabilities, savings, or costs. If data is missing, say so.
Keep answers to 2-5 sentences in plain, farmer-friendly language. Use °C, %, and liters.
For irrigation advice, explain why using soil moisture compared with the selected zone's optimal range, rain chance, and temperature when available. The grower makes the final decision.
Reply in the user's language.
Return only JSON in this shape: {"text":"...","dataPoints":[{"label":"...","value":"..."}]}. Include no more than 4 dataPoints.`;

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
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  includeJsonMimeType: boolean
): Promise<Response> {
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
    }
  );
}

async function requestWithJsonFallback(
  model: string,
  apiKey: string,
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
): Promise<Response> {
  let response = await requestGemini(model, apiKey, contents, true);
  if (response.status === 400) {
    response = await requestGemini(model, apiKey, contents, false);
  }
  return response;
}

async function discoverFlashModel(apiKey: string, unavailableModel: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
  );
  if (!response.ok) {
    const responseBody = await response.text();
    throw new GeminiApiError(
      response.status,
      responseBody,
      `Could not list Gemini models (${response.status}): ${responseBody}`
    );
  }

  const body: unknown = await response.json();
  if (!isRecord(body) || !Array.isArray(body.models)) {
    throw new Error('Gemini model listing returned an invalid response');
  }

  const models = body.models
    .filter((item): item is Record<string, unknown> =>
      isRecord(item) &&
      typeof item.name === 'string' &&
      item.name.toLowerCase().includes('flash') &&
      !/(image|tts|audio)/i.test(item.name) &&
      item.name.replace(/^models\//, '') !== unavailableModel &&
      Array.isArray(item.supportedGenerationMethods) &&
      item.supportedGenerationMethods.includes('generateContent')
    )
    .sort((left, right) => {
      const leftName = (left.name as string).replace(/^models\//, '');
      const rightName = (right.name as string).replace(/^models\//, '');
      const leftPreview = /preview/i.test(leftName) ? 1 : 0;
      const rightPreview = /preview/i.test(rightName) ? 1 : 0;
      if (leftPreview !== rightPreview) return leftPreview - rightPreview;
      const leftVersion = Number(leftName.match(/^gemini-(\d+(?:\.\d+)?)-flash/i)?.[1] ?? 0);
      const rightVersion = Number(rightName.match(/^gemini-(\d+(?:\.\d+)?)-flash/i)?.[1] ?? 0);
      return rightVersion - leftVersion;
    });
  const model = models[0];
  if (!model || typeof model.name !== 'string') {
    throw new Error('No available Gemini Flash model supports generateContent');
  }

  return model.name.replace(/^models\//, '');
}

function getGeminiErrorMessage(responseBody: string): string {
  try {
    const parsed: unknown = JSON.parse(responseBody);
    if (isRecord(parsed) && isRecord(parsed.error) && typeof parsed.error.message === 'string') {
      return parsed.error.message;
    }
  } catch {
    // Keep the upstream response text when it is not JSON.
  }
  return responseBody || 'Gemini returned an empty error response';
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
  const contents = conversation.map((message, index) => ({
    role: message.sender === 'user' ? 'user' as const : 'model' as const,
    parts: [{
      text: message.text + (index === latestUserIndex
        ? `\n\nFarm context (JSON): ${JSON.stringify(context)}`
        : ''),
    }],
  }));

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    let response = await requestWithJsonFallback(model, apiKey, contents);
    if (response.status === 404) {
      const availableFlashModel = await discoverFlashModel(apiKey, model);
      process.env.GEMINI_MODEL = availableFlashModel;
      response = await requestWithJsonFallback(availableFlashModel, apiKey, contents);
    }
    if (!response.ok) {
      const errorText = await response.text();
      throw new GeminiApiError(
        response.status,
        errorText,
        getGeminiErrorMessage(errorText)
      );
    }

    const responseBody: unknown = await response.json();
    const rawText = extractModelText(responseBody);
    sendJson(res, 200, parseModelOutput(rawText));
  } catch (error) {
    if (error instanceof GeminiApiError) {
      console.error('AgriAI Gemini API error body:', error.responseBody);
      sendJson(res, error.statusCode, {
        error: error.message,
      });
      return;
    }
    console.error('AgriAI chat request failed:', error);
    sendJson(res, 502, {
      error: error instanceof Error ? error.message : 'Gemini request failed',
    });
  }
}
