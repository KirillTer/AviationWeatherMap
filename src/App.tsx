import { useEffect, useMemo, useState } from 'react';
import './App.css';
import FilterPanel from './components/FilterPanel';
import MapView from './components/MapView';
import { fetchAirSigmets, fetchSigmets } from './api/awc';
import { filterWeatherFeatures } from './utils/filters';
import { formatOffsetLabel, formatRangeForDisplay, offsetToDate, buildTimeWindow } from './utils/time';
import { WeatherFeatureCollection } from './types';

const emptyCollection: WeatherFeatureCollection = { type: 'FeatureCollection', features: [] };

function App() {
  const [sigmets, setSigmets] = useState<WeatherFeatureCollection>(emptyCollection);
  const [airSigmets, setAirSigmets] = useState<WeatherFeatureCollection>(emptyCollection);
  const [showSigmet, setShowSigmet] = useState(true);
  const [showAirSigmet, setShowAirSigmet] = useState(true);
  const [altitudeRange, setAltitudeRange] = useState<[number, number]>([0, 48000]);
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const targetTime = useMemo(() => offsetToDate(timeOffset), [timeOffset]);
  const timeWindow = useMemo(() => buildTimeWindow(targetTime), [targetTime]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const [sigmetRes, airsigmetRes] = await Promise.all([
          fetchSigmets(targetTime, controller.signal),
          fetchAirSigmets(targetTime, controller.signal)
        ]);
        setSigmets(sigmetRes);
        setAirSigmets(airsigmetRes);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setSigmets(emptyCollection);
        setAirSigmets(emptyCollection);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [targetTime, refreshToken]);

  const filteredSigmets = useMemo(
    () => filterWeatherFeatures(sigmets, { altitudeMin: altitudeRange[0], altitudeMax: altitudeRange[1], targetTime }),
    [sigmets, altitudeRange, targetTime]
  );

  const filteredAirSigmets = useMemo(
    () => filterWeatherFeatures(airSigmets, { altitudeMin: altitudeRange[0], altitudeMax: altitudeRange[1], targetTime }),
    [airSigmets, altitudeRange, targetTime]
  );

  const totalCount = (showSigmet ? filteredSigmets.features.length : 0) +
    (showAirSigmet ? filteredAirSigmets.features.length : 0);

  const resetFilters = () => {
    setAltitudeRange([0, 48000]);
    setTimeOffset(0);
    setShowSigmet(true);
    setShowAirSigmet(true);
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <h1>Aviation Weather Map</h1>
          <div className="status-row">
            <span className="chip sigmet">SIGMET</span>
            <span className="chip airsigmet">AIR SIGMET</span>
            <span className="chip altitude">{altitudeRange[0].toLocaleString()} - {altitudeRange[1].toLocaleString()} ft</span>
            <span className="chip time">{formatOffsetLabel(timeOffset)}</span>
          </div>
        </div>
        <div className="badge">GeoJSON live feed</div>
      </header>

      <aside className="sidebar">
        <FilterPanel
          showSigmet={showSigmet}
          showAirSigmet={showAirSigmet}
          altitudeRange={altitudeRange}
          timeOffset={timeOffset}
          onToggleSigmet={setShowSigmet}
          onToggleAirSigmet={setShowAirSigmet}
          onAltitudeChange={setAltitudeRange}
          onTimeChange={setTimeOffset}
          onReset={resetFilters}
        />

        <div className="panel">
          <h3 className="panel-title">Legend & status</h3>
          <div className="legend">
            <div className="chip sigmet">SIGMET polygons</div>
            <div className="chip airsigmet">AIR SIGMET polygons</div>
            <div className="chip">Click polygons for popup</div>
          </div>
          <p className="secondary" style={{ marginTop: 10 }}>Total visible: {totalCount}</p>
          <p className="secondary">Time window: {formatRangeForDisplay(timeWindow.start, timeWindow.end)}</p>
        </div>
      </aside>

      <section className="map-panel">
        <div className="map-header">
          <div>
            <div className="label-strong">Interactive map</div>
            <p className="secondary">OpenStreetMap + MapLibre GL · Popups on click</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="button" onClick={() => setRefreshToken((v) => v + 1)} disabled={isLoading}>
              {isLoading ? 'Refreshing…' : 'Refresh now'}
            </button>
          </div>
        </div>
        {error && (
          <div style={{ padding: '12px 16px', color: '#b91c1c', background: '#fef2f2' }}>
            {error}
          </div>
        )}
        {isLoading && <div className="loading-bar" />}
        <div className="map-inner">
          <MapView
            sigmets={filteredSigmets}
            airSigmets={filteredAirSigmets}
            showSigmet={showSigmet}
            showAirSigmet={showAirSigmet}
          />
        </div>
      </section>
    </div>
  );
}

export default App;
