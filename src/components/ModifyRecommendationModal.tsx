import React, { useState } from 'react';
import { X, SlidersHorizontal, Check, Clock, Droplets } from 'lucide-react';
import { AIRecommendation } from '../types';

interface ModifyRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: AIRecommendation;
  onSave: (modifiedSettings: {
    delayHours: number;
    waterAmountLiters: number;
    durationMinutes: number;
    reason: string;
  }) => void;
}

export const ModifyRecommendationModal: React.FC<ModifyRecommendationModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  onSave,
}) => {
  const [delayHours, setDelayHours] = useState(recommendation.delayHours || 6);
  const [waterAmount, setWaterAmount] = useState(recommendation.recommendedWaterAmountLiters || 420);
  const [duration, setDuration] = useState(recommendation.recommendedDurationMinutes || 21);
  const [reason, setReason] = useState('Adjusted based on afternoon inspection of soil cresting.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      delayHours,
      waterAmountLiters: waterAmount,
      durationMinutes: duration,
      reason,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="modify-schedule-modal"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="px-6 py-4 bg-[#0D2B36] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#4ade80]" />
            <h2 className="text-base font-bold font-['Space_Grotesk'] text-white">
              Modify Irrigation Schedule
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
            <span className="font-bold">Human Override Mode:</span> You can override the AI's default suggestion ({recommendation.delayHours}h delay, {recommendation.recommendedWaterAmountLiters}L). Your override will be recorded in the audit log.
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Delay Hours</span>
              <span className="text-[#159947] font-bold">{delayHours} Hours</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={delayHours}
              onChange={(e) => setDelayHours(Number(e.target.value))}
              className="w-full accent-[#159947] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Immediate (0h)</span>
              <span>12h</span>
              <span>24h</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Water Volume (Liters)</span>
              <span className="text-[#159947] font-bold">{waterAmount} L</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="20"
              value={waterAmount}
              onChange={(e) => setWaterAmount(Number(e.target.value))}
              className="w-full accent-[#159947] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Run Duration</span>
              <span className="text-[#159947] font-bold">{duration} Minutes</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-[#159947] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Override Notes / Rationale (for AI retraining)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159947]/30 focus:border-[#159947]"
              placeholder="e.g. Field inspection revealed drier topsoil"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#159947] hover:bg-[#13883f] rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Modified Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
