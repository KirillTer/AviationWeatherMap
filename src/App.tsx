import { useEffect, useMemo, useState } from 'react';
import './App.css';
import FilterPanel from './components/FilterPanel';
import MapView from './components/MapView';
import { fetchAirSigmets, fetchSigmets } from './api/awc';
import { filterWeatherFeatures } from './utils/filters';
import { offsetToDate } from './utils/time';
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

  const targetTime = useMemo(() => offsetToDate(timeOffset), [timeOffset]);
  const targetTimeLabel = useMemo(() => targetTime.toLocaleString(), [targetTime]);

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
        // Ignore expected aborts during rapid filter changes
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setSigmets(emptyCollection);
        setAirSigmets(emptyCollection);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [targetTime]);

  const filteredSigmets = useMemo(
    () => filterWeatherFeatures(sigmets, { altitudeMin: altitudeRange[0], altitudeMax: altitudeRange[1], targetTime }),
    [sigmets, altitudeRange, targetTime]
  );

  const filteredAirSigmets = useMemo(
    () => filterWeatherFeatures(airSigmets, { altitudeMin: altitudeRange[0], altitudeMax: altitudeRange[1], targetTime }),
    [airSigmets, altitudeRange, targetTime]
  );

  return (
    <div className="map-page">
      {error && (
        <div className="floating-alert">
          {error}
        </div>
      )}

      <div className="map-viewport">
        {isLoading && <div className="loading-bar" />}
        <MapView
          sigmets={filteredSigmets}
          airSigmets={filteredAirSigmets}
          showSigmet={showSigmet}
          showAirSigmet={showAirSigmet}
        />

        <div className="control-panel">
          <FilterPanel
            showSigmet={showSigmet}
            showAirSigmet={showAirSigmet}
            altitudeRange={altitudeRange}
            timeOffset={timeOffset}
            onToggleSigmet={setShowSigmet}
            onToggleAirSigmet={setShowAirSigmet}
            onAltitudeChange={setAltitudeRange}
            onTimeChange={setTimeOffset}
            currentTimeLabel={targetTimeLabel}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
