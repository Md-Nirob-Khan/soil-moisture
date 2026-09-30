import {
  Farm,
  SoilMoistureTrendPoint,
  WeatherDaily,
  WeatherHourly,
  WeatherLocationSource,
  WeatherSnapshot,
} from '../types';

export const DEFAULT_FARM_COORDINATES = { lat: 30.0802, lng: -94.1266 };

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone?: string;
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    soil_moisture_0_to_1cm: number | null;
  };
  hourly?: {
    time: string[];
    temperature_2m: Array<number | null>;
    relative_humidity_2m: Array<number | null>;
    precipitation_probability: Array<number | null>;
    soil_moisture_0_to_1cm: Array<number | null>;
    weather_code: Array<number | null>;
  };
  daily?: {
    time: string[];
    weather_code: Array<number | null>;
    temperature_2m_max: Array<number | null>;
    temperature_2m_min: Array<number | null>;
    precipitation_probability_max: Array<number | null>;
  };
  error?: boolean;
  reason?: string;
}

let cachedGeolocation: { lat: number; lng: number } | 'denied' | null = null;

function round(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function volumetricToPercent(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value)) return 0;
  // Open-Meteo soil moisture is m³/m³; display as percent to match existing KPIs.
  return Math.max(0, Math.min(100, round(value * 100)));
}

function firstNumber(values: Array<number | null | undefined>, fallback = 0): number {
  for (const value of values) {
    if (value != null && !Number.isNaN(value)) return value;
  }
  return fallback;
}

export function weatherCodeToMeta(code: number | null | undefined, temperature?: number): {
  condition: string;
  iconName: string;
} {
  const weatherCode = code ?? 0;

  if (weatherCode === 0) {
    if ((temperature ?? 0) >= 33) return { condition: 'Hot', iconName: 'Sun' };
    return { condition: 'Sunny', iconName: 'Sun' };
  }
  if (weatherCode === 1) return { condition: 'Mainly Clear', iconName: 'Sun' };
  if (weatherCode === 2) return { condition: 'Partly Cloudy', iconName: 'CloudSun' };
  if (weatherCode === 3) return { condition: 'Cloudy', iconName: 'Cloud' };
  if (weatherCode === 45 || weatherCode === 48) return { condition: 'Fog', iconName: 'Cloud' };
  if (weatherCode >= 51 && weatherCode <= 57) return { condition: 'Drizzle', iconName: 'CloudRain' };
  if (weatherCode >= 61 && weatherCode <= 67) return { condition: 'Rain', iconName: 'CloudRain' };
  if (weatherCode >= 71 && weatherCode <= 77) return { condition: 'Snow', iconName: 'Cloud' };
  if (weatherCode >= 80 && weatherCode <= 82) return { condition: 'Rain Shower', iconName: 'CloudRain' };
  if (weatherCode >= 85 && weatherCode <= 86) return { condition: 'Snow Shower', iconName: 'Cloud' };
  if (weatherCode >= 95) return { condition: 'Thunderstorm', iconName: 'CloudLightning' };
  return { condition: 'Cloudy', iconName: 'Cloud' };
}

export function irrigationDecision(rainProbability: number, soilMoisture: number): string {
  if (rainProbability >= 70) return 'Skip irrigation';
  if (rainProbability >= 45) return 'Delay';
  if (soilMoisture < 35 && rainProbability < 30) return 'Irrigate as needed';
  if (rainProbability >= 20) return 'Monitor';
  if (soilMoisture >= 40) return 'No irrigation';
  return 'Reassess';
}

export function irrigationDecisionStyle(decision: string): string {
  if (decision === 'Skip irrigation') return 'text-red-600 font-bold';
  if (decision === 'Delay') return 'text-amber-600 font-semibold';
  if (decision === 'Irrigate as needed' || decision === 'Irrigate morning') {
    return 'text-emerald-600 font-semibold';
  }
  return 'text-slate-700';
}

function dailyRecommendation(rainProbability: number, tempHigh: number, soilMoisture: number): string {
  if (rainProbability >= 70) return 'Total irrigation bypass recommended';
  if (rainProbability >= 45) return 'Delay daytime irrigation; utilize rain front';
  if (tempHigh >= 33 && soilMoisture < 40) return 'Full cycle required due to high solar evapotranspiration';
  if (soilMoisture < 35) return 'Early morning standard cycle';
  return 'Moisture assessment; irrigate only if sensors dip';
}

function formatHourLabel(isoTime: string): string {
  const date = new Date(isoTime);
  return date.toLocaleTimeString([], { hour: 'numeric' });
}

function formatDayLabel(isoDate: string, indexFromToday: number): string {
  if (indexFromToday === 0) return 'Today';
  if (indexFromToday === 1) return 'Tomorrow';
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString([], { weekday: 'long' });
}

function farmFallbackCoordinates(farm: Farm): { lat: number; lng: number } {
  if (farm.coordinates && Number.isFinite(farm.coordinates.lat) && Number.isFinite(farm.coordinates.lng)) {
    return farm.coordinates;
  }
  return DEFAULT_FARM_COORDINATES;
}

export function getFarmFallbackCoordinates(farm: Farm): { lat: number; lng: number } {
  return farmFallbackCoordinates(farm);
}

export function getUserCoordinates(
  fallback: { lat: number; lng: number }
): Promise<{ lat: number; lng: number; source: WeatherLocationSource }> {
  if (cachedGeolocation && cachedGeolocation !== 'denied') {
    return Promise.resolve({ ...cachedGeolocation, source: 'geolocation' });
  }
  if (cachedGeolocation === 'denied') {
    return Promise.resolve({ ...fallback, source: 'farm' });
  }

  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      cachedGeolocation = 'denied';
      resolve({ ...fallback, source: 'farm' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        cachedGeolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        resolve({ ...cachedGeolocation, source: 'geolocation' });
      },
      () => {
        cachedGeolocation = 'denied';
        resolve({ ...fallback, source: 'farm' });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  });
}

function findHourIndex(times: string[], currentTime: string): number {
  const exact = times.indexOf(currentTime);
  if (exact >= 0) return exact;

  const currentMs = new Date(currentTime).getTime();
  let best = 0;
  let bestDelta = Number.POSITIVE_INFINITY;
  times.forEach((time, index) => {
    const delta = Math.abs(new Date(time).getTime() - currentMs);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = index;
    }
  });
  return best;
}

function maxInRange(values: Array<number | null | undefined>, start: number, count: number): number {
  let max = 0;
  for (let i = start; i < Math.min(values.length, start + count); i += 1) {
    const value = values[i];
    if (value != null && value > max) max = value;
  }
  return round(max);
}

function meanInRange(values: Array<number | null | undefined>, start: number, count: number): number {
  let sum = 0;
  let n = 0;
  for (let i = start; i < Math.min(values.length, start + count); i += 1) {
    const value = values[i];
    if (value != null && !Number.isNaN(value)) {
      sum += value;
      n += 1;
    }
  }
  return n === 0 ? 0 : sum / n;
}

function buildHourlyForecast(
  hourly: NonNullable<OpenMeteoResponse['hourly']>,
  startIndex: number
): WeatherHourly[] {
  const rows: WeatherHourly[] = [];
  for (let step = 0; step < 8; step += 1) {
    const index = startIndex + step * 3;
    if (index >= hourly.time.length) break;

    const temperature = round(firstNumber([hourly.temperature_2m[index]]));
    const rainProbability = round(firstNumber([hourly.precipitation_probability[index]]));
    const humidity = round(firstNumber([hourly.relative_humidity_2m[index]]));
    const soilMoisture = volumetricToPercent(hourly.soil_moisture_0_to_1cm[index]);
    const meta = weatherCodeToMeta(hourly.weather_code[index], temperature);

    rows.push({
      time: formatHourLabel(hourly.time[index]),
      condition: meta.condition,
      temperature,
      rainProbability,
      humidity,
      soilMoisture,
      aiDecision: irrigationDecision(rainProbability, soilMoisture),
      iconName: meta.iconName,
    });
  }
  return rows;
}

function buildDailyForecast(
  daily: NonNullable<OpenMeteoResponse['daily']>,
  hourly: NonNullable<OpenMeteoResponse['hourly']>,
  todayDate: string
): WeatherDaily[] {
  const start = daily.time.findIndex((day) => day >= todayDate);
  const from = start >= 0 ? start : 0;
  const rows: WeatherDaily[] = [];

  for (let i = from; i < daily.time.length && rows.length < 7; i += 1) {
    const day = daily.time[i];
    const tempHigh = round(firstNumber([daily.temperature_2m_max[i]]));
    const tempLow = round(firstNumber([daily.temperature_2m_min[i]]));
    const rainProbability = round(firstNumber([daily.precipitation_probability_max[i]]));
    const meta = weatherCodeToMeta(daily.weather_code[i], tempHigh);

    const hourStart = hourly.time.findIndex((time) => time.startsWith(day));
    const humidity = hourStart >= 0
      ? round(meanInRange(hourly.relative_humidity_2m, hourStart, 24))
      : 0;
    const soilMoisture = hourStart >= 0
      ? volumetricToPercent(meanInRange(hourly.soil_moisture_0_to_1cm, hourStart, 24))
      : 0;

    rows.push({
      day: formatDayLabel(day, rows.length),
      condition: meta.condition,
      tempHigh,
      tempLow,
      rainProbability,
      humidity,
      soilMoisture,
      recommendation: dailyRecommendation(rainProbability, tempHigh, soilMoisture),
      iconName: meta.iconName,
    });
  }

  return rows;
}

function buildSoilTrend(
  hourly: NonNullable<OpenMeteoResponse['hourly']>,
  currentIndex: number
): SoilMoistureTrendPoint[] {
  const points: SoilMoistureTrendPoint[] = [];
  const start = Math.max(0, currentIndex - 24);

  for (let i = start; i <= currentIndex + 6 && i < hourly.time.length; i += 3) {
    const hoursFromNow = i - currentIndex;
    let label: string;
    if (hoursFromNow === 0) label = 'Current';
    else if (hoursFromNow < 0) label = `${Math.abs(hoursFromNow)}h ago`;
    else label = `+${hoursFromNow}h (pred)`;

    points.push({
      time: label,
      moisture: volumetricToPercent(hourly.soil_moisture_0_to_1cm[i]),
      optimalMin: 40,
      critical: 20,
    });
  }

  return points;
}

export async function fetchOpenMeteoWeather(
  lat: number,
  lng: number
): Promise<Omit<WeatherSnapshot, 'locationSource'>> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,relative_humidity_2m,weather_code,soil_moisture_0_to_1cm',
    hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,soil_moisture_0_to_1cm,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    past_days: '1',
    forecast_days: '7',
    timezone: 'auto',
  });

  const response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Weather request failed (${response.status})`);
  }

  const data = (await response.json()) as OpenMeteoResponse;
  if (data.error || !data.current || !data.hourly || !data.daily) {
    throw new Error(data.reason || 'Weather service returned an incomplete forecast');
  }

  const currentIndex = findHourIndex(data.hourly.time, data.current.time);
  const rainProbability = maxInRange(data.hourly.precipitation_probability, currentIndex, 6);
  const soilMoisture = volumetricToPercent(
    data.current.soil_moisture_0_to_1cm ?? data.hourly.soil_moisture_0_to_1cm[currentIndex]
  );
  const temperature = round(data.current.temperature_2m, 1);
  const humidity = round(data.current.relative_humidity_2m);
  const meta = weatherCodeToMeta(data.current.weather_code, temperature);
  const todayDate = data.current.time.slice(0, 10);

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    current: {
      temperature,
      humidity,
      rainProbability,
      soilMoisture,
      condition: meta.condition,
      iconName: meta.iconName,
    },
    hourly: buildHourlyForecast(data.hourly, currentIndex),
    daily: buildDailyForecast(data.daily, data.hourly, todayDate),
    soilTrend: buildSoilTrend(data.hourly, currentIndex),
  };
}

export async function loadWeatherForFarm(farm: Farm): Promise<WeatherSnapshot> {
  const fallback = farmFallbackCoordinates(farm);
  const location = await getUserCoordinates(fallback);
  const forecast = await fetchOpenMeteoWeather(location.lat, location.lng);
  return {
    ...forecast,
    locationSource: location.source,
  };
}
