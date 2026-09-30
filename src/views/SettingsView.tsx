import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Sliders, 
  BellRing, 
  Cpu, 
  Save, 
  Check, 
  HelpCircle,
  Database,
  CloudRain
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [criticalThreshold, setCriticalThreshold] = useState(20);
  const [rainDelayThreshold, setRainDelayThreshold] = useState(70);
  const [autoExecute, setAutoExecute] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#159947]" />
            Agronomic & System Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure AI decision boundaries, sensor polling rates, and Human-in-the-Loop oversight policies.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF8EF] text-[#159947] text-xs font-bold border border-[#159947]/30 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left: AI & Agronomic Thresholds */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-bold text-base text-slate-900 font-['Space_Grotesk'] pb-3 border-b border-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#159947]" />
            AI Rule Engine Parameters
          </h3>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Critical Soil Moisture Threshold (Wilting Point)</span>
              <span className="text-red-600 font-bold">{criticalThreshold}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              If soil moisture dips below this value, the AI triggers an immediate emergency irrigation alert.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Rain Delay Postponement Threshold</span>
              <span className="text-blue-600 font-bold">{rainDelayThreshold}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              value={rainDelayThreshold}
              onChange={(e) => setRainDelayThreshold(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum radar rain chance within 6 hours required to advise postponing irrigation.
            </p>
          </div>

          {/* Human-in-the-Loop Mode Selection */}
          <div className="pt-4 border-t border-slate-100">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-['Space_Grotesk']">
              Human-in-the-Loop Governance
            </span>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="automation-mode"
                  checked={!autoExecute}
                  onChange={() => setAutoExecute(false)}
                  className="mt-0.5 text-[#159947] focus:ring-[#159947]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Semi-Autonomous (Recommended for University Demo)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    AI generates recommendations; physical valve actuation requires human confirmation (Accept/Reject/Modify).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="automation-mode"
                  checked={autoExecute}
                  onChange={() => setAutoExecute(true)}
                  className="mt-0.5 text-[#159947] focus:ring-[#159947]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Full Autonomous Machine-to-Machine (M2M)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Valves automatically switch according to AI decisions unless overridden manually within 10 minutes.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#159947] hover:bg-[#13883f] text-white text-xs font-bold shadow-md shadow-[#159947]/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>

        {/* Right: Notifications & Unit System */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="font-bold text-base text-slate-900 font-['Space_Grotesk'] pb-3 border-b border-slate-100 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-[#159947]" />
              Alert Dispatches
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">SMS Critical Alerts</span>
                  <span className="text-[11px] text-slate-500">Instant SMS for wilting threshold dips</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#159947] rounded border-slate-300 focus:ring-[#159947]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">Email Daily Digest</span>
                  <span className="text-[11px] text-slate-500">Water savings & weather summary</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#159947] rounded border-slate-300 focus:ring-[#159947]"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-['Space_Grotesk']">
                Measurement Units
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUnitSystem('metric')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    unitSystem === 'metric'
                      ? 'bg-[#EAF8EF] text-[#159947] border-[#159947]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Metric (°C, Liters)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem('imperial')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    unitSystem === 'imperial'
                      ? 'bg-[#EAF8EF] text-[#159947] border-[#159947]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Imperial (°F, Gallons)
                </button>
              </div>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
};
