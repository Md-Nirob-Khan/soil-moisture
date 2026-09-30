import React from 'react';
import { 
  Sprout, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { AIRecommendation } from '../types';

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
  onAccept: () => void;
  onModify: () => void;
  onIrrigateNow: () => void;
  onWhyThis: () => void;
  hasAccepted?: boolean;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  recommendation,
  onAccept,
  onModify,
  onIrrigateNow,
  onWhyThis,
  hasAccepted = false,
}) => {
  return (
    <div 
      id="ai-recommendation-card" 
      className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Top Header Row: Green Leaf Icon + AI Recommendation */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#159947] flex items-center justify-center text-white shadow-xs">
              <Sprout className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#159947] font-['Space_Grotesk'] tracking-tight">
              AI Recommendation
            </h2>
          </div>

          {hasAccepted && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#EAF8EF] text-[#159947] rounded-full text-xs font-semibold border border-[#159947]/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accepted</span>
            </div>
          )}
        </div>

        {/* Main Recommendation Statement */}
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug font-['Space_Grotesk'] mb-4">
          {recommendation.summary || "Delay irrigation for approximately 6 hours."}
        </div>

        {/* Bullet details matching photo */}
        <div className="space-y-1.5 text-sm text-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">•</span>
            <span>Expected rainfall probability: <strong>{recommendation.rainProbability}%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">•</span>
            <span>Current soil moisture: <strong>{recommendation.currentSoilMoisture}%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">•</span>
            <span>Estimated water saved: <strong>{recommendation.estimatedWaterSavedLiters} liters</strong></span>
          </div>
        </div>

        {/* Why this recommendation link */}
        <div className="mb-6">
          <button
            id="btn-why-recommendation"
            onClick={onWhyThis}
            type="button"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 underline flex items-center gap-1 cursor-pointer"
          >
            <span>Why this recommendation?</span>
          </button>
        </div>
      </div>

      {/* 3 Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
        <button
          id="btn-accept-recommendation"
          onClick={onAccept}
          type="button"
          className="px-4 py-2.5 rounded-xl bg-[#159947] hover:bg-[#13883f] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-98"
        >
          Accept Recommendation
        </button>

        <button
          id="btn-modify-schedule"
          onClick={onModify}
          type="button"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-300 transition-all cursor-pointer active:scale-98"
        >
          Modify Schedule
        </button>

        <button
          id="btn-irrigate-now"
          onClick={onIrrigateNow}
          type="button"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-300 transition-all cursor-pointer active:scale-98"
        >
          Irrigate Now
        </button>
      </div>
    </div>
  );
};
