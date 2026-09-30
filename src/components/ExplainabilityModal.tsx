import React from 'react';
import { 
  X, 
  Info
} from 'lucide-react';
import { AIRecommendation } from '../types';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: AIRecommendation;
  onAccept: () => void;
  onModify: () => void;
  onReject: () => void;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onModify,
  onReject,
}) => {
  if (!isOpen) return null;

  const factors = [
    {
      title: 'Rain Forecast',
      percentage: 40,
      barColor: 'bg-blue-600',
      description: '80% chance of rain within 6 hours. Natural rainfall will meet moisture needs.',
    },
    {
      title: 'Soil Moisture',
      percentage: 25,
      barColor: 'bg-amber-400',
      description: 'Current moisture is 28%. Above critical threshold of 20% for the next 7 hours.',
    },
    {
      title: 'Crop Water Need',
      percentage: 20,
      barColor: 'bg-[#159947]',
      description: 'Tomato plants in current stage can tolerate delayed irrigation.',
    },
    {
      title: 'Temperature & Evaporation',
      percentage: 15,
      barColor: 'bg-slate-400',
      description: 'Evening temperature is dropping, reducing evaporation loss.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="explainability-modal"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-['Space_Grotesk'] text-slate-900">
            Why is AI recommending this?
          </h2>
          <button 
            id="close-xai-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs sm:text-sm">
          
          <p className="text-slate-600">
            The AI model analyzed the following factors to make this recommendation:
          </p>

          {/* 4 Factor Contribution Bars */}
          <div className="space-y-4">
            {factors.map((factor) => (
              <div key={factor.title} className="space-y-1.5">
                <div className="flex justify-between items-center font-semibold text-slate-900">
                  <span>{factor.title}</span>
                  <span className="font-bold">{factor.percentage}%</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`${factor.barColor} h-2 rounded-full`}
                    style={{ width: `${factor.percentage}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>

          {/* Info callout at bottom */}
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Irrigation will automatically trigger if rain does not occur by 8:00 PM or if moisture drops below 22%.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-[#159947] hover:bg-[#13883f] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            Accept Recommendation
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onModify();
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-300 transition-colors cursor-pointer"
          >
            Modify
          </button>

          <button
            type="button"
            onClick={() => {
              onReject();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 font-semibold text-xs sm:text-sm border border-red-200 transition-colors cursor-pointer"
          >
            Reject
          </button>
        </div>

      </div>
    </div>
  );
};
