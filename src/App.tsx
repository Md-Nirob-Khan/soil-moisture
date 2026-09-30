import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppView, 
  Farm, 
  FarmZone, 
  SensorData, 
  AIRecommendation, 
  DecisionLogEntry, 
  AlertItem,
  WeatherSnapshot,
} from './types';
import { 
  INITIAL_FARMS, 
  INITIAL_SENSOR_DATA, 
  INITIAL_DECISION_LOGS, 
  INITIAL_ALERTS, 
  evaluateAIRecommendation 
} from './data/mockData';
import { loadWeatherForFarm } from './services/weather';
import { AppSidebar } from './components/AppSidebar';
import { TopHeader } from './components/TopHeader';
import { ExplainabilityModal } from './components/ExplainabilityModal';
import { ModifyRecommendationModal } from './components/ModifyRecommendationModal';
import { LoginView } from './views/LoginView';
import { FarmSelectionView } from './views/FarmSelectionView';
import { DashboardView } from './views/DashboardView';
import { FarmMapView } from './views/FarmMapView';
import { ZoneDetailView } from './views/ZoneDetailView';
import { IrrigationControlView } from './views/IrrigationControlView';
import { WeatherView } from './views/WeatherView';
import { AnalyticsView } from './views/AnalyticsView';
import { AlertsView } from './views/AlertsView';
import { AIAssistantView } from './views/AIAssistantView';
import { SettingsView } from './views/SettingsView';
import { AllStepsView } from './views/AllStepsView';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation & Authentication State
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [userEmail, setUserEmail] = useState('demo.grower@agriai.io');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Farms State
  const [farms, setFarms] = useState<Farm[]>(INITIAL_FARMS);
  const [currentFarm, setCurrentFarm] = useState<Farm>(INITIAL_FARMS[0]);
  const [selectedZone, setSelectedZone] = useState<FarmZone>(INITIAL_FARMS[0].zones[2]); // Zone 3 (Tomato) by default

  // Live Telemetry & AI Recommendation State
  const [sensorData, setSensorData] = useState<SensorData>(INITIAL_SENSOR_DATA);
  const [recommendation, setRecommendation] = useState<AIRecommendation>(() => 
    evaluateAIRecommendation(INITIAL_SENSOR_DATA.soilMoisture, INITIAL_SENSOR_DATA.rainProbability, INITIAL_SENSOR_DATA.temperature, 'Tomato')
  );
  const [hasAcceptedRecommendation, setHasAcceptedRecommendation] = useState(false);

  // Decision Log & Alerts State
  const [decisionLogs, setDecisionLogs] = useState<DecisionLogEntry[]>(INITIAL_DECISION_LOGS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  // Modals State
  const [isExplainabilityOpen, setIsExplainabilityOpen] = useState(false);
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const applyWeatherToSensors = useCallback((snapshot: WeatherSnapshot, cropType: string) => {
    setSensorData((prev) => ({
      ...prev,
      soilMoisture: snapshot.current.soilMoisture,
      temperature: snapshot.current.temperature,
      humidity: snapshot.current.humidity,
      rainProbability: snapshot.current.rainProbability,
    }));
    setRecommendation(evaluateAIRecommendation(
      snapshot.current.soilMoisture,
      snapshot.current.rainProbability,
      snapshot.current.temperature,
      cropType
    ));
  }, []);

  const fetchWeather = useCallback(async () => {
    setWeatherStatus('loading');
    setWeatherError(null);
    try {
      const snapshot = await loadWeatherForFarm(currentFarm);
      setWeather(snapshot);
      applyWeatherToSensors(snapshot, selectedZone.cropType);
      setWeatherStatus('success');
      return snapshot;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load live weather';
      setWeatherError(message);
      setWeatherStatus('error');
      return null;
    }
  }, [applyWeatherToSensors, currentFarm, selectedZone.cropType]);

  const isAuthenticatedShell = currentView !== 'login' && currentView !== 'farm-selection';

  useEffect(() => {
    if (!isAuthenticatedShell) return;
    void fetchWeather();
  }, [isAuthenticatedShell, currentFarm.id, currentFarm.coordinates?.lat, currentFarm.coordinates?.lng, fetchWeather]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Login handler
  const handleLogin = (email: string) => {
    setUserEmail(email);
    setCurrentView('farm-selection');
  };

  // Farm selection handler
  const handleSelectFarm = (farm: Farm) => {
    setCurrentFarm(farm);
    if (farm.zones && farm.zones.length > 0) {
      // Pick zone 3 if available or first zone
      const defaultZone = farm.zones.find(z => z.id.includes('zone-3')) || farm.zones[0];
      setSelectedZone(defaultZone);
    }
    setCurrentView('dashboard');
    showToast(`Loaded ${farm.name} telemetry`);
  };

  // Add new farm
  const handleAddFarm = (newFarmData: Omit<Farm, 'id'>) => {
    const newFarm: Farm = {
      ...newFarmData,
      id: `farm-${Date.now()}`,
    };
    setFarms(prev => [...prev, newFarm]);
    setCurrentFarm(newFarm);
    setSelectedZone(newFarm.zones[0]);
    setCurrentView('dashboard');
    showToast(`Farm "${newFarm.name}" created and loaded!`);
  };

  // Delete single farm handler
  const handleDeleteFarm = (farmId: string) => {
    const farmToDelete = farms.find(f => f.id === farmId);
    const updatedFarms = farms.filter(f => f.id !== farmId);
    setFarms(updatedFarms);

    // If deleted farm was active, fall back to next available farm
    if (currentFarm?.id === farmId) {
      if (updatedFarms.length > 0) {
        setCurrentFarm(updatedFarms[0]);
        if (updatedFarms[0].zones && updatedFarms[0].zones.length > 0) {
          setSelectedZone(updatedFarms[0].zones[0]);
        }
      }
    }
    showToast(`Farm "${farmToDelete?.name || 'Selected farm'}" deleted successfully`);
  };

  // Delete multiple farms handler
  const handleDeleteMultipleFarms = (farmIds: string[]) => {
    const updatedFarms = farms.filter(f => !farmIds.includes(f.id));
    setFarms(updatedFarms);

    if (currentFarm && farmIds.includes(currentFarm.id)) {
      if (updatedFarms.length > 0) {
        setCurrentFarm(updatedFarms[0]);
        if (updatedFarms[0].zones && updatedFarms[0].zones.length > 0) {
          setSelectedZone(updatedFarms[0].zones[0]);
        }
      }
    }
    showToast(`${farmIds.length} farm(s) deleted successfully`);
  };

  // 15. SIMULATED SENSOR DATA REFRESH (Mandated by prompt)
  const handleRefreshSensors = async () => {
    setIsRefreshing(true);
    const snapshot = await fetchWeather();

    setSensorData((prev) => {
      const tankJitter = Math.random() > 0.5 ? 1 : -1;
      const updated: SensorData = {
        ...prev,
        waterTankLevel: Math.max(40, Math.min(95, prev.waterTankLevel + tankJitter)),
      };
      return updated;
    });

    if (!snapshot) {
      setIsRefreshing(false);
      showToast('Could not refresh live weather. Tank telemetry updated.');
      return;
    }

    setIsRefreshing(false);
    showToast('Live weather and telemetry updated');
  };

  // 6 & 7. Human Decisions: Accept Recommendation
  const handleAcceptRecommendation = () => {
    setHasAcceptedRecommendation(true);
    setIsExplainabilityOpen(false);

    const newLog: DecisionLogEntry = {
      id: `dec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      zone: selectedZone.name.split('–')[0].trim() || 'Zone 3',
      recommendation: recommendation.actionType === 'delay' ? 'Delay Irrigation' : 'Irrigate Cycle',
      confidence: recommendation.confidence,
      userDecision: 'Accepted',
      finalAction: recommendation.actionType === 'delay' 
        ? `Wait ${recommendation.delayHours} Hours` 
        : `Scheduled for ${recommendation.recommendedStartTime}`,
    };

    setDecisionLogs(prev => [newLog, ...prev]);
    showToast(`Recommendation accepted! Decision logged: "${newLog.finalAction}"`);
  };

  // 6 & 7. Human Decisions: Reject Recommendation
  const handleRejectRecommendation = () => {
    setIsExplainabilityOpen(false);

    const newLog: DecisionLogEntry = {
      id: `dec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      zone: selectedZone.name.split('–')[0].trim() || 'Zone 3',
      recommendation: recommendation.actionType === 'delay' ? 'Delay Irrigation' : 'Irrigate Cycle',
      confidence: recommendation.confidence,
      userDecision: 'Rejected',
      finalAction: 'Manual Override (Cancelled postponement)',
    };

    setDecisionLogs(prev => [newLog, ...prev]);
    showToast('Recommendation rejected. Logged in audit history.');
  };

  // 6 & 7. Human Decisions: Modify Recommendation
  const handleModifyRecommendation = () => {
    setIsExplainabilityOpen(false);
    setIsModifyOpen(true);
  };

  const handleSaveModifiedSchedule = (modified: {
    delayHours: number;
    waterAmountLiters: number;
    durationMinutes: number;
    reason: string;
  }) => {
    const newLog: DecisionLogEntry = {
      id: `dec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      zone: selectedZone.name.split('–')[0].trim() || 'Zone 3',
      recommendation: `Delay ${recommendation.delayHours}h`,
      confidence: recommendation.confidence,
      userDecision: 'Modified',
      finalAction: `Adjusted to ${modified.delayHours}h delay, ${modified.waterAmountLiters}L`,
    };

    setDecisionLogs(prev => [newLog, ...prev]);
    showToast(`Schedule modified! ${modified.delayHours}h delay, ${modified.waterAmountLiters}L`);
  };

  // Irrigation complete handler
  const handleIrrigationComplete = (deliveredLiters: number, newMoisture: number) => {
    setSensorData(prev => ({
      ...prev,
      soilMoisture: newMoisture,
      waterTankLevel: Math.max(10, prev.waterTankLevel - 4),
    }));

    setSelectedZone(prev => ({
      ...prev,
      soilMoisture: newMoisture,
      status: 'normal',
      lastIrrigationHoursAgo: 0,
    }));

    // Re-evaluate recommendation
    const updatedRec = evaluateAIRecommendation(
      newMoisture,
      sensorData.rainProbability,
      sensorData.temperature,
      selectedZone.cropType
    );
    setRecommendation(updatedRec);

    showToast(`Irrigation completed! Delivered ${deliveredLiters}L. Soil moisture restored to ${newMoisture}%.`);
  };

  // Dismiss alert
  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showToast('Alert dismissed');
  };

  // Acknowledge all alerts
  const handleAcknowledgeAllAlerts = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    showToast('All alerts marked as read');
  };

  // Quick zone inspection from Alert
  const handleInspectZoneFromAlert = (zoneId: string) => {
    const target = currentFarm.zones.find(z => z.id === zoneId) || currentFarm.zones[0];
    setSelectedZone(target);
    setCurrentView('zone-detail');
  };

  // Start irrigation directly for zone from Alert
  const handleStartIrrigationForZone = (zoneId: string) => {
    const target = currentFarm.zones.find(z => z.id === zoneId) || currentFarm.zones[0];
    setSelectedZone(target);
    setCurrentView('irrigation-control');
  };

  // Unread alerts count
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  // View Routing: Login View
  if (currentView === 'login') {
    return <LoginView onLogin={handleLogin} />;
  }

  // View Routing: Farm Selection View
  if (currentView === 'farm-selection') {
    return (
      <FarmSelectionView
        farms={farms}
        onSelectFarm={handleSelectFarm}
        onAddFarm={handleAddFarm}
        onDeleteFarm={handleDeleteFarm}
        onDeleteMultipleFarms={handleDeleteMultipleFarms}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F5F2] flex text-[#0D2B36]">
      
      {/* 3. APPLICATION SHELL: LEFT SIDEBAR (Mandated by prompt) */}
      <AppSidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        unreadAlertsCount={unreadAlertsCount}
        currentFarm={currentFarm}
        onSwitchFarm={() => setCurrentView('farm-selection')}
        onLogout={() => setCurrentView('login')}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* 3. APPLICATION SHELL: TOP BAR (Mandated by prompt) */}
        <TopHeader
          currentFarm={currentFarm}
          selectedZone={selectedZone}
          onSelectZone={(zone) => setSelectedZone(zone)}
          onRefreshSensors={handleRefreshSensors}
          isRefreshing={isRefreshing}
          alerts={alerts}
          onOpenAlerts={() => setCurrentView('alerts')}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          userEmail={userEmail}
          onLogout={() => setCurrentView('login')}
          onNavigateToAllSteps={() => setCurrentView('all-steps')}
          weather={weather}
          weatherLoading={weatherStatus === 'loading'}
          weatherError={weatherError}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              currentFarm={currentFarm}
              selectedZone={selectedZone}
              sensorData={sensorData}
              recommendation={recommendation}
              decisionLogs={decisionLogs}
              onAcceptRecommendation={handleAcceptRecommendation}
              onModifySchedule={handleModifyRecommendation}
              onIrrigateNow={() => setCurrentView('irrigation-control')}
              onOpenExplainability={() => setIsExplainabilityOpen(true)}
              onSelectZone={(zone) => setSelectedZone(zone)}
              onNavigateToZones={() => setCurrentView('farm-map')}
              onNavigateToIrrigation={() => setCurrentView('irrigation-control')}
              hasAcceptedRecommendation={hasAcceptedRecommendation}
              weatherLoading={weatherStatus === 'loading'}
              weatherError={weatherError}
              onRetryWeather={() => { void fetchWeather(); }}
              soilTrend={weather?.soilTrend}
            />
          )}

          {currentView === 'farm-map' && (
            <FarmMapView
              currentFarm={currentFarm}
              selectedZone={selectedZone}
              onSelectZone={(zone) => setSelectedZone(zone)}
              onNavigateToDetail={() => setCurrentView('zone-detail')}
              onNavigateToIrrigation={(zone) => {
                setSelectedZone(zone);
                setCurrentView('irrigation-control');
              }}
            />
          )}

          {currentView === 'zone-detail' && (
            <ZoneDetailView
              zone={selectedZone}
              onBack={() => setCurrentView('farm-map')}
              onNavigateToIrrigation={(zone) => {
                setSelectedZone(zone);
                setCurrentView('irrigation-control');
              }}
              onTriggerInstantCycle={() => setCurrentView('irrigation-control')}
            />
          )}

          {currentView === 'irrigation-control' && (
            <IrrigationControlView
              currentFarm={currentFarm}
              selectedZone={selectedZone}
              onSelectZone={(zone) => setSelectedZone(zone)}
              onIrrigationComplete={handleIrrigationComplete}
            />
          )}

          {currentView === 'weather' && (
            <WeatherView
              currentFarm={currentFarm}
              hourly={weather?.hourly ?? []}
              daily={weather?.daily ?? []}
              isLoading={weatherStatus === 'loading'}
              error={weatherError}
              locationSource={weather?.locationSource ?? null}
              onRetry={() => { void fetchWeather(); }}
              insightLiters={recommendation.estimatedWaterSavedLiters || 320}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView />
          )}

          {currentView === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onInspectZone={handleInspectZoneFromAlert}
              onStartIrrigationForZone={handleStartIrrigationForZone}
              onDismissAlert={handleDismissAlert}
              onAcknowledgeAll={handleAcknowledgeAllAlerts}
              onViewWeather={() => setCurrentView('weather')}
            />
          )}

          {currentView === 'ai-assistant' && (
            <AIAssistantView
              sensorData={sensorData}
              selectedZone={selectedZone}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView />
          )}

          {currentView === 'all-steps' && (
            <AllStepsView 
              onNavigateToStep={(view) => setCurrentView(view)}
              onOpenExplainability={() => setIsExplainabilityOpen(true)}
            />
          )}
        </main>
      </div>

      {/* 6. EXPLAINABLE AI MODAL (Mandated by prompt) */}
      <ExplainabilityModal
        isOpen={isExplainabilityOpen}
        onClose={() => setIsExplainabilityOpen(false)}
        recommendation={recommendation}
        onAccept={handleAcceptRecommendation}
        onModify={handleModifyRecommendation}
        onReject={handleRejectRecommendation}
      />

      {/* Modify Recommendation Modal */}
      <ModifyRecommendationModal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        recommendation={recommendation}
        onSave={handleSaveModifiedSchedule}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0D2B36] text-white shadow-2xl border border-[#159947]/40 text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#4ade80] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
