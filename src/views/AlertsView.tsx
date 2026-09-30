import React from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Check, 
  CloudRain
} from 'lucide-react';
import { AlertItem } from '../types';

interface AlertsViewProps {
  alerts: AlertItem[];
  onInspectZone: (zoneId: string) => void;
  onStartIrrigationForZone: (zoneId: string) => void;
  onDismissAlert: (id: string) => void;
  onAcknowledgeAll: () => void;
  onViewWeather?: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onStartIrrigationForZone,
  onDismissAlert,
  onViewWeather,
}) => {
  // 4 Alerts matching photo
  const photoAlerts = [
    {
      id: 'alert-1',
      type: 'critical',
      icon: AlertCircle,
      iconBg: 'bg-red-500',
      iconColor: 'text-white',
      borderColor: 'border-red-200',
      title: 'Critical: Low Soil Moisture in Zone 3',
      message: 'Soil moisture has dropped to 28%, below the critical threshold.',
      time: '10 mins ago',
      action: 'Irrigate',
      actionType: 'irrigate',
      zoneId: 'zone-3'
    },
    {
      id: 'alert-2',
      type: 'warning',
      icon: AlertTriangle,
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
      borderColor: 'border-amber-200',
      title: 'High Temperature Warning',
      message: 'Ambient temperature has reached 33°C. Evaporation rate is increased.',
      time: '1 hour ago',
      action: 'Dismiss',
      actionType: 'dismiss',
    },
    {
      id: 'alert-3',
      type: 'success',
      icon: Check,
      iconBg: 'bg-[#159947]',
      iconColor: 'text-white',
      borderColor: 'border-emerald-200',
      title: 'Irrigation Completed',
      message: 'Zone 1 irrigation cycle completed successfully. 420 liters delivered.',
      time: '3 hours ago',
      action: null,
      actionType: 'none',
    },
    {
      id: 'alert-4',
      type: 'info',
      icon: CloudRain,
      iconBg: 'bg-blue-500',
      iconColor: 'text-white',
      borderColor: 'border-blue-200',
      title: 'Weather Update: Rain Expected',
      message: '80% probability of rain at 6:00 PM. AI recommendation updated.',
      time: '5 hours ago',
      action: 'View',
      actionType: 'weather',
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* 4 Alert Cards List Matching Photo */}
      <div className="space-y-3">
        {photoAlerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border ${alert.borderColor} shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-8 h-8 rounded-full ${alert.iconBg} ${alert.iconColor} flex items-center justify-center shrink-0 mt-0.5 shadow-xs`}>
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-['Space_Grotesk']">
                    {alert.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    {alert.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 ml-11 sm:ml-0">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  {alert.time}
                </span>

                {alert.action === 'Irrigate' && (
                  <button
                    type="button"
                    onClick={() => onStartIrrigationForZone('zone-3')}
                    className="px-3.5 py-1.5 rounded-xl border border-[#159947] text-[#159947] hover:bg-[#159947] hover:text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Irrigate
                  </button>
                )}

                {alert.action === 'Dismiss' && (
                  <button
                    type="button"
                    onClick={() => onDismissAlert(alert.id)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                )}

                {alert.action === 'View' && (
                  <button
                    type="button"
                    onClick={onViewWeather}
                    className="px-3.5 py-1.5 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    View
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
