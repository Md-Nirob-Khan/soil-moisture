import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  ChevronDown,
  Compass
} from 'lucide-react';
import { Farm, FarmZone } from '../types';

interface FarmMapViewProps {
  currentFarm: Farm;
  selectedZone: FarmZone;
  onSelectZone: (zone: FarmZone) => void;
  onNavigateToDetail: () => void;
  onNavigateToIrrigation: (zone: FarmZone) => void;
}

export const FarmMapView: React.FC<FarmMapViewProps> = ({
  currentFarm,
  selectedZone,
  onSelectZone,
  onNavigateToDetail,
  onNavigateToIrrigation,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);

  // 4 zones matching photo:
  // Zone 1 Corn (Normal - Green)
  // Zone 2 Lettuce (Dry - Yellow)
  // Zone 3 Tomato (Critical - Red)
  // Zone 4 Pepper (Normal - Green)
  const zonesConfig = [
    {
      id: 'zone-1',
      name: 'Zone 1',
      crop: 'Corn',
      status: 'Normal',
      dotColor: 'bg-emerald-500',
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-500/25',
      textColor: 'text-white',
    },
    {
      id: 'zone-2',
      name: 'Zone 2',
      crop: 'Lettuce',
      status: 'Dry',
      dotColor: 'bg-amber-400',
      borderColor: 'border-amber-400',
      bgColor: 'bg-amber-500/25',
      textColor: 'text-white',
    },
    {
      id: 'zone-3',
      name: 'Zone 3',
      crop: 'Tomato',
      status: 'Critical',
      dotColor: 'bg-red-500',
      borderColor: 'border-red-500',
      bgColor: 'bg-red-500/30',
      textColor: 'text-white',
    },
    {
      id: 'zone-4',
      name: 'Zone 4',
      crop: 'Pepper',
      status: 'Normal',
      dotColor: 'bg-emerald-500',
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-500/25',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Top Header Row matching photo: Green Valley Farm ▾ */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
            className="flex items-center gap-2 text-xl font-bold text-slate-900 hover:text-slate-700 font-['Space_Grotesk'] cursor-pointer"
          >
            <span>{currentFarm.name}</span>
            <ChevronDown className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Main Satellite Map Canvas */}
      <div className="relative w-full h-[520px] sm:h-[600px] rounded-2xl overflow-hidden shadow-md border border-slate-300 bg-slate-900 select-none">
        
        {/* Satellite Map Texture Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')`,
            transform: `scale(${zoomLevel})`
          }}
        />

        {/* Agricultural Pattern Grid Overlay */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />

        {/* Top-Left Compass Rose */}
        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-xs rounded-full p-2.5 shadow-md flex flex-col items-center justify-center border border-slate-200">
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* North Arrow */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-red-600 absolute -top-1" />
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[14px] border-t-slate-400 absolute -bottom-1" />
            <span className="absolute -top-3 text-[10px] font-extrabold text-red-600">N</span>
          </div>
        </div>

        {/* Top-Right Floating Legend Card */}
        <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-lg border border-slate-200 text-xs w-36">
          <div className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">
            Zone Status
          </div>
          <div className="space-y-1.5 font-medium">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span>Dry</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400 shrink-0" />
              <span>Offline</span>
            </div>
          </div>
        </div>

        {/* 4 Interactive Crop Zones on Satellite Grid */}
        <div className="absolute inset-8 sm:inset-12 grid grid-cols-2 grid-rows-2 gap-4 sm:gap-6 z-10">
          {zonesConfig.map((z) => {
            const isTarget = selectedZone.name.toLowerCase().includes(z.crop.toLowerCase());
            return (
              <button
                key={z.id}
                onClick={() => {
                  const matching = currentFarm.zones.find(fz => fz.name.toLowerCase().includes(z.crop.toLowerCase())) || currentFarm.zones[0];
                  onSelectZone(matching);
                  onNavigateToDetail();
                }}
                className={`relative rounded-xl border-3 ${z.borderColor} ${z.bgColor} hover:bg-opacity-40 transition-all duration-200 flex flex-col items-center justify-center p-4 cursor-pointer shadow-lg backdrop-blur-xs group hover:scale-[1.02] ${
                  isTarget ? 'ring-4 ring-white/60' : ''
                }`}
              >
                <div className="bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 text-center border border-white/20 shadow-md">
                  <div className="text-sm sm:text-base font-bold text-white tracking-wide">
                    {z.name}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-200">
                    {z.crop}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-white mt-1">
                    <span className={`w-2 h-2 rounded-full ${z.dotColor}`} />
                    <span>{z.status}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom-Right Floating Zoom Controls (+ / -) */}
        <div className="absolute bottom-4 right-4 z-20 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
            className="p-2 hover:bg-slate-100 text-slate-700 transition-colors border-b border-slate-100 cursor-pointer"
            aria-label="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.85))}
            className="p-2 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            aria-label="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
