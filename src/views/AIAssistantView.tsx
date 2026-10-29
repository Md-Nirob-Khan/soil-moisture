import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Bot } from 'lucide-react';
import {
  AlertItem,
  AIRecommendation,
  ChatMessage,
  Farm,
  FarmZone,
  SensorData,
  WeatherSnapshot,
} from '../types';

interface AIAssistantViewProps {
  farm: Farm;
  recommendation: AIRecommendation;
  weather: WeatherSnapshot | null;
  alerts: AlertItem[];
  sensorData: SensorData;
  selectedZone: FarmZone;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  farm,
  recommendation,
  weather,
  alerts,
  sensorData,
  selectedZone,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    sender: 'ai',
    text: `Hi! I'm your AgriAI assistant for ${farm.name}. Ask me about irrigation, soil moisture, weather or alerts for ${selectedZone.name}.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeminiAvailable, setIsGeminiAvailable] = useState(true);
  const [activeModel, setActiveModel] = useState('');
  const [offlineReason, setOfflineReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickQuestions = [
    `Should I irrigate ${selectedZone.name} today?`,
    `What is the soil moisture in ${selectedZone.name}?`,
    `What is the rain forecast for ${farm.name}?`,
    `Why is irrigation recommended for ${selectedZone.cropType}?`,
  ];

  const buildContext = () => ({
    farm: {
      name: farm.name,
      location: farm.location,
      acres: farm.acres,
      crops: farm.cropTypes,
    },
    selectedZone: {
      name: selectedZone.name,
      crop: selectedZone.cropType,
      area: selectedZone.areaAcres,
      status: selectedZone.status,
      optimalRange: selectedZone.optimalRange,
      lastIrrigationHoursAgo: selectedZone.lastIrrigationHoursAgo,
      valveOpen: selectedZone.valveOpen,
    },
    otherZones: farm.zones
      .filter((zone) => zone.id !== selectedZone.id)
      .map(({ name, cropType, status, soilMoisture }) => ({
        name,
        crop: cropType,
        status,
        soilMoisture,
      })),
    sensorData,
    recommendation: {
      title: recommendation.title,
      actionType: recommendation.actionType,
      delayHours: recommendation.delayHours,
      confidence: recommendation.confidence,
      waterLiters: recommendation.recommendedWaterAmountLiters,
      durationMinutes: recommendation.recommendedDurationMinutes,
      waterSavedLiters: recommendation.estimatedWaterSavedLiters,
      factors: recommendation.factors,
      explanationText: recommendation.explanationText,
    },
    weather: weather
      ? {
        current: weather.current,
        next12Hourly: weather.hourly.slice(0, 12),
        next7Daily: weather.daily.slice(0, 7),
      }
      : null,
    unreadAlerts: alerts.filter((alert) => !alert.read),
    localTime: new Date().toLocaleString(),
  });

  const generateOfflineAnswer = (
    query: string
  ): { text: string; dataPoints?: Array<{ label: string; value: string }> } => {
    const normalizedQuery = query.toLowerCase();
    const rainProbability = weather?.current.rainProbability ?? sensorData.rainProbability;
    const temperature = weather?.current.temperature ?? sensorData.temperature;
    const soilMoisture = sensorData.soilMoisture;
    const optimalRange = `${selectedZone.optimalRange[0]}–${selectedZone.optimalRange[1]}%`;
    const livePoints = [
      { label: 'Soil moisture', value: `${soilMoisture}%` },
      { label: 'Rain chance', value: `${rainProbability}%` },
      { label: 'Temperature', value: `${temperature}°C` },
    ];

    if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(query.trim())) {
      return { text: `Hi! I’m AgriAI, currently in offline mode. I can help with irrigation, soil moisture, weather, or alerts for ${selectedZone.name}.` };
    }

    if (/irrigat|should i|water.*today/.test(normalizedQuery)) {
      return {
        text: `For ${selectedZone.name}, soil moisture is ${soilMoisture}% against an optimal range of ${optimalRange}; the current rain chance is ${rainProbability}% and the temperature is ${temperature}°C. ${recommendation.explanationText} The current recommendation is ${recommendation.title}. You make the final irrigation decision.`,
        dataPoints: [
          livePoints[0],
          { label: 'Optimal range', value: optimalRange },
          livePoints[1],
          livePoints[2],
        ],
      };
    }

    if (/moisture|soil/.test(normalizedQuery)) {
      return {
        text: `${selectedZone.name} (${selectedZone.cropType}) has a soil moisture reading of ${soilMoisture}%, with an optimal range of ${optimalRange}.`,
        dataPoints: [livePoints[0], { label: 'Optimal range', value: optimalRange }],
      };
    }

    if (/alert|leak/.test(normalizedQuery)) {
      const unreadAlerts = alerts.filter((alert) => !alert.read);
      return unreadAlerts.length
        ? {
          text: `There ${unreadAlerts.length === 1 ? 'is' : 'are'} ${unreadAlerts.length} unread alert${unreadAlerts.length === 1 ? '' : 's'}: ${unreadAlerts.map((alert) => `${alert.title}: ${alert.message}`).join(' ')}`,
        }
        : { text: 'There are no unread alerts in the current farm data. I cannot confirm a leak without a related alert or sensor reading.' };
    }

    if (/rain|weather|forecast|temp/.test(normalizedQuery)) {
      const forecast = weather?.hourly.slice(0, 12) ?? [];
      const forecastSummary = forecast.length
        ? ` The highest rain chance in the next 12 hourly readings is ${Math.max(...forecast.map((hour) => hour.rainProbability))}%.`
        : ' An hourly forecast is not available.';
      const condition = weather?.current.condition;
      return {
        text: `Current conditions${condition ? ` are ${condition}` : ''}: ${temperature}°C and ${rainProbability}% rain chance.`
          + forecastSummary,
        dataPoints: [livePoints[1], livePoints[2]],
      };
    }

    if (/why|explain/.test(normalizedQuery)) {
      return {
        text: `${recommendation.explanationText} For ${selectedZone.name}, the current readings are ${soilMoisture}% soil moisture, ${rainProbability}% rain chance, and ${temperature}°C.`,
        dataPoints: livePoints,
      };
    }

    return {
      text: `I’m in offline mode, so I can only answer from the farm readings currently available. Try asking about irrigation, soil moisture, weather, or unread alerts for ${selectedZone.name}.`,
    };
  };

  const handleSendMessage = async (textToSend?: string, retry = false) => {
    const query = (textToSend ?? inputText).trim();
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (!retry) setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    const conversation = [
      ...messages.slice(1).map(({ sender, text }) => ({ sender, text })),
      { sender: 'user' as const, text: query },
    ];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation, context: buildContext() }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const reason = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
          ? result.error
          : `Chat request failed with status ${response.status}`;
        throw new Error(reason);
      }
      if (!result || typeof result !== 'object' || !('text' in result) || typeof result.text !== 'string') {
        throw new Error('Chat API returned an invalid response');
      }
      setIsGeminiAvailable(true);
      setActiveModel('model' in result && typeof result.model === 'string' ? result.model : '');
      setOfflineReason('');
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'model' in result && typeof result.model === 'string' ? result.model : undefined,
        dataPoints: 'dataPoints' in result && Array.isArray(result.dataPoints)
          ? result.dataPoints
          : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.warn('AgriAI is using offline mode:', error);
      setIsGeminiAvailable(false);
      setActiveModel('');
      setOfflineReason(error instanceof Error ? error.message : 'Unknown Gemini error');
      const response = generateOfflineAnswer(query);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataPoints: response.dataPoints,
        retryQuestion: query,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Header (Mandated by prompt) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#159947] text-white flex items-center justify-center shadow-md shadow-[#159947]/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Space_Grotesk']">
                AI Assistant
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isGeminiAvailable
                  ? 'bg-[#EAF8EF] text-[#159947] border-[#159947]/30'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isGeminiAvailable ? 'bg-[#159947] animate-pulse' : 'bg-amber-500'
                }`} />
                Status: Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Agronomic decision support, conversational IoT telemetry queries, and explainability assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              {isGeminiAvailable
                ? `Powered by Gemini${activeModel ? ` (${activeModel})` : ''}`
                : 'Offline mode (Gemini unavailable)'}
            </span>
            {!isGeminiAvailable && (
              <span className="max-w-xs text-right text-[10px] text-amber-700">
                Offline: {offlineReason}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[600px] overflow-hidden">
        
        {/* Messages Container */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 max-w-3xl ${
                  isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isAI ? 'bg-[#0D2B36] text-[#4ade80]' : 'bg-[#159947] text-white'
                }`}>
                  {isAI ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isAI
                        ? 'bg-white border border-slate-200 text-slate-800'
                        : 'bg-[#159947] text-white font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    
                    {/* Optional AI Data Points */}
                    {isAI && msg.dataPoints && (
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.dataPoints.map((dp, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                            <span className="text-slate-400 font-medium block text-[10px] uppercase">
                              {dp.label}
                            </span>
                            <span className="font-bold text-slate-900 font-['Space_Grotesk']">
                              {dp.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {isAI && msg.retryQuestion && (
                      <button
                        type="button"
                        onClick={() => handleSendMessage(msg.retryQuestion, true)}
                        disabled={isTyping}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Retry with AI
                      </button>
                    )}
                  </div>

                  <span className={`text-[10px] text-slate-400 font-medium px-1 block ${
                    isAI ? 'text-left' : 'text-right'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-xl mr-auto animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-[#0D2B36] text-[#4ade80] flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#159947] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#159947] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#159947] animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 font-['Space_Grotesk']">
            Suggested:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isTyping}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#EAF8EF] hover:text-[#159947] hover:border-[#159947]/30 border border-slate-200/80 text-slate-700 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar (Mandated Input placeholder & Send button) */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-assistant-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              placeholder="Ask me anything about your farm..."
              className="flex-1 text-xs sm:text-sm py-3 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#159947]/30 focus:border-[#159947]"
            />

            <button
              id="ai-assistant-send-btn"
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-5 py-3 rounded-xl bg-[#159947] hover:bg-[#13883f] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#159947]/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
