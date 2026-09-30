import React from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  Sparkles 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';
import { FarmZone } from '../types';

interface ZoneDetailViewProps {
  zone: FarmZone;
  onBack: () => void;
  onNavigateToIrrigation: (zone: FarmZone) => void;
  onTriggerInstantCycle?: () => void;
}

export const ZoneDetailView: React.FC<ZoneDetailViewProps> = ({
  zone,
  onBack,
  onNavigateToIrrigation,
}) => {
  // 24-hr moisture chart data matching photo (12AM, 6AM, 12PM, 6PM, 12AM)
  const chartData = [
    { time: '12AM', moisture: 54 },
    { time: '6AM', moisture: 45 },
    { time: '12PM', moisture: 35 },
    { time: '6PM', moisture: 28 },
    { time: '12AM', moisture: 21 },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Top Bar: ← Back to Map & Zone Dropdown */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Map</span>
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 text-base font-bold text-slate-900 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer font-['Space_Grotesk']"
          >
            <span>{zone.name || 'Zone 3 – Tomato Field'}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* 3-Column Layout Matching Photo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Column 1: Tomato Crop Photo (~3 cols) */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 min-h-[300px] flex">
          <img
            src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80"
            alt="Ripe tomatoes on vine"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Column 2: Specs Table (~4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                Critical
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Crop Type</span>
              <span className="font-semibold text-slate-800">Tomato</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Area</span>
              <span className="font-semibold text-slate-800">6 acres</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Soil Moisture</span>
              <span className="font-bold text-red-600">28% (Low)</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Optimal Range</span>
              <span className="font-semibold text-slate-800">40 – 60%</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Temperature</span>
              <span className="font-semibold text-slate-800">31°C</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Humidity</span>
              <span className="font-semibold text-slate-800">62%</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Last Irrigation</span>
              <span className="font-semibold text-slate-800">8 hours ago</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Next Recommended</span>
              <span className="font-bold text-red-600">6:30 PM (in 7 hrs)</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToIrrigation(zone)}
            className="w-full mt-4 py-2.5 rounded-xl bg-[#159947] hover:bg-[#13883f] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Irrigate Now
          </button>
        </div>

        {/* Column 3: Soil Moisture Trend Chart + AI Prediction Callout (~5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* Trend Chart Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900 font-['Space_Grotesk']">
                Soil Moisture Trend (Last 24 hrs)
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Critical Level (20%)</span>
              </div>
            </div>

            <div className="h-48 sm:h-52 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 60]} 
                    ticks={[0, 20, 40, 60]}
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '8px', 
                      border: 'none', 
                      color: '#ffffff',
                      fontSize: '11px'
                    }}
                  />
                  {/* Dotted Red Line at 20% */}
                  <ReferenceLine 
                    y={20} 
                    stroke="#ef4444" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="moisture" 
                    stroke="#2563eb" 
                    strokeWidth={2.5} 
                    dot={{ fill: '#2563eb', r: 4 }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Prediction Callout Card */}
          <div className="bg-[#f0f9ff] rounded-2xl p-4 border border-sky-200 shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-sky-900 font-['Space_Grotesk']">
                AI Prediction
              </div>
              <div className="text-xs sm:text-sm text-sky-950 mt-0.5 leading-snug">
                Soil moisture is predicted to reach the critical threshold in approximately <strong>7 hours</strong>.
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
