export type AppView = 
  | 'all-steps'
  | 'login' 
  | 'farm-selection' 
  | 'dashboard' 
  | 'farm-map' 
  | 'zone-detail' 
  | 'irrigation-control' 
  | 'weather' 
  | 'analytics' 
  | 'alerts' 
  | 'ai-assistant' 
  | 'settings';

export type ZoneStatus = 'normal' | 'dry' | 'critical' | 'offline';

export interface FarmZone {
  id: string;
  name: string;
  cropType: string;
  areaAcres: number;
  status: ZoneStatus;
  soilMoisture: number; // percentage
  optimalRange: [number, number]; // [40, 60]
  temperature: number; // Celsius
  humidity: number; // percentage
  lastIrrigationHoursAgo: number;
  nextRecommendedTime: string;
  valveOpen: boolean;
  waterFlowRateLpm: number;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  acres: number;
  cropTypes: string[];
  zoneCount: number;
  imageUrl: string;
  zones: FarmZone[];
  coordinates?: { lat: number; lng: number };
  elevation?: number;
  locationMethod?: 'manual' | 'gps' | 'maps';
}

export interface SensorData {
  soilMoisture: number; // %
  temperature: number; // °C
  humidity: number; // %
  rainProbability: number; // %
  waterTankLevel: number; // %
  flowRate: number; // L/min
  soilTemperature: number; // °C
  valveStatus: 'Open' | 'Closed' | 'Throttled';
}

export interface AIRecommendation {
  title: string;
  summary: string;
  actionType: 'delay' | 'irrigate_now' | 'no_action' | 'monitor';
  delayHours: number;
  rainProbability: number;
  currentSoilMoisture: number;
  estimatedWaterSavedLiters: number;
  recommendedWaterAmountLiters: number;
  recommendedDurationMinutes: number;
  recommendedStartTime: string;
  confidence: number; // 0 - 100
  factors: {
    rainForecast: number; // e.g. 40%
    soilMoisture: number; // e.g. 35%
    cropRequirement: number; // e.g. 15%
    temperature: number; // e.g. 10%
  };
  explanationText: string;
  finalSuggestion: string;
}

export interface DecisionLogEntry {
  id: string;
  timestamp: string;
  zone: string;
  recommendation: string;
  confidence: number;
  userDecision: 'Accepted' | 'Rejected' | 'Modified';
  finalAction: string;
}

export interface WeatherHourly {
  time: string;
  condition: string;
  temperature: number;
  rainProbability: number;
  humidity: number;
  soilMoisture: number;
  aiDecision: string;
  iconName: string;
}

export interface WeatherDaily {
  day: string;
  condition: string;
  tempHigh: number;
  tempLow: number;
  rainProbability: number;
  humidity: number;
  soilMoisture: number;
  recommendation: string;
  iconName: string;
}

export interface SoilMoistureTrendPoint {
  time: string;
  moisture: number;
  optimalMin: number;
  critical: number;
}

export type WeatherLocationSource = 'geolocation' | 'farm';

export interface WeatherSnapshot {
  latitude: number;
  longitude: number;
  locationSource: WeatherLocationSource;
  current: {
    temperature: number;
    humidity: number;
    rainProbability: number;
    soilMoisture: number;
    condition: string;
    iconName: string;
  };
  hourly: WeatherHourly[];
  daily: WeatherDaily[];
  soilTrend: SoilMoistureTrendPoint[];
}

export interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  zoneId?: string;
  read: boolean;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  dataPoints?: Array<{ label: string; value: string }>;
}
