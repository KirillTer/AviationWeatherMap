import { describe, expect, it } from 'vitest';
import { filterWeatherFeatures } from '../utils/filters';
import { WeatherFeatureCollection } from '../types';

const sampleData: WeatherFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
      properties: {
        hazard: 'TURB',
        min_ft: 10000,
        max_ft: 20000,
        validTimeFrom: '2024-01-01T00:00:00Z',
        validTimeTo: '2024-01-01T06:00:00Z'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]] },
      properties: {
        hazard: 'ICE',
        min_ft: 30000,
        max_ft: 40000,
        validTimeFrom: '2024-01-01T00:00:00Z',
        validTimeTo: '2024-01-01T06:00:00Z'
      }
    }
  ]
};

describe('filterWeatherFeatures', () => {
  it('filters by altitude overlap', () => {
    const result = filterWeatherFeatures(sampleData, {
      altitudeMin: 5000,
      altitudeMax: 25000,
      targetTime: new Date('2024-01-01T03:00:00Z')
    });
    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties?.hazard).toBe('TURB');
  });

  it('filters by time window', () => {
    const result = filterWeatherFeatures(sampleData, {
      altitudeMin: 0,
      altitudeMax: 50000,
      targetTime: new Date('2024-01-01T12:00:00Z')
    });
    expect(result.features).toHaveLength(0);
  });
});
