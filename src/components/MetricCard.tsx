import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  label: string;
  value: string | number;
  unit?: string;
  status: string;
  statusType?: 'normal' | 'warning' | 'critical' | 'info' | 'success';
  icon: LucideIcon;
  subtext?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  label,
  value,
  unit,
  status,
  statusType = 'normal',
  icon: Icon,
  subtext,
  onClick,
  isLoading = false,
}) => {
  const getBadgeStyle = () => {
    switch (statusType) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200/50';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-200/50';
      case 'success':
      case 'normal':
        return 'bg-[#EAF8EF] text-[#159947] border-[#159947]/30 ring-1 ring-[#159947]/20';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200/50';
    }
  };

  const getIconContainerStyle = () => {
    switch (statusType) {
      case 'critical':
        return 'bg-red-100/80 text-red-600';
      case 'warning':
        return 'bg-amber-100/80 text-amber-600';
      case 'success':
      case 'normal':
        return 'bg-[#EAF8EF] text-[#159947]';
      case 'info':
      default:
        return 'bg-blue-100/80 text-blue-600';
    }
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-[#159947]/40' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-['Space_Grotesk']">
          {label}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getIconContainerStyle()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-1 min-h-[2.25rem]">
          {isLoading ? (
            <span className="inline-block h-8 w-16 rounded-md bg-slate-100 animate-pulse" />
          ) : (
            <>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
                {value}
              </span>
              {unit && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
            {status}
          </span>
          {subtext && (
            <span className="text-[11px] text-slate-400 font-medium truncate">
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
