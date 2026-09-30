import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  Droplets, 
  CloudSun, 
  ShieldAlert, 
  Thermometer, 
  CheckCircle2,
  RefreshCw,
  Terminal,
  Paperclip
} from 'lucide-react';
import { ChatMessage, SensorData, FarmZone } from '../types';
import { INITIAL_CHAT_MESSAGES } from '../data/mockData';

interface AIAssistantViewProps {
  sensorData: SensorData;
  selectedZone: FarmZone;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  sensorData,
  selectedZone,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickQuestions = [
    'Should I irrigate the tomato field today?',
    'What happens if it doesn’t rain?',
    'What is the current soil moisture in Zone 3?',
    'Explain the potential leak detected in Zone 2',
    'How much water did we save this week?',
    'What is today’s temperature and evapotranspiration?',
  ];

  // Natural agronomic AI responses generator
  const generateAIResponse = (userQuery: string): { text: string; dataPoints?: Array<{ label: string; value: string }> } => {
    const q = userQuery.toLowerCase();

    if (q.includes('tomato') || (q.includes('irrigate') && q.includes('today'))) {
      return {
        text: 'Irrigation is currently not recommended for the tomato field (Zone 3). Rainfall probability is 80% within the next six hours. Delaying irrigation saves approximately 320 liters of water without putting roots in drought distress.',
        dataPoints: [
          { label: 'Zone 3 Moisture', value: `${sensorData.soilMoisture}%` },
          { label: 'Rainfront Probability', value: `${sensorData.rainProbability}% in 6h` },
          { label: 'Projected Water Savings', value: '320 Liters' },
        ],
      };
    }

    if (q.includes('rain') && (q.includes('not') || q.includes("doesn't") || q.includes('if it'))) {
      return {
        text: 'I will continuously reassess soil moisture and weather telemetry every 5 minutes. If soil moisture falls below 22% and rain radar fails to materialize, I will immediately issue an automated recommendation to irrigate for 21 minutes.',
        dataPoints: [
          { label: 'Fail-safe Cutoff', value: '22% soil moisture' },
          { label: 'Autonomous Polling', value: 'Active via LoRaWAN' },
        ],
      };
    }

    if (q.includes('moisture') || q.includes('zone 3') || q.includes('soil')) {
      return {
        text: `Zone 3 (Tomato Field) currently registers ${sensorData.soilMoisture}% soil volumetric water content. Although below the optimal 40–60% zone, the crop is comfortably above the 20% permanent wilting point. Current decline rate is ~1.1% per hour.`,
        dataPoints: [
          { label: 'Current Moisture', value: `${sensorData.soilMoisture}%` },
          { label: 'Target Optimal', value: '40–60%' },
          { label: 'Time to Critical Limit', value: '~7 hours' },
        ],
      };
    }

    if (q.includes('leak') || q.includes('zone 2') || q.includes('alert')) {
      return {
        text: 'Telemetry detected a 34% surge in volumetric flow rate in Zone 2 (Lettuce Patch) relative to baseline nozzle coefficient. This points to a potential manifold gasket fissure or cracked lateral emitter line. Inspecting Zone 2 is recommended.',
        dataPoints: [
          { label: 'Anomaly Delta', value: '+34% over baseline' },
          { label: 'Estimated Unmeasured Loss', value: '64 L/hr' },
          { label: 'Suggested Action', value: 'Inspect lateral line coupling' },
        ],
      };
    }

    if (q.includes('save') || q.includes('water') || q.includes('week') || q.includes('analytics')) {
      return {
        text: 'This week AgriAI saved 2,800 liters of water (21% total conservation) across all 4 zones compared to scheduled timer clocks. This translates to an estimated $142 utility saving and avoids nutrient runoff leaching.',
        dataPoints: [
          { label: 'Conserved Volume', value: '2,800 Liters / week' },
          { label: 'Efficiency Gain', value: '+21% vs static timer' },
        ],
      };
    }

    if (q.includes('temp') || q.includes('weather') || q.includes('forecast')) {
      return {
        text: `Current ambient temperature is ${sensorData.temperature}°C with ${sensorData.humidity}% relative humidity. Peak solar irradiance is expected around 2:00 PM, followed by heavy cloud cover and 80% precipitation probability after 5:30 PM.`,
        dataPoints: [
          { label: 'Temperature', value: `${sensorData.temperature}°C` },
          { label: 'Humidity', value: `${sensorData.humidity}%` },
          { label: 'Atmospheric Pressure', value: '1013 hPa (falling)' },
        ],
      };
    }

    if (q.includes('tank') || q.includes('status') || q.includes('system')) {
      return {
        text: `The central water storage tank is at ${sensorData.waterTankLevel}% capacity (approx. 18,400 liters). All 4 solenoid valves, booster pumps, and IoT mesh nodes are reporting online with 100% signal strength.`,
        dataPoints: [
          { label: 'Reservoir Level', value: `${sensorData.waterTankLevel}%` },
          { label: 'IoT Node Health', value: '4/4 Online' },
        ],
      };
    }

    // Default agronomic answer
    return {
      text: `Based on current telemetry across ${selectedZone.name}, sensor levels indicate ${sensorData.soilMoisture}% moisture and ${sensorData.temperature}°C temperature. The AI irrigation recommendation engine recommends standing by for the 80% rain front before cycling valves.`,
      dataPoints: [
        { label: 'Primary Advice', value: 'Delay irrigation 6 hours' },
        { label: 'AI Confidence', value: '87%' },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(query);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataPoints: response.dataPoints,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
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
              {/* Status: Online (Mandated by prompt) */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF8EF] text-[#159947] text-xs font-bold border border-[#159947]/30">
                <span className="w-2 h-2 rounded-full bg-[#159947] animate-pulse" />
                Status: Online
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Agronomic decision support, conversational IoT telemetry queries, and explainability assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Gemini API Ready Architecture
          </span>
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
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#EAF8EF] hover:text-[#159947] hover:border-[#159947]/30 border border-slate-200/80 text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
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
              placeholder="Ask me anything about your farm..."
              className="flex-1 text-xs sm:text-sm py-3 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#159947]/30 focus:border-[#159947]"
            />

            <button
              id="ai-assistant-send-btn"
              type="submit"
              disabled={!inputText.trim()}
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
