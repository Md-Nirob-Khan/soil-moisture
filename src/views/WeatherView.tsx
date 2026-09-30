import React, { useState } from 'react';
import { 
  MapPin, 
  Sun, 
  CloudRain, 
  Cloud, 
  CloudSun,
  CloudLightning,
  Lightbulb,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Farm, WeatherDaily, WeatherHourly, WeatherLocationSource } from '../types';
import { irrigationDecisionStyle } from '../services/weather';

interface WeatherViewProps {
  currentFarm: Farm;
  hourly: WeatherHourly[];
  daily: WeatherDaily[];
  isLoading: boolean;
  error: string | null;
  locationSource: WeatherLocationSource | null;
  onRetry: () => void;
  insightLiters?: number;
}

const WEATHER_ICONS = {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  SunMedium: Sun,
  CloudMoon: Cloud,
  Moon: Cloud,
} as const;

export const WeatherView: React.FC<WeatherViewProps> = ({
  currentFarm,
  hourly,
  daily,
  isLoading,
  error,
  locationSource,
  onRetry,
  insightLiters = 320,
}) => {
  const [activeTab, setActiveTab] = useState<'24hours' | '7days'>('24hours');

  const currentRows = activeTab === '24hours'
    ? hourly.map((row) => ({
        time: row.time,
        weather: row.condition,
        temp: String(row.temperature),
        rainChance: `${row.rainProbability}%`,
        humidity: `${row.humidity}%`,
        soilMoisture: `${row.soilMoisture}%`,
        decision: row.aiDecision,
        decisionStyle: irrigationDecisionStyle(row.aiDecision),
        icon: WEATHER_ICONS[row.iconName as keyof typeof WEATHER_ICONS] ?? Cloud,
        iconColor: row.iconName.includes('Rain') || row.iconName.includes('Lightning')
          ? 'text-blue-500'
          : row.iconName.includes('Sun')
            ? 'text-amber-500'
            : 'text-slate-400',
      }))
    : daily.map((row) => ({
        time: row.day,
        weather: row.condition,
        temp: `${row.tempHigh} / ${row.tempLow}`,
        rainChance: `${row.rainProbability}%`,
        humidity: `${row.humidity}%`,
        soilMoisture: `${row.soilMoisture}%`,
        decision: row.recommendation,
        decisionStyle: irrigationDecisionStyle(
          row.rainProbability >= 70 ? 'Skip irrigation' : row.rainProbability >= 45 ? 'Delay' : 'Monitor'
        ),
        icon: WEATHER_ICONS[row.iconName as keyof typeof WEATHER_ICONS] ?? Cloud,
        iconColor: row.iconName.includes('Rain') || row.iconName.includes('Lightning')
          ? 'text-blue-500'
          : row.iconName.includes('Sun')
            ? 'text-amber-500'
            : 'text-slate-400',
      }));

  const maxRain = Math.max(
    0,
    ...(activeTab === '24hours' ? hourly.map((row) => row.rainProbability) : daily.map((row) => row.rainProbability))
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Top Bar: Location & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-base font-bold text-slate-900">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>{currentFarm.location || 'Beaumont, TX'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 ml-5">
            {locationSource === 'geolocation'
              ? 'Using your browser location'
              : 'Using saved farm coordinates'}
          </p>
        </div>

        {/* Next 24 Hours / Next 7 Days tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('24hours')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === '24hours'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Next 24 Hours
          </button>
          <button
            onClick={() => setActiveTab('7days')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === '7days'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Next 7 Days
          </button>
        </div>
      </div>

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-start gap-2 text-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">{error}</p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-bold text-red-700 hover:bg-red-100 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
              <tr>
                <th className="px-5 py-3 font-semibold">{activeTab === '24hours' ? 'Time' : 'Day'}</th>
                <th className="px-5 py-3 font-semibold">Weather</th>
                <th className="px-5 py-3 font-semibold">Temp (°C)</th>
                <th className="px-5 py-3 font-semibold">Humidity</th>
                <th className="px-5 py-3 font-semibold">Rain Chance</th>
                <th className="px-5 py-3 font-semibold">Soil Moisture</th>
                <th className="px-5 py-3 font-semibold">AI Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {isLoading && currentRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-xs font-semibold">Loading live Open-Meteo forecast…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && currentRows.length === 0 && !error && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-xs text-slate-500 font-medium">
                    No forecast rows available.
                  </td>
                </tr>
              )}
              {currentRows.map((row, idx) => {
                const Icon = row.icon;
                return (
                  <tr key={`${row.time}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {row.time}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${row.iconColor}`} />
                        <span>{row.weather}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">
                      {row.temp}
                    </td>
                    <td className="px-5 py-3.5 font-medium">
                      {row.humidity}
                    </td>
                    <td className="px-5 py-3.5 font-medium">
                      {row.rainChance}
                    </td>
                    <td className="px-5 py-3.5 font-medium">
                      {row.soilMoisture}
                    </td>
                    <td className={`px-5 py-3.5 ${row.decisionStyle}`}>
                      {row.decision}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insight Callout Card */}
      <div className="bg-[#fffbeb] rounded-2xl p-4 border border-amber-200 shadow-xs flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-amber-900 font-['Space_Grotesk']">
            AI Insight
          </div>
          <div className="text-xs sm:text-sm text-amber-950 mt-0.5 leading-snug">
            {maxRain >= 45 ? (
              <>
                Waiting until after the predicted rainfall could save approximately <strong>{insightLiters}–{insightLiters + 130} liters</strong> of water today.
              </>
            ) : (
              <>
                Rain chance peaks at <strong>{maxRain}%</strong>. Monitor soil moisture and irrigate only if levels stay below the crop target band.
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
