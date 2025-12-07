import { WeatherFeature, WeatherFeatureCollection, WeatherProperties } from '../types';

interface FilterParams {
  altitudeMin: number;
  altitudeMax: number;
  targetTime: Date;
}

const altitudeKeys = ['min_ft', 'max_ft', 'floor', 'ceiling', 'base', 'top', 'minAltFt', 'maxAltFt'];
const startTimeKeys = ['validTimeFrom', 'valid_time_from', 'valid_from'];
const endTimeKeys = ['validTimeTo', 'valid_time_to', 'valid_to'];

function readNumericProp(props: WeatherProperties | undefined, names: string[], fallback = 0): number | null {
  if (!props) return null;
  for (const name of names) {
    const value = props[name];
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return fallback ?? null;
}

function readTime(props: WeatherProperties | undefined, keys: string[]): Date | null {
  if (!props) return null;
  for (const key of keys) {
    const value = props[key];
    if (typeof value === 'string' && value) {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) return new Date(parsed);
    }
  }
  return null;
}

export function filterWeatherFeatures(
  collection: WeatherFeatureCollection,
  params: FilterParams
): WeatherFeatureCollection {
  const { altitudeMin, altitudeMax, targetTime } = params;
  const targetMs = targetTime.getTime();

  const features = collection.features.filter((feature: WeatherFeature) => {
    if (!feature.geometry) return false;
    const props = feature.properties;

    const floor = readNumericProp(props, ['min_ft', 'floor', 'base', 'minAltFt'], altitudeMin);
    const ceiling = readNumericProp(props, ['max_ft', 'ceiling', 'top', 'maxAltFt'], altitudeMax);
    const altitudeOverlaps = ceiling !== null && floor !== null && ceiling >= altitudeMin && floor <= altitudeMax;

    const start = readTime(props, startTimeKeys);
    const end = readTime(props, endTimeKeys);
    const timeMatches = start && end ? start.getTime() <= targetMs && targetMs <= end.getTime() : true;

    return altitudeOverlaps && timeMatches;
  });

  return { ...collection, features };
}
