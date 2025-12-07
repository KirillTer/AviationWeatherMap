import { Feature, FeatureCollection, Geometry } from 'geojson';

export interface WeatherProperties {
  id?: string | number;
  hazard?: string;
  phenomenon?: string;
  severity?: string;
  status?: string;
  region?: string;
  office?: string;
  min_ft?: number;
  max_ft?: number;
  floor?: number;
  ceiling?: number;
  base?: number;
  top?: number;
  validTimeFrom?: string;
  validTimeTo?: string;
  valid_time_from?: string;
  valid_time_to?: string;
  valid_from?: string;
  valid_to?: string;
  issueTime?: string;
  product?: string;
  event?: string;
  [key: string]: unknown;
}

export type WeatherFeature = Feature<Geometry, WeatherProperties>;
export type WeatherFeatureCollection = FeatureCollection<Geometry, WeatherProperties>;
