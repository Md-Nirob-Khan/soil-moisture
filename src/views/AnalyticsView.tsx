import React, { useState } from 'react';
import { 
  ChevronDown, 
  Droplets, 
  ArrowUp, 
  Sprout, 
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { USAGE_BAR_DATA } from '../data/mockData';

export const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 7 Days');

  // Donut chart data for 21% savings: 8300 used, 2200 saved
  const donutData = [
    { name: 'AI Smart Irrigation', value: 8300, color: '#159947' },
    { name: 'Water Saved', value: 2200, color: '#e2e8f0' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Top Header Row with Dropdown */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            className="flex items-center gap-2 text-base font-bold text-slate-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer font-['Space_Grotesk']"
          >
            <span>{timeRange}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Today */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              1,250 L
            </div>
            <div className="text-xs text-slate-500 font-medium">Today</div>
          </div>
        </div>

        {/* Metric 2: Yesterday */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
            <ArrowUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              1,620 L
            </div>
            <div className="text-xs text-slate-500 font-medium">Yesterday</div>
          </div>
        </div>

        {/* Metric 3: Weekly Saving */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#159947] flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#159947] font-['Space_Grotesk']">
              2,800 L
            </div>
            <div className="text-xs text-slate-500 font-medium">Weekly Saving</div>
          </div>
        </div>

        {/* Metric 4: AI-Estimated Saving */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              18%
            </div>
            <div className="text-xs text-slate-500 font-medium">AI-Estimated Saving</div>
          </div>
        </div>

      </div>

      {/* Charts Grid: Daily Water Usage (Left) + Water Saving Donut (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Chart: Daily Water Usage (~8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="font-bold text-sm text-slate-900 font-['Space_Grotesk']">
              Daily Water Usage
            </h3>
            
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-slate-400" />
                Traditional Irrigation
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-[#159947]" />
                AI Smart Irrigation
              </span>
            </div>
          </div>

          <div className="h-56 sm:h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={USAGE_BAR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 3000]} 
                  ticks={[0, 1000, 2000, 3000]}
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
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
                <Bar dataKey="traditional" name="Traditional" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="smartAI" name="AI Smart" fill="#159947" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Water Saving Donut (~4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-sm text-slate-900 font-['Space_Grotesk'] mb-2">
            Water Saving
          </h3>

          <div className="relative h-44 w-full flex items-center justify-center my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#159947" />
                  <Cell fill="#e2e8f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered 21% Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 font-['Space_Grotesk']">
                21%
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Traditional:</span>
              <span className="font-medium text-slate-900">10,500 L/week</span>
            </div>
            <div className="flex justify-between">
              <span>AI Smart:</span>
              <span className="font-medium text-slate-900">8,300 L/week</span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-[#159947]">
              <span>Saved:</span>
              <span>2,200 L (21%)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
