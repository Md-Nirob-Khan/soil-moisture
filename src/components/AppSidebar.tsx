import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Layers, 
  CloudSun, 
  BarChart3, 
  Bell, 
  Sparkles, 
  Settings, 
  Sprout, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Building2,
  X,
  Presentation
} from 'lucide-react';
import { AppView, Farm } from '../types';

interface AppSidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  unreadAlertsCount: number;
  currentFarm: Farm;
  onSwitchFarm: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  unreadAlertsCount,
  currentFarm,
  onSwitchFarm,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'all-steps' as AppView, label: '10-Step Showcase', icon: Presentation, badgeText: 'UX' },
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'farm-map' as AppView, label: 'Farm Map', icon: Map },
    { id: 'zone-detail' as AppView, label: 'Zones & Telemetry', icon: Layers },
    { id: 'irrigation-control' as AppView, label: 'Irrigation Control', icon: Sprout },
    { id: 'weather' as AppView, label: 'Weather Forecast', icon: CloudSun },
    { id: 'analytics' as AppView, label: 'Water Analytics', icon: BarChart3 },
    { id: 'alerts' as AppView, label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'ai-assistant' as AppView, label: 'AI Assistant', icon: Sparkles, badgeText: 'AI' },
    { id: 'settings' as AppView, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0D2B36] text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#159947] flex items-center justify-center text-white shadow-md shadow-[#159947]/30">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-white font-['Space_Grotesk']">AgriAI</span>
                <span className="text-[10px] font-semibold bg-[#159947]/30 text-[#4ade80] px-1.5 py-0.5 rounded">v2.4</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none">Smarter Water. Greener Tomorrow.</p>
            </div>
          </div>
          <button 
            onClick={onCloseMobile} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Farm Quick Card */}
        <div className="p-4 mx-3 mt-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#159947]" /> Active Farm
            </span>
            <button 
              onClick={onSwitchFarm}
              className="text-[11px] text-[#4ade80] hover:text-white transition-colors underline font-medium cursor-pointer"
            >
              Switch
            </button>
          </div>
          <div className="font-semibold text-sm text-white truncate">{currentFarm.name}</div>
          <div className="text-xs text-slate-400 truncate">{currentFarm.location} • {currentFarm.acres} acres</div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-[#159947] text-white shadow-sm shadow-[#159947]/40' 
                    : 'text-slate-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-white text-[#159947]' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.badgeText && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badgeText}
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-400'
                  }`} />
                </div>
              </button>
            );
          })}
        </nav>

        {/* System Status & Sign Out */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">IoT Gateways</span>
            </div>
            <span className="text-[#4ade80] font-semibold text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Online
            </span>
          </div>

          <button
            id="sidebar-signout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
