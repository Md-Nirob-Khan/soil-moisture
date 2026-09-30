import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Crosshair, 
  Map as MapIcon, 
  Search, 
  Layers, 
  Plus, 
  Minus, 
  Check, 
  RefreshCw, 
  Satellite, 
  Radio, 
  AlertCircle,
  Compass,
  Navigation
} from 'lucide-react';

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  accuracy?: number;
  elevation?: number;
  method: 'manual' | 'gps' | 'maps';
}

interface FarmLocationSelectorProps {
  initialLocation: string;
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (data: LocationData) => void;
}

// Notable agricultural preset regions for rapid selection
const AG_REGIONS = [
  { name: 'Austin Hill Country, TX', lat: 30.2672, lng: -97.7431, desc: 'Vineyards & Orchard Land' },
  { name: 'Central Valley, CA', lat: 36.7468, lng: -119.7726, desc: 'Almond & Citrus Belt' },
  { name: 'Salinas Valley, CA', lat: 36.6777, lng: -121.6555, desc: 'Salad Bowl of the World' },
  { name: 'Willamette Valley, OR', lat: 44.9429, lng: -123.0351, desc: 'Berries & Hazelnut Orchards' },
  { name: 'Yakima Valley, WA', lat: 46.6021, lng: -120.5059, desc: 'Apples, Hops & Cherries' },
  { name: 'Rio Grande Valley, TX', lat: 26.2034, lng: -98.2300, desc: 'Citrus & Vegetable Fields' },
];

export const FarmLocationSelector: React.FC<FarmLocationSelectorProps> = ({
  initialLocation,
  initialLat = 30.2672,
  initialLng = -97.7431,
  onLocationChange,
}) => {
  const [activeTab, setActiveTab] = useState<'gps' | 'maps' | 'manual'>('maps');
  
  // Current coordinates & address
  const [currentAddress, setCurrentAddress] = useState(initialLocation || 'Austin, TX');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });

  // GPS State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsAltitude, setGpsAltitude] = useState<number | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  // Online Map State
  const [mapZoom, setMapZoom] = useState(13);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [mapLayer, setMapLayer] = useState<'satellite' | 'street'>('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);

  // Dragging state for map canvas
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; centerLat: number; centerLng: number }>({
    x: 0,
    y: 0,
    centerLat: initialLat,
    centerLng: initialLng,
  });

  // Notify parent of location changes
  const emitLocation = useCallback((address: string, lat: number, lng: number, method: 'manual' | 'gps' | 'maps', accuracy?: number, elevation?: number) => {
    setCurrentAddress(address);
    setCoords({ lat, lng });
    onLocationChange({
      address,
      lat,
      lng,
      accuracy,
      elevation,
      method,
    });
  }, [onLocationChange]);

  // GPS Geolocation Handler
  const handleAcquireGps = () => {
    setGpsLoading(true);
    setGpsError(null);
    setGpsSuccess(false);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser environment.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude } = position.coords;
        setGpsAccuracy(Math.round(accuracy));
        setGpsAltitude(altitude ? Math.round(altitude) : 142);
        setCoords({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });

        // Reverse geocoding attempt
        let resolvedAddress = `GPS Field Fix: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°W`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.county || 'Field Site';
              const state = data.address.state || data.address.country || '';
              resolvedAddress = `${city}${state ? `, ${state}` : ''} (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°W)`;
            }
          }
        } catch {
          // Fallback to formatted coordinates string
        }

        emitLocation(resolvedAddress, latitude, longitude, 'gps', Math.round(accuracy), altitude ? Math.round(altitude) : undefined);
        setGpsLoading(false);
        setGpsSuccess(true);
      },
      (error) => {
        setGpsLoading(false);
        let errorMsg = 'Could not acquire GPS fix.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'GPS permission denied. Enable browser location permission or use Simulated RTK-GPS below.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Satellite signal unavailable. Try simulated agricultural GPS.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'GPS request timed out. Satellites taking too long to respond.';
        }
        setGpsError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Simulated RTK-GPS handler (for testing when indoor / permission denied)
  const handleSimulateRtkGps = (presetIndex = 0) => {
    const preset = AG_REGIONS[presetIndex];
    // Add realistic jitter to simulate active field RTK GPS antenna
    const lat = preset.lat + (Math.random() * 0.005 - 0.0025);
    const lng = preset.lng + (Math.random() * 0.005 - 0.0025);
    const acc = Number((1.2 + Math.random() * 1.5).toFixed(1)); // 1.2 to 2.7 meters RTK accuracy
    const elev = Math.floor(120 + Math.random() * 80);

    setGpsAccuracy(acc);
    setGpsAltitude(elev);
    setCoords({ lat, lng });
    setMapCenter({ lat, lng });
    setGpsError(null);
    setGpsSuccess(true);

    const addr = `${preset.name} (RTK-GPS: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°W)`;
    emitLocation(addr, lat, lng, 'gps', acc, elev);
  };

  // Search Address on Online Maps
  const handleSearchAddress = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=4`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        if (data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          setMapCenter({ lat, lng });
          setCoords({ lat, lng });
          emitLocation(first.display_name.split(',').slice(0, 3).join(','), lat, lng, 'maps');
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsSearching(false);
    }
  };

  // Select Search Result
  const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMapCenter({ lat, lng });
    setCoords({ lat, lng });
    const formatted = result.display_name.split(',').slice(0, 3).join(',');
    emitLocation(formatted, lat, lng, 'maps');
    setSearchResults([]);
    setSearchQuery(formatted);
  };

  // Map Click to Set Location Pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    if (!mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = clickX - centerX;
    const deltaY = clickY - centerY;

    // Convert pixel offset to lat/lng degrees based on zoom level
    const zoomScale = Math.pow(2, 18 - mapZoom);
    const degreesPerPixelLng = 0.000005 * zoomScale;
    const degreesPerPixelLat = 0.000004 * zoomScale;

    const newLng = mapCenter.lng + deltaX * degreesPerPixelLng;
    const newLat = mapCenter.lat - deltaY * degreesPerPixelLat;

    setCoords({ lat: newLat, lng: newLng });
    const addr = `Field Coordinates: ${newLat.toFixed(4)}°N, ${newLng.toFixed(4)}°W`;
    emitLocation(addr, newLat, newLng, 'maps');
  };

  // Mouse drag handling to pan map
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      centerLat: mapCenter.lat,
      centerLng: mapCenter.lng,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      setIsDragging(true);
      const zoomScale = Math.pow(2, 18 - mapZoom);
      const degreesPerPixelLng = 0.000005 * zoomScale;
      const degreesPerPixelLat = 0.000004 * zoomScale;

      setMapCenter({
        lng: dragStartRef.current.centerLng - deltaX * degreesPerPixelLng,
        lat: dragStartRef.current.centerLat + deltaY * degreesPerPixelLat,
      });
    }
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Location Method Selector Tabs */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
          Farm Location Acquisition
        </label>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          Precision Telemetry Ready
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('maps')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'maps'
              ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Online Maps</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gps')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'gps'
              ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Load with GPS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Manual Text</span>
        </button>
      </div>

      {/* 2. TAB CONTENT */}

      {/* TAB A: ONLINE MAPS */}
      {activeTab === 'maps' && (
        <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          
          {/* Map Search Bar */}
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchAddress(e);
                  }
                }}
                placeholder="Search farm address, county, or city..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159947] bg-slate-50"
              />
            </div>
            <button
              type="button"
              onClick={handleSearchAddress}
              disabled={isSearching}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </div>

          {/* Search suggestions dropdown */}
          {searchResults.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg divide-y divide-slate-100 z-30">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{res.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Map Interactive Canvas */}
          <div className="relative h-60 w-full rounded-xl overflow-hidden border border-slate-300 bg-slate-900 select-none">
            
            {/* Map Background Layer (Satellite or Topographic / Grid) */}
            <div
              ref={mapContainerRef}
              onClick={handleMapClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              className="w-full h-full cursor-crosshair relative overflow-hidden"
              style={{
                backgroundImage: mapLayer === 'satellite'
                  ? `radial-gradient(circle at 50% 50%, rgba(20,83,45,0.4), rgba(5,33,21,0.9)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80')`
                  : `radial-gradient(circle at 50% 50%, rgba(230,245,235,0.9), rgba(200,230,215,0.9))`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Field Grid Pattern overlay for cartographic precision */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />

              {/* Pin Marker (Center Field Pin) */}
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none transition-transform duration-200"
              >
                <div className="relative flex flex-col items-center">
                  <div className="px-2.5 py-1 rounded-full bg-emerald-900/90 text-white text-[10px] font-bold shadow-lg whitespace-nowrap mb-1 border border-emerald-400/50 flex items-center gap-1">
                    <Crosshair className="w-3 h-3 text-emerald-400" />
                    <span>Farm Field Center</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
                    <MapPin className="w-5 h-5 fill-current" />
                  </div>
                  <div className="w-3 h-1.5 bg-black/40 rounded-full blur-[1px] mt-0.5" />
                </div>
              </div>

              {/* Field Radius Ring */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-emerald-400/60 bg-emerald-400/10 pointer-events-none animate-pulse" />

              {/* Top Map Controls */}
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 text-white text-[10px]">
                <Compass className="w-3 h-3 text-emerald-400" />
                <span>Click map to place farm pin</span>
              </div>

              {/* Layer Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMapLayer(prev => prev === 'satellite' ? 'street' : 'satellite');
                }}
                className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Toggle Satellite / Terrain"
              >
                <Satellite className="w-3.5 h-3.5 text-emerald-400" />
                <span>{mapLayer === 'satellite' ? 'Satellite' : 'Topo'}</span>
              </button>

              {/* Zoom In / Out Controls */}
              <div className="absolute bottom-2.5 right-2.5 z-10 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapZoom(z => Math.min(18, z + 1));
                  }}
                  className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Zoom in"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapZoom(z => Math.max(8, z - 1));
                  }}
                  className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Zoom out"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Lat/Lng Readout */}
              <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 text-white text-[10px] font-mono flex items-center gap-2">
                <span>Lat: {coords.lat.toFixed(5)}°</span>
                <span>•</span>
                <span>Lng: {coords.lng.toFixed(5)}°</span>
              </div>
            </div>

          </div>

          {/* Quick Agricultural Preset Regions */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
              Quick Agricultural Regions:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {AG_REGIONS.slice(0, 3).map((reg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMapCenter({ lat: reg.lat, lng: reg.lng });
                    setCoords({ lat: reg.lat, lng: reg.lng });
                    emitLocation(reg.name, reg.lat, reg.lng, 'maps');
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 text-left transition-colors cursor-pointer group"
                >
                  <span className="block text-[11px] font-bold text-slate-800 group-hover:text-emerald-900 truncate">
                    {reg.name.split(',')[0]}
                  </span>
                  <span className="block text-[9px] text-slate-500 truncate">
                    {reg.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB B: LOAD WITH GPS */}
      {activeTab === 'gps' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
          
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>On-Site GPS Satellite Geolocation</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically loads real-time coordinates and boundary telemetry from your device's GPS antenna.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shrink-0">
              WGS-84 / RTK
            </span>
          </div>

          {/* Acquire GPS Button */}
          <button
            type="button"
            onClick={handleAcquireGps}
            disabled={gpsLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold shadow-sm shadow-emerald-700/20 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {gpsLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Acquiring Satellite Lock (Pinging GPS)...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Acquire Current GPS Location</span>
              </>
            )}
          </button>

          {/* GPS Success Card */}
          {gpsSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  GPS Coordinates Locked
                </span>
                <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full">
                  Signal Active
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-200/60 text-emerald-800 font-mono">
                <div>
                  <span className="text-emerald-600 block text-[9px] font-sans uppercase">Latitude</span>
                  <span>{coords.lat.toFixed(6)}° N</span>
                </div>
                <div>
                  <span className="text-emerald-600 block text-[9px] font-sans uppercase">Longitude</span>
                  <span>{coords.lng.toFixed(6)}° W</span>
                </div>
                <div>
                  <span className="text-emerald-600 block text-[9px] font-sans uppercase">Accuracy Radius</span>
                  <span>± {gpsAccuracy || 3.2} meters</span>
                </div>
                <div>
                  <span className="text-emerald-600 block text-[9px] font-sans uppercase">Field Elevation</span>
                  <span>{gpsAltitude || 148} m AMSL</span>
                </div>
              </div>
            </div>
          )}

          {/* GPS Error Card & Simulation Fallback */}
          {gpsError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Browser GPS Alert</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {gpsError}
              </p>
              <div className="pt-1">
                <span className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                  Load Precision Agricultural RTK-GPS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {AG_REGIONS.map((reg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSimulateRtkGps(idx)}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      {reg.name.split(',')[0]} (RTK)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Standard Simulator Button if not tested yet */}
          {!gpsSuccess && !gpsError && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">Indoor or testing on desktop?</span>
              <button
                type="button"
                onClick={() => handleSimulateRtkGps(0)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                Load Simulated RTK-GPS Station
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB C: MANUAL TEXT INPUT */}
      {activeTab === 'manual' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location Name / City, State
            </label>
            <input
              type="text"
              value={currentAddress}
              onChange={(e) => {
                const val = e.target.value;
                emitLocation(val, coords.lat, coords.lng, 'manual');
              }}
              placeholder="e.g. Austin, TX or Sonoma County, CA"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159947] bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Custom Latitude (opt)
              </label>
              <input
                type="number"
                step="0.0001"
                value={coords.lat}
                onChange={(e) => {
                  const lat = parseFloat(e.target.value) || 0;
                  setCoords(prev => ({ ...prev, lat }));
                  emitLocation(currentAddress, lat, coords.lng, 'manual');
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159947]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Custom Longitude (opt)
              </label>
              <input
                type="number"
                step="0.0001"
                value={coords.lng}
                onChange={(e) => {
                  const lng = parseFloat(e.target.value) || 0;
                  setCoords(prev => ({ ...prev, lng }));
                  emitLocation(currentAddress, coords.lat, lng, 'manual');
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159947]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Selected Location Verification Badge */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs">
        <div className="flex items-center gap-2 text-emerald-950 font-medium truncate">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">
            <strong className="font-bold">Active Location:</strong> {currentAddress}
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
          {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
        </span>
      </div>

    </div>
  );
};
