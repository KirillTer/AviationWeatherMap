import { WeatherFeatureCollection } from '../types';
import { buildTimeWindow } from '../utils/time';

// Base URL resolution: env override > dev proxy > direct API
// This avoids CORS in local dev (proxy) while still working in production by default.
const resolveApiBase = () => {
  if (import.meta.env.VITE_AWC_BASE) return import.meta.env.VITE_AWC_BASE;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return '/api/awc';
  }
  return 'https://aviationweather.gov/api/data';
};

const API_BASE = resolveApiBase();
const DEMO_HEADERS = { Accept: 'application/geo+json, application/json' };

async function fetchGeoJson(url: string, signal?: AbortSignal): Promise<WeatherFeatureCollection> {
  const response = await fetch(url, { signal, headers: DEMO_HEADERS });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  const data = (await response.json()) as WeatherFeatureCollection;
  if (!data || data.type !== 'FeatureCollection') {
    throw new Error('Invalid GeoJSON response');
  }
  return data;
}

function buildQuery(target: Date) {
  const { start, end } = buildTimeWindow(target);
  const params = new URLSearchParams({
    format: 'geojson',
    from: start.toISOString(),
    to: end.toISOString()
  });
  return params.toString();
}

export async function fetchSigmets(target: Date, signal?: AbortSignal): Promise<WeatherFeatureCollection> {
  const query = buildQuery(target);
  const url = `${API_BASE}/isigmet?${query}`;
  return fetchGeoJson(url, signal);
}

export async function fetchAirSigmets(target: Date, signal?: AbortSignal): Promise<WeatherFeatureCollection> {
  const query = buildQuery(target);
  const url = `${API_BASE}/airsigmet?${query}`;
  return fetchGeoJson(url, signal);
}
