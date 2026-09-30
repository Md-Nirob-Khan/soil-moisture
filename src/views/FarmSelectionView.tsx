import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Layers, 
  Sprout, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Building2,
  X,
  Droplets,
  Radio,
  Map as MapIcon,
  Compass,
  ArrowLeft,
  Check,
  Trash2,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';
import { Farm } from '../types';
import { FarmLocationSelector, LocationData } from '../components/FarmLocationSelector';

interface FarmSelectionViewProps {
  farms: Farm[];
  onSelectFarm: (farm: Farm) => void;
  onAddFarm: (newFarm: Omit<Farm, 'id'>) => void;
  onDeleteFarm: (farmId: string) => void;
  onDeleteMultipleFarms?: (farmIds: string[]) => void;
}

export const FarmSelectionView: React.FC<FarmSelectionViewProps> = ({
  farms,
  onSelectFarm,
  onAddFarm,
  onDeleteFarm,
  onDeleteMultipleFarms,
}) => {
  // Navigation tabs: 'my-farms' or 'add-farm'
  const [activeMainTab, setActiveMainTab] = useState<'my-farms' | 'add-farm'>('my-farms');
  
  // Deletion States
  const [farmPendingDelete, setFarmPendingDelete] = useState<Farm | null>(null);
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [selectedFarmIds, setSelectedFarmIds] = useState<string[]>([]);
  const [isConfirmingBulkDelete, setIsConfirmingBulkDelete] = useState(false);

  // Form State
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmLocation, setNewFarmLocation] = useState('Austin, TX');
  const [newFarmCoords, setNewFarmCoords] = useState<{ lat: number; lng: number }>({
    lat: 30.2672,
    lng: -97.7431,
  });
  const [locationMethod, setLocationMethod] = useState<'manual' | 'gps' | 'maps'>('maps');
  const [locationAccuracy, setLocationAccuracy] = useState<number | undefined>(undefined);
  const [newFarmAcres, setNewFarmAcres] = useState(35);
  const [newFarmCrops, setNewFarmCrops] = useState('Strawberries, Spinach, Kale');
  const [newFarmZones, setNewFarmZones] = useState(4);
  const [selectedPresetImage, setSelectedPresetImage] = useState('https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80');

  const FARM_IMAGE_PRESETS = [
    { label: 'Green Pastures', url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80' },
    { label: 'Irrigated Crops', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80' },
    { label: 'Orchard Valley', url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleLocationChange = (data: LocationData) => {
    setNewFarmLocation(data.address);
    setNewFarmCoords({ lat: data.lat, lng: data.lng });
    setLocationMethod(data.method);
    setLocationAccuracy(data.accuracy);
  };

  const toggleSelectFarm = (farmId: string) => {
    setSelectedFarmIds(prev => 
      prev.includes(farmId) ? prev.filter(id => id !== farmId) : [...prev, farmId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedFarmIds.length === farms.length) {
      setSelectedFarmIds([]);
    } else {
      setSelectedFarmIds(farms.map(f => f.id));
    }
  };

  const handleConfirmDeleteSingle = () => {
    if (!farmPendingDelete) return;
    onDeleteFarm(farmPendingDelete.id);
    setSelectedFarmIds(prev => prev.filter(id => id !== farmPendingDelete.id));
    setFarmPendingDelete(null);
  };

  const handleConfirmDeleteBulk = () => {
    if (selectedFarmIds.length === 0) return;
    if (onDeleteMultipleFarms) {
      onDeleteMultipleFarms(selectedFarmIds);
    } else {
      selectedFarmIds.forEach(id => onDeleteFarm(id));
    }
    setSelectedFarmIds([]);
    setIsConfirmingBulkDelete(false);
    setIsBulkSelectMode(false);
  };

  const handleCreateFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName.trim()) return;

    onAddFarm({
      name: newFarmName,
      location: newFarmLocation,
      coordinates: newFarmCoords,
      locationMethod,
      acres: newFarmAcres,
      cropTypes: newFarmCrops.split(',').map((c) => c.trim()),
      zoneCount: newFarmZones,
      imageUrl: selectedPresetImage,
      zones: [
        {
          id: `zone-${Date.now()}-1`,
          name: 'Zone 1 – Alpha Field',
          cropType: newFarmCrops.split(',')[0] || 'Mixed',
          areaAcres: Math.round(newFarmAcres / 2),
          status: 'normal',
          soilMoisture: 48,
          optimalRange: [40, 60],
          temperature: 29,
          humidity: 62,
          lastIrrigationHoursAgo: 4,
          nextRecommendedTime: 'Tomorrow 06:00 AM',
          valveOpen: false,
          waterFlowRateLpm: 0,
        },
        {
          id: `zone-${Date.now()}-2`,
          name: 'Zone 2 – Beta Field',
          cropType: newFarmCrops.split(',')[1] || 'Greens',
          areaAcres: Math.round(newFarmAcres / 2),
          status: 'normal',
          soilMoisture: 42,
          optimalRange: [40, 60],
          temperature: 30,
          humidity: 59,
          lastIrrigationHoursAgo: 8,
          nextRecommendedTime: 'Today 08:30 PM',
          valveOpen: false,
          waterFlowRateLpm: 0,
        },
      ],
    });

    // Reset Form and return to list
    setNewFarmName('');
    setActiveMainTab('my-farms');
  };

  return (
    <div className="min-h-screen bg-[#F0F5F2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Row with Title & Tab Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8EF] text-[#159947] text-xs font-bold mb-2">
              <Sprout className="w-3.5 h-3.5" />
              AgriAI Precision Multi-Site Management
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-['Space_Grotesk'] tracking-tight">
              {activeMainTab === 'my-farms' ? 'Select Your Farm' : 'Add New Farm Site'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeMainTab === 'my-farms'
                ? 'Choose an active agricultural facility, manage sites, or configure a new parcel with GPS and maps.'
                : 'Acquire boundary coordinates with GPS satellites or drop a pin using online maps.'}
            </p>
          </div>

          {/* Top Level Main Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs self-start md:self-auto">
            <button
              id="tab-my-farms"
              type="button"
              onClick={() => setActiveMainTab('my-farms')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === 'my-farms'
                  ? 'bg-[#159947] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>My Farms</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeMainTab === 'my-farms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {farms.length}
              </span>
            </button>

            <button
              id="tab-add-new-farm"
              type="button"
              onClick={() => setActiveMainTab('add-farm')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === 'add-farm'
                  ? 'bg-[#159947] text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-emerald-50/50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add New Farm</span>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800">
                GPS + Maps
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: MY FARMS LIST */}
        {activeMainTab === 'my-farms' && (
          <div>
            {farms.length > 0 ? (
              <>
                {/* List Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Available Farm Facilities ({farms.length})
                    </span>
                    {isBulkSelectMode && (
                      <p className="text-xs text-red-600 font-semibold mt-0.5">
                        Selection mode enabled: Click any farm to check/uncheck for batch deletion.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    {/* Toggle Batch Delete Selection Mode */}
                    <button
                      id="btn-toggle-bulk-mode"
                      type="button"
                      onClick={() => {
                        setIsBulkSelectMode(!isBulkSelectMode);
                        setSelectedFarmIds([]);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isBulkSelectMode
                          ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{isBulkSelectMode ? 'Exit Selection Mode' : 'Select / Delete Multiple'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMainTab('add-farm')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#159947] hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Farm</span>
                    </button>
                  </div>
                </div>

                {/* Bulk Select Action Bar */}
                {isBulkSelectMode && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-red-200 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-6 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <button
                        id="btn-toggle-select-all"
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          selectedFarmIds.length === farms.length && farms.length > 0
                            ? 'bg-red-600 border-red-600 text-white'
                            : selectedFarmIds.length > 0
                            ? 'bg-red-50 border-red-400 text-red-700'
                            : 'bg-white border-slate-300'
                        }`}>
                          {selectedFarmIds.length === farms.length && farms.length > 0 ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : selectedFarmIds.length > 0 ? (
                            <span className="w-2.5 h-0.5 bg-red-600 rounded-full" />
                          ) : null}
                        </div>
                        <span>
                          {selectedFarmIds.length === farms.length && farms.length > 0
                            ? 'Deselect All'
                            : 'Select All'}
                        </span>
                      </button>
                      <span className="text-xs text-slate-500 font-medium">
                        • {selectedFarmIds.length} of {farms.length} farms selected
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="btn-delete-selected-farms"
                        type="button"
                        disabled={selectedFarmIds.length === 0}
                        onClick={() => setIsConfirmingBulkDelete(true)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedFarmIds.length > 0
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm cursor-pointer active:scale-98'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Selected ({selectedFarmIds.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsBulkSelectMode(false);
                          setSelectedFarmIds([]);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Farm Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {farms.map((farm) => {
                    const isSelected = farm.name === 'Green Valley Farm';
                    const isCardChecked = selectedFarmIds.includes(farm.id);

                    return (
                      <div
                        key={farm.id}
                        id={`farm-card-${farm.id}`}
                        onClick={() => {
                          if (isBulkSelectMode) {
                            toggleSelectFarm(farm.id);
                          }
                        }}
                        className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between hover:shadow-xl group relative ${
                          isBulkSelectMode ? 'cursor-pointer' : ''
                        } ${
                          isCardChecked
                            ? 'border-red-400 ring-2 ring-red-400/40 shadow-md bg-red-50/10'
                            : isSelected
                            ? 'border-[#159947] ring-2 ring-[#159947]/20 shadow-md'
                            : 'border-slate-200 shadow-xs hover:border-slate-300'
                        }`}
                      >
                        {/* Bulk Select Checkbox overlay */}
                        {isBulkSelectMode && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectFarm(farm.id);
                            }}
                            className="absolute top-3 left-3 z-20 cursor-pointer"
                          >
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center border shadow-md transition-all ${
                              isCardChecked
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'bg-white/95 backdrop-blur-md border-slate-300 text-transparent hover:border-slate-400'
                            }`}>
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          </div>
                        )}

                        {/* Image Section */}
                        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-800">
                          <img
                            src={farm.imageUrl}
                            alt={farm.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Location Method Pill if stored and not in bulk select */}
                          {farm.coordinates && !isBulkSelectMode && (
                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono flex items-center gap-1.5">
                              <Radio className="w-3 h-3 text-emerald-400" />
                              <span>{farm.coordinates.lat.toFixed(3)}°, {farm.coordinates.lng.toFixed(3)}°</span>
                            </div>
                          )}

                          {/* Quick Delete Trash Button in Image Header */}
                          {!isBulkSelectMode && (
                            <button
                              id={`btn-delete-card-top-${farm.id}`}
                              type="button"
                              title={`Delete ${farm.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFarmPendingDelete(farm);
                              }}
                              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-red-600 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm group/del hover:scale-105"
                              aria-label={`Delete ${farm.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 group-hover/del:scale-110 transition-transform" />
                            </button>
                          )}
                        </div>

                        {/* Details Section */}
                        <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-xl font-bold text-slate-900 font-['Space_Grotesk'] tracking-tight">
                                {farm.name}
                              </h3>
                            </div>

                            <div className="mt-4 space-y-2.5 text-sm text-slate-600">
                              <div className="flex items-center gap-2.5">
                                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="font-medium text-slate-700">{farm.location}</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-slate-400 font-serif font-bold text-sm w-4 text-center shrink-0">📐</span>
                                <span>{farm.acres} acres under management</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-slate-400 text-sm w-4 text-center shrink-0">🌾</span>
                                <span>{farm.cropTypes.join(', ')}</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
                                <span>{farm.zoneCount} automated irrigation zones</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3">
                            {isBulkSelectMode ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelectFarm(farm.id);
                                }}
                                className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                  isCardChecked
                                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                <Check className="w-4 h-4" />
                                <span>{isCardChecked ? 'Selected for Deletion' : 'Select to Delete'}</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  id={`select-farm-btn-${farm.id}`}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectFarm(farm);
                                  }}
                                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 ${
                                    isSelected
                                      ? 'bg-[#159947] hover:bg-[#13883f] text-white shadow-md shadow-[#159947]/30'
                                      : 'bg-[#d1fae5] hover:bg-[#a7f3d0] text-[#065f46]'
                                  }`}
                                >
                                  <span>Select Farm</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>

                                <button
                                  id={`btn-delete-farm-${farm.id}`}
                                  type="button"
                                  title={`Delete ${farm.name}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFarmPendingDelete(farm);
                                  }}
                                  className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                                  aria-label={`Delete ${farm.name}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Empty State when all farms are deleted */
              <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#159947] flex items-center justify-center mx-auto shadow-inner">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
                    No Farm Sites Available
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    All agricultural facilities have been removed. Configure a new farm parcel with GPS coordinates or online maps to resume smart irrigation control.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    id="btn-empty-state-add-farm"
                    type="button"
                    onClick={() => setActiveMainTab('add-farm')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#159947] hover:bg-[#13883f] text-white text-sm font-bold shadow-md shadow-[#159947]/30 transition-all cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Farm</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD NEW FARM (Comprehensive View with GPS & Online Maps) */}
        {activeMainTab === 'add-farm' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-xl space-y-8">
            
            {/* Tab Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-emerald-950 font-['Space_Grotesk']">
                    Site Geolocation & Spatial Boundary Configuration
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Acquire exact coordinates via <strong>GPS Satellites</strong> or pinpoint boundaries using <strong>Online Maps</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMainTab('my-farms')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-xs font-bold text-emerald-800 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to My Farms</span>
              </button>
            </div>

            <form onSubmit={handleCreateFarm} className="space-y-8">
              
              {/* SECTION 1: General Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Farm Site Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFarmName}
                    onChange={(e) => setNewFarmName(e.target.value)}
                    placeholder="e.g. Pine Valley Orchards or Highland Vineyards"
                    className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159947] bg-slate-50 focus:bg-white transition-all"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    A distinct display name for your agricultural parcel
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Primary Crop Types (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newFarmCrops}
                    onChange={(e) => setNewFarmCrops(e.target.value)}
                    placeholder="Strawberries, Kale, Mint, Almonds"
                    className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159947] bg-slate-50 focus:bg-white transition-all"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Used by AI to calibrate crop coefficient (Kc) and root-zone water demands
                  </span>
                </div>
              </div>

              {/* SECTION 2: THE REQUESTED LOCATION SELECTOR (GPS & ONLINE MAPS) */}
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
                <FarmLocationSelector
                  initialLocation={newFarmLocation}
                  initialLat={newFarmCoords.lat}
                  initialLng={newFarmCoords.lng}
                  onLocationChange={handleLocationChange}
                />
              </div>

              {/* SECTION 3: Field Sizing & Irrigation Setup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Total Parcel Area (Acres)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={newFarmAcres}
                    onChange={(e) => setNewFarmAcres(Number(e.target.value))}
                    className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159947] bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Initial Irrigation Zones
                  </label>
                  <select
                    value={newFarmZones}
                    onChange={(e) => setNewFarmZones(Number(e.target.value))}
                    className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159947] bg-slate-50"
                  >
                    <option value={2}>2 Irrigation Zones (Pilot Field)</option>
                    <option value={4}>4 Irrigation Zones (Standard Commercial)</option>
                    <option value={6}>6 Irrigation Zones (High-Diversity Orchard)</option>
                    <option value={8}>8 Irrigation Zones (Large Facility)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Visual Imagery Theme
                  </label>
                  <div className="flex gap-2">
                    {FARM_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPresetImage(preset.url)}
                        className={`relative flex-1 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedPresetImage === preset.url
                            ? 'border-[#159947] ring-2 ring-emerald-400/30'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        {selectedPresetImage === preset.url && (
                          <div className="absolute inset-0 bg-[#159947]/30 flex items-center justify-center text-white">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Configured coordinates: {newFarmCoords.lat.toFixed(4)}°N, {newFarmCoords.lng.toFixed(4)}°W ({locationMethod.toUpperCase()})</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveMainTab('my-farms')}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    id="submit-create-farm-btn"
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#159947] hover:bg-[#13883f] text-white text-xs font-bold shadow-md shadow-[#159947]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create & Launch Farm Site</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        )}

      </div>

      {/* SINGLE FARM DELETION CONFIRMATION MODAL */}
      {farmPendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                  Delete Farm Facility?
                </h3>
                <p className="text-xs text-slate-500">
                  This will remove this farm site and its configuration.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-sm font-bold text-slate-900">
                {farmPendingDelete.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{farmPendingDelete.location}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span>{farmPendingDelete.acres} acres</span>
                <span>•</span>
                <span>{farmPendingDelete.zoneCount} zones</span>
              </div>
            </div>

            <p className="text-xs text-red-600/90 bg-red-50/70 p-3 rounded-xl border border-red-200/60 leading-relaxed">
              ⚠️ Warning: Deleting this farm permanently removes all associated zones, IoT telemetry streams, valve settings, and historical irrigation logs. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFarmPendingDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-farm-btn"
                onClick={handleConfirmDeleteSingle}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Farm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK FARM DELETION CONFIRMATION MODAL */}
      {isConfirmingBulkDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                  Delete {selectedFarmIds.length} Farm Sites?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to permanently delete the selected agricultural facilities?
                </p>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              {farms
                .filter(f => selectedFarmIds.includes(f.id))
                .map(f => (
                  <div key={f.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-white border border-slate-100">
                    <span className="font-semibold text-slate-800 truncate">{f.name}</span>
                    <span className="text-slate-400 shrink-0 ml-2">{f.acres} ac</span>
                  </div>
                ))}
            </div>

            <p className="text-xs text-red-600/90 bg-red-50/70 p-3 rounded-xl border border-red-200/60 leading-relaxed">
              ⚠️ Warning: Deleting these {selectedFarmIds.length} farms will permanently wipe all their sensor data, schedules, and zone layouts. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingBulkDelete(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-bulk-delete-farm-btn"
                onClick={handleConfirmDeleteBulk}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete {selectedFarmIds.length} Farms</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
