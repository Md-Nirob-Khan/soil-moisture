import React, { useState } from 'react';
import { 
  ChevronDown, 
  Clock, 
  Minus, 
  Plus, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Farm, FarmZone } from '../types';

interface IrrigationControlViewProps {
  currentFarm: Farm;
  selectedZone: FarmZone;
  onSelectZone: (zone: FarmZone) => void;
  onIrrigationComplete?: (deliveredLiters: number, newMoisture: number) => void;
}

export const IrrigationControlView: React.FC<IrrigationControlViewProps> = ({
  currentFarm,
  selectedZone,
  onSelectZone,
  onIrrigationComplete,
}) => {
  const [waterAmount, setWaterAmount] = useState(500); // Liters
  const [duration, setDuration] = useState(25); // Minutes
  const [startTime, setStartTime] = useState('6:30 PM');
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // AI Recommended Settings
  const aiSettings = {
    waterAmount: 420,
    duration: 21,
    startTime: '6:30 PM',
  };

  const handleUseAIRecommendation = () => {
    setWaterAmount(aiSettings.waterAmount);
    setDuration(aiSettings.duration);
    setStartTime(aiSettings.startTime);
  };

  const handleStartIrrigation = () => {
    setIsIrrigating(true);
    setProgress(15);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsIrrigating(false);
          if (onIrrigationComplete) {
            onIrrigationComplete(waterAmount, 48);
          }
          return 100;
        }
        return prev + 20;
      });
    }, 600);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Top Header Row matching photo: Zone 3 – Tomato Field ▾ */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            className="flex items-center gap-2 text-xl font-bold text-slate-900 font-['Space_Grotesk'] cursor-pointer"
          >
            <span>{selectedZone.name || 'Zone 3 – Tomato Field'}</span>
            <ChevronDown className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Side-by-Side Cards Matching Photo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: Irrigation Parameters */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Water Amount (Liters) with Stepper */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Water Amount (Liters)
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white max-w-sm">
                <button
                  type="button"
                  onClick={() => setWaterAmount(prev => Math.max(50, prev - 50))}
                  className="p-3 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(Number(e.target.value))}
                  className="w-full text-center font-bold text-slate-900 text-base focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setWaterAmount(prev => prev + 50)}
                  className="p-3 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Duration (Minutes) with Stepper */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Duration (Minutes)
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white max-w-sm">
                <button
                  type="button"
                  onClick={() => setDuration(prev => Math.max(5, prev - 5))}
                  className="p-3 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full text-center font-bold text-slate-900 text-base focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setDuration(prev => prev + 5)}
                  className="p-3 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Start Time
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white max-w-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Use AI Recommendation Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleUseAIRecommendation}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Use AI Recommendation
              </button>
            </div>
          </div>

          {/* Action Buttons: Start Irrigation & Cancel */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleStartIrrigation}
              className="px-6 py-2.5 rounded-xl bg-[#159947] hover:bg-[#13883f] text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              {isIrrigating ? 'Irrigating...' : 'Start Irrigation'}
            </button>
            <button
              type="button"
              onClick={() => {
                setWaterAmount(500);
                setDuration(25);
                setStartTime('6:30 PM');
              }}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Active Irrigation Progress */}
          {isIrrigating && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex justify-between text-xs font-semibold text-emerald-800 mb-1">
                <span>Cycle in Progress...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div 
                  className="bg-[#159947] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Card: AI Recommended Settings */}
        <div className="bg-[#eef2ff] rounded-2xl p-6 sm:p-7 border border-indigo-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#4338ca] font-bold text-base font-['Space_Grotesk'] mb-5">
              <Sparkles className="w-5 h-5 text-[#4f46e5]" />
              <span>AI Recommended Settings</span>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-indigo-100/60">
                <span className="text-slate-600 font-medium">Water Amount:</span>
                <span className="font-bold text-slate-900">{aiSettings.waterAmount} liters</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-indigo-100/60">
                <span className="text-slate-600 font-medium">Duration:</span>
                <span className="font-bold text-slate-900">{aiSettings.duration} minutes</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-indigo-100/60">
                <span className="text-slate-600 font-medium">Start Time:</span>
                <span className="font-bold text-slate-900">{aiSettings.startTime}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white/70 backdrop-blur-xs p-3.5 rounded-xl border border-indigo-100">
            This will meet crop water demand while considering upcoming rainfall.
          </div>
        </div>

      </div>

    </div>
  );
};
