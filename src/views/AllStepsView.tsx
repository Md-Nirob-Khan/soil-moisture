import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink, 
  Sparkles, 
  ArrowLeft,
  ArrowRight,
  Layers,
  HelpCircle
} from 'lucide-react';
import { AppView } from '../types';

interface AllStepsViewProps {
  onNavigateToStep: (view: AppView, extraAction?: () => void) => void;
  onOpenExplainability: () => void;
}

export const AllStepsView: React.FC<AllStepsViewProps> = ({
  onNavigateToStep,
  onOpenExplainability,
}) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  const steps = [
    {
      step: 1,
      name: 'Login Screen',
      viewId: 'login' as AppView,
      tagline: 'Simple brand hero and single-click role demo credentials',
      highlights: ['Split-screen hero with lush crop fields', 'Quick demo auto-fill for Farm Manager / Agronomist', 'Clean, high-contrast credential forms'],
      previewUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
    },
    {
      step: 2,
      name: 'Farm Selection',
      viewId: 'farm-selection' as AppView,
      tagline: 'Multi-farm management cards with high-level health badges',
      highlights: ['Visual photo cards for Green Valley, Sunny Ridge, Riverdale', 'Status indicators (Healthy, Action Needed, Scheduled)', 'Add New Farm workflow'],
      previewUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80'
    },
    {
      step: 3,
      name: 'Main Dashboard',
      viewId: 'dashboard' as AppView,
      tagline: '6-KPI telemetry cards, AI recommendation banner, and farm quote card',
      highlights: ['Soil Moisture (28%), Temp (31°C), Humidity (62%), Rain (80%), Tank (72%), System Online', 'AI Recommendation: "Delay irrigation for approximately 6 hours"', 'Inspiring seedling image with agricultural quote'],
      previewUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80'
    },
    {
      step: 4,
      name: 'Farm Map',
      viewId: 'farm-map' as AppView,
      tagline: 'Interactive satellite plot schematic with 4 zoned crop quadrants',
      highlights: ['Satellite aerial view with compass rose', 'Color-coded zones: Zone 1 Corn (Normal), Zone 2 Lettuce (Dry), Zone 3 Tomato (Critical), Zone 4 Pepper (Normal)', 'Interactive zoom controls & status legend'],
      previewUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
    },
    {
      step: 5,
      name: 'Zone Detail',
      viewId: 'zone-detail' as AppView,
      tagline: 'Deep dive on Zone 3 Tomato Field with 24-hr moisture trend and AI prediction',
      highlights: ['Crisp tomato crop visual', 'Telemetry table (Soil moisture 28%, Optimal 40-60%, Temp 31°C, Last irrigation 8h ago)', 'Recharts moisture decay chart with dashed 20% critical threshold'],
      previewUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80'
    },
    {
      step: 6,
      name: 'Irrigation Control',
      viewId: 'irrigation-control' as AppView,
      tagline: 'Precision control form with numerical steppers and AI recommended presets',
      highlights: ['Water Amount stepper (500 L) & Duration stepper (25 min)', 'Start Time picker (6:30 PM)', '"Use AI Recommendation" one-click preset', 'Active hydraulic cycle progress simulator'],
      previewUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80'
    },
    {
      step: 7,
      name: 'Weather Forecast',
      viewId: 'weather' as AppView,
      tagline: 'Hyperlocal hourly telemetry cross-referenced with AI irrigation decisions',
      highlights: ['Next 24 Hours & Next 7 Days tabs for Beaumont, TX', 'Hourly breakdown: Sunny, Hot, Cloudy, Rain (80% Skip Irrigation)', 'AI Insight banner on water savings'],
      previewUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80'
    },
    {
      step: 8,
      name: 'Water Usage Analytics',
      viewId: 'analytics' as AppView,
      tagline: 'Volumetric savings comparison between traditional and AI smart irrigation',
      highlights: ['4 KPI metrics (Today: 1,250L, Yesterday: 1,620L, Weekly Saving: 2,800L, AI Estimated: 18%)', 'Dual bar chart (Traditional vs AI Smart by day)', '21% water saving donut chart (Saved: 2,200 L/week)'],
      previewUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80'
    },
    {
      step: 9,
      name: 'Alerts & Notifications',
      viewId: 'alerts' as AppView,
      tagline: 'Real-time telemetry event alerts with one-click resolution actions',
      highlights: ['Critical: Low Soil Moisture in Zone 3 (with [Irrigate] action)', 'High Temperature Warning (with [Dismiss] action)', 'Irrigation Completed (Zone 1 - 420L)', 'Weather Update: Rain Expected (with [View] action)'],
      previewUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80'
    },
    {
      step: 10,
      name: 'Explainable AI Modal',
      viewId: 'dashboard' as AppView,
      isModal: true,
      tagline: 'Transparent XAI feature attribution with weighted factor bars',
      highlights: ['Factor breakdown: Rain Forecast (40%), Soil Moisture (25%), Crop Water Need (20%), Temperature & Evaporation (15%)', 'Clear human-readable justification for delaying irrigation', 'Accept / Modify / Reject decision controls'],
      previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
    },
  ];

  const currentStep = steps[selectedStepIndex];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Presentation Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[#159947] text-white font-bold text-xs">
              10-Step UX Showcase
            </span>
            <h2 className="text-xl font-black text-slate-900 font-['Space_Grotesk']">
              AgriAI Complete Interaction Flow
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exact 1:1 match to the design reference photo — inspect each step individually or jump directly into the live view.
          </p>
        </div>

        {/* Step Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {steps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setSelectedStepIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedStepIndex === idx
                  ? 'bg-[#159947] text-white shadow-xs scale-105'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={`Step ${s.step}: ${s.name}`}
            >
              {s.step}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Step Spotlight Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Step Info (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#EAF8EF] text-[#159947] font-black text-sm flex items-center justify-center border border-[#159947]/30">
              {currentStep.step}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Step {currentStep.step} of 10
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Space_Grotesk']">
            {currentStep.name}
          </h3>

          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            {currentStep.tagline}
          </p>

          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Features & Visual Specs:
            </div>
            {currentStep.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#159947] shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          {/* Action to Jump to this Step */}
          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={() => {
                if (currentStep.isModal) {
                  onNavigateToStep('dashboard');
                  onOpenExplainability();
                } else {
                  onNavigateToStep(currentStep.viewId);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#159947] hover:bg-[#13883f] text-white font-bold text-sm shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <span>Open Step {currentStep.step} ({currentStep.name})</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Prev / Next controls */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                disabled={selectedStepIndex === 0}
                onClick={() => setSelectedStepIndex(prev => Math.max(0, prev - 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                aria-label="Previous step"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                disabled={selectedStepIndex === steps.length - 1}
                onClick={() => setSelectedStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                aria-label="Next step"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Step Thumbnail Card (5 cols) */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-md border border-slate-200 min-h-[260px] group bg-slate-900">
          <img
            src={currentStep.previewUrl}
            alt={currentStep.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="text-xs font-semibold text-emerald-300">
              Interactive Prototype View
            </div>
            <div className="text-lg font-bold font-['Space_Grotesk']">
              Step {currentStep.step}: {currentStep.name}
            </div>
          </div>
        </div>

      </div>

      {/* Grid of All 10 Steps (Matching Reference Image Layout) */}
      <div className="pt-4">
        <h4 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] mb-4">
          All 10 Steps Gallery
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              onClick={() => {
                setSelectedStepIndex(idx);
                if (s.isModal) {
                  onNavigateToStep('dashboard');
                  onOpenExplainability();
                } else {
                  onNavigateToStep(s.viewId);
                }
              }}
              className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md group flex flex-col justify-between ${
                selectedStepIndex === idx ? 'border-[#159947] ring-2 ring-[#159947]/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#EAF8EF] text-[#159947] text-xs font-black flex items-center justify-center border border-[#159947]/30">
                    {s.step}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Step {s.step}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-900 group-hover:text-[#159947] transition-colors line-clamp-1">
                  {s.name}
                </div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {s.tagline}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#159947]">
                <span>Launch view</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
