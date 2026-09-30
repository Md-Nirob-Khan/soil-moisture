import React, { useState } from 'react';
import { 
  CloudSun, 
  RefreshCw, 
  Bell, 
  User, 
  Menu, 
  ChevronDown, 
  MapPin, 
  Layers, 
  Check, 
  Clock, 
  Sparkles,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { Farm, FarmZone, AlertItem } from '../types';

interface TopHeaderProps {
  currentFarm: Farm;
  selectedZone: FarmZone;
  onSelectZone: (zone: FarmZone) => void;
  onRefreshSensors: () => void;
  isRefreshing: boolean;
  alerts: AlertItem[];
  onOpenAlerts: () => void;
  onToggleMobileMenu: () => void;
  userEmail: string;
  onLogout: () => void;
  onNavigateToAllSteps?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentFarm,
  selectedZone,
  onSelectZone,
  onRefreshSensors,
  isRefreshing,
  alerts,
  onOpenAlerts,
  onToggleMobileMenu,
  userEmail,
  onLogout,
  onNavigateToAllSteps,
}) => {
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left Section: Mobile Menu + Farm & Zone Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  {currentFarm.name}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {currentFarm.location}
                </span>
              </div>
            </div>

            {/* Zone Selector Pill */}
            <div className="relative mt-0.5 sm:mt-0">
              <button
                id="header-zone-selector-btn"
                onClick={() => setZoneDropdownOpen(!zoneDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#159947] bg-[#EAF8EF] hover:bg-[#d8f2e1] px-2.5 py-1 rounded-full border border-[#159947]/30 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{selectedZone.name}</span>
                <ChevronDown className="w-3 h-3 text-[#159947]" />
              </button>

              {/* Zone Dropdown */}
              {zoneDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setZoneDropdownOpen(false)} 
                  />
                  <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-40">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Select Farm Zone
                    </div>
                    {currentFarm.zones.map((zone) => (
                      <button
                        key={zone.id}
                        onClick={() => {
                          onSelectZone(zone);
                          setZoneDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          selectedZone.id === zone.id ? 'bg-[#EAF8EF] font-semibold text-[#159947]' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            zone.status === 'critical' ? 'bg-red-500' :
                            zone.status === 'dry' ? 'bg-amber-500' :
                            zone.status === 'normal' ? 'bg-[#159947]' : 'bg-slate-400'
                          }`} />
                          <span>{zone.name}</span>
                        </div>
                        {selectedZone.id === zone.id && <Check className="w-3.5 h-3.5 text-[#159947]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Weather + Refresh + Alerts + Avatar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Top-Right Weather Status (Mandated by prompt) */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <CloudSun className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <span>31°C</span>
                <span className="text-slate-400 font-normal">•</span>
                <span className="text-slate-600 font-medium">Sunny</span>
              </div>
              <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                <span>Rain chance 80% within 6 hours</span>
              </div>
            </div>
          </div>

          {/* 10-Step Showcase Link */}
          {onNavigateToAllSteps && (
            <button
              onClick={onNavigateToAllSteps}
              title="View all 10 steps from UX design"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#159947] bg-[#EAF8EF] hover:bg-[#d8f2e1] border border-[#159947]/30 rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <span>10 Steps</span>
            </button>
          )}

          {/* Refresh Sensor Data Button */}
          <button
            id="refresh-sensors-header-btn"
            onClick={onRefreshSensors}
            disabled={isRefreshing}
            title="Refresh IoT Sensor Telemetry"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#159947] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Sensors</span>
          </button>

          {/* Notifications / Alerts Button */}
          <button
            id="header-alerts-btn"
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="View Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar & Dropdown */}
          <div className="relative">
            <button
              id="header-user-avatar-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#159947]/30 transition-all"
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0D2B36] to-[#159947] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                PB
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setUserMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Pritam Bhowmick</p>
                    <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-[#159947] text-[10px] font-semibold border border-emerald-200">
                      <Sparkles className="w-3 h-3" /> UX with AI Project Demo
                    </div>
                  </div>
                  <div className="px-2 py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenAlerts();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      System Notifications ({unreadCount} unread)
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
