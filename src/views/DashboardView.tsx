import React from 'react';
import { 
  Droplets, 
  Thermometer, 
  Cloud, 
  CloudRain, 
  Container, 
  Activity, 
  ArrowUpRight, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
  TrendingDown,
  Layers,
  ChevronRight
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
import { 
  Farm, 
  FarmZone, 
  SensorData, 
  AIRecommendation, 
  DecisionLogEntry,
  SoilMoistureTrendPoint,
} from '../types';
import { MetricCard } from '../components/MetricCard';
import { AIRecommendationCard } from '../components/AIRecommendationCard';
import { DecisionHistoryTable } from '../components/DecisionHistoryTable';
import { SOIL_MOISTURE_24H_DATA } from '../data/mockData';

interface DashboardViewProps {
  currentFarm: Farm;
  selectedZone: FarmZone;
  sensorData: SensorData;
  recommendation: AIRecommendation;
  decisionLogs: DecisionLogEntry[];
  onAcceptRecommendation: () => void;
  onModifySchedule: () => void;
  onIrrigateNow: () => void;
  onOpenExplainability: () => void;
  onSelectZone: (zone: FarmZone) => void;
  onNavigateToZones: () => void;
  onNavigateToIrrigation: () => void;
  hasAcceptedRecommendation: boolean;
  weatherLoading?: boolean;
  weatherError?: string | null;
  onRetryWeather?: () => void;
  soilTrend?: SoilMoistureTrendPoint[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentFarm,
  selectedZone,
  sensorData,
  recommendation,
  decisionLogs,
  onAcceptRecommendation,
  onModifySchedule,
  onIrrigateNow,
  onOpenExplainability,
  onSelectZone,
  onNavigateToZones,
  onNavigateToIrrigation,
  hasAcceptedRecommendation,
  weatherLoading = false,
  weatherError = null,
  onRetryWeather,
  soilTrend,
}) => {
  const moistureStatus = sensorData.soilMoisture < 20
    ? { status: 'Critical', statusType: 'critical' as const }
    : sensorData.soilMoisture < 35
      ? { status: 'Low', statusType: 'warning' as const }
      : { status: 'Normal', statusType: 'normal' as const };

  const tempStatus = sensorData.temperature >= 33
    ? { status: 'High', statusType: 'warning' as const }
    : sensorData.temperature <= 10
      ? { status: 'Low', statusType: 'info' as const }
      : { status: 'Normal', statusType: 'normal' as const };

  const humidityStatus = sensorData.humidity >= 40 && sensorData.humidity <= 75
    ? { status: 'Normal', statusType: 'normal' as const }
    : sensorData.humidity > 75
      ? { status: 'High', statusType: 'info' as const }
      : { status: 'Low', statusType: 'warning' as const };

  const rainStatus = sensorData.rainProbability >= 60
    ? { status: 'High', statusType: 'info' as const }
    : sensorData.rainProbability >= 30
      ? { status: 'Moderate', statusType: 'info' as const }
      : { status: 'Low', statusType: 'normal' as const };

  const chartData = soilTrend && soilTrend.length > 0 ? soilTrend : SOIL_MOISTURE_24H_DATA;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {weatherError && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-start gap-2 text-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              Live weather could not be loaded. {weatherError}
            </p>
          </div>
          {onRetryWeather && (
            <button
              type="button"
              onClick={onRetryWeather}
              className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-bold text-red-700 hover:bg-red-100 cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* 4. MAIN DASHBOARD: KPI Cards in Horizontal Grid (Mandated by prompt) */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          {/* Soil Moisture */}
          <MetricCard
            id="kpi-soil-moisture"
            label="Soil Moisture"
            value={sensorData.soilMoisture}
            unit="%"
            status={weatherLoading ? 'Loading' : moistureStatus.status}
            statusType={weatherLoading ? 'info' : moistureStatus.statusType}
            icon={Droplets}
            subtext="Target: 40–60%"
            onClick={onNavigateToZones}
            isLoading={weatherLoading}
          />

          {/* Temperature */}
          <MetricCard
            id="kpi-temperature"
            label="Temperature"
            value={sensorData.temperature}
            unit="°C"
            status={weatherLoading ? 'Loading' : tempStatus.status}
            statusType={weatherLoading ? 'info' : tempStatus.statusType}
            icon={Thermometer}
            subtext="Ambient (Open-Meteo)"
            isLoading={weatherLoading}
          />

          {/* Humidity */}
          <MetricCard
            id="kpi-humidity"
            label="Humidity"
            value={sensorData.humidity}
            unit="%"
            status={weatherLoading ? 'Loading' : humidityStatus.status}
            statusType={weatherLoading ? 'info' : humidityStatus.statusType}
            icon={Cloud}
            subtext="Relative humidity"
            isLoading={weatherLoading}
          />

          {/* Rain Probability */}
          <MetricCard
            id="kpi-rain-prob"
            label="Rain Probability"
            value={sensorData.rainProbability}
            unit="%"
            status={weatherLoading ? 'Loading' : rainStatus.status}
            statusType={weatherLoading ? 'info' : rainStatus.statusType}
            icon={CloudRain}
            subtext="In next 6 hours"
            isLoading={weatherLoading}
          />

          {/* Water Tank */}
          <MetricCard
            id="kpi-water-tank"
            label="Water Tank"
            value={sensorData.waterTankLevel}
            unit="%"
            status="Full"
            statusType="success"
            icon={Container}
            subtext="18,400 / 25,000 L"
          />

          {/* System Status */}
          <MetricCard
            id="kpi-system-status"
            label="System Status"
            value="Online"
            status="Normal"
            statusType="normal"
            icon={Activity}
            subtext="All systems normal"
          />

        </div>
      </section>

      {/* AI Recommendation + Sprout Image Quote Banner (Matching Photo Layout) */}
      <section aria-label="AI Recommendation & Farm Quote" className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: AI Recommendation Card */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <AIRecommendationCard
            recommendation={recommendation}
            onAccept={onAcceptRecommendation}
            onModify={onModifySchedule}
            onIrrigateNow={onIrrigateNow}
            onWhyThis={onOpenExplainability}
            hasAccepted={hasAcceptedRecommendation}
          />
        </div>

        {/* Right Column: Sprout Photo with Quote */}
        <div className="lg:col-span-5 xl:col-span-4 relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 min-h-[260px] bg-slate-900 group">
          <img
            src="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80"
            alt="Sprouting plant in rich soil"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute bottom-5 right-5 text-right text-white">
            <p className="text-xl sm:text-2xl font-bold font-serif italic tracking-wide leading-tight drop-shadow-md">
              "Right water,<br />
              Right time,<br />
              Brighter tomorrow."
            </p>
          </div>
        </div>
      </section>

      {/* Grid: Soil Moisture Trend Line Chart + Quick XAI & Zone Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column (8 cols): Soil Moisture Trend Line Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-['Space_Grotesk']">
                  Soil Moisture Trend – Last 24 Hours
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedZone.name} ({selectedZone.cropType}) telemetry & predictive decay model
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-0.5 bg-[#159947] rounded-full" />
                  Moisture (%)
                </span>
                <span className="flex items-center gap-1.5 text-red-600 font-medium">
                  <span className="w-3 h-0.5 bg-red-500 border-b border-dashed border-red-500" />
                  Critical Limit (20%)
                </span>
              </div>
            </div>

            {/* Recharts Line Chart */}
            <div className="h-64 sm:h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 60]} 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0D2B36', 
                      borderRadius: '12px', 
                      border: 'none', 
                      color: '#FFFFFF',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                    itemStyle={{ color: '#4ade80' }}
                  />
                  {/* Dashed Red Critical Threshold Line at 20% (Mandated by prompt) */}
                  <ReferenceLine 
                    y={20} 
                    stroke="#EF4444" 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                    label={{ 
                      value: 'Critical Threshold 20%', 
                      position: 'insideBottomRight', 
                      fill: '#DC2626', 
                      fontSize: 10,
                      fontWeight: 'bold' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="moisture" 
                    name="Soil Moisture"
                    stroke="#159947" 
                    strokeWidth={3} 
                    dot={{ fill: '#159947', r: 4 }} 
                    activeDot={{ r: 6, fill: '#4ade80', stroke: '#0D2B36', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Prediction Callout (Mandated by prompt Section 9) */}
          <div className="mt-5 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wide font-['Space_Grotesk']">
                AI Prediction
              </div>
              <div className="text-xs sm:text-sm font-semibold text-amber-950 mt-0.5">
                “Soil moisture is currently {sensorData.soilMoisture}% with {sensorData.rainProbability}% rain probability in the next 6 hours.”
              </div>
              <div className="text-[11px] text-amber-800 mt-1">
                Live Open-Meteo soil and precipitation data is used to decide whether to delay irrigation.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Zone Statuses & Explainability Snapshot */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Farm Zones Quick Switcher Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#159947]" />
                Farm Zones Overview
              </h3>
              <button 
                onClick={onNavigateToZones}
                className="text-xs font-semibold text-[#159947] hover:underline cursor-pointer"
              >
                View Map
              </button>
            </div>

            <div className="space-y-2.5">
              {currentFarm.zones.map((zone) => {
                const isSelected = selectedZone.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => onSelectZone(zone)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#159947] bg-[#EAF8EF]/50 ring-1 ring-[#159947]/30'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{zone.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {zone.cropType} • {zone.areaAcres} acres
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-900 font-['Space_Grotesk']">
                        {zone.soilMoisture}%
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                        zone.status === 'critical' ? 'bg-red-100 text-red-700' :
                        zone.status === 'dry' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {zone.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explainability Mini Card */}
          <div className="bg-gradient-to-br from-slate-900 to-[#0D2B36] rounded-2xl p-5 text-white shadow-xs border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-[#4ade80]">
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-['Space_Grotesk']">
                Explainable AI (XAI)
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">
              Why {recommendation.actionType === 'delay' ? `delay irrigation ${recommendation.delayHours} hours?` : 'this irrigation plan?'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Cross-referencing live radar ({sensorData.rainProbability}% rain prob.) with {sensorData.soilMoisture}% soil moisture {recommendation.estimatedWaterSavedLiters > 0 ? `can save ${recommendation.estimatedWaterSavedLiters} liters.` : 'guides the current valve plan.'}
            </p>
            <button
              onClick={onOpenExplainability}
              className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
            >
              <span>Inspect Factor Contributions</span>
              <ChevronRight className="w-4 h-4 text-[#4ade80]" />
            </button>
          </div>

        </div>

      </div>

      {/* 7. HUMAN-IN-THE-LOOP DECISION LOG TABLE (Mandated by prompt) */}
      <section aria-label="Decision Audit Log">
        <DecisionHistoryTable entries={decisionLogs} />
      </section>

    </div>
  );
};
