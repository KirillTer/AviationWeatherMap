import React from 'react';
import { formatOffsetLabel } from '../utils/time';

interface FilterPanelProps {
  showSigmet: boolean;
  showAirSigmet: boolean;
  altitudeRange: [number, number];
  timeOffset: number;
  currentTimeLabel: string;
  onToggleSigmet: (value: boolean) => void;
  onToggleAirSigmet: (value: boolean) => void;
  onAltitudeChange: (range: [number, number]) => void;
  onTimeChange: (offset: number) => void;
}

const clampAltitude = (value: number) => Math.min(48000, Math.max(0, value));

const FilterPanel: React.FC<FilterPanelProps> = ({
  showSigmet,
  showAirSigmet,
  altitudeRange,
  timeOffset,
  currentTimeLabel,
  onToggleSigmet,
  onToggleAirSigmet,
  onAltitudeChange,
  onTimeChange
}) => {
  const [altMin, altMax] = altitudeRange;

  const handleMinChange = (value: number) => {
    const nextMin = clampAltitude(Math.min(value, altMax));
    onAltitudeChange([nextMin, altMax]);
  };

  const handleMaxChange = (value: number) => {
    const nextMax = clampAltitude(Math.max(value, altMin));
    onAltitudeChange([altMin, nextMax]);
  };

  return (
    <div className="card">
      <div className="card-row">
        <div className="card-label">Layers</div>
        <div className="pill-group">
          <button
            type="button"
            className={`pill pill-sigmet ${showSigmet ? 'is-active' : ''}`}
            onClick={() => onToggleSigmet(!showSigmet)}
          >
            SIGMET
          </button>
          <button
            type="button"
            className={`pill pill-airsigmet ${showAirSigmet ? 'is-active' : ''}`}
            onClick={() => onToggleAirSigmet(!showAirSigmet)}
          >
            AIRSIGMET
          </button>
        </div>
      </div>

      <div className="card-section">
        <div className="card-label">Altitude Range</div>
        <div className="card-sub">0 - 48,000 ft</div>
        <div className="dual-slider">
          <input
            aria-label="Minimum altitude"
            type="range"
            min={0}
            max={48000}
            step={500}
            value={altMin}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="slider"
          />
          <input
            aria-label="Maximum altitude"
            type="range"
            min={0}
            max={48000}
            step={500}
            value={altMax}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="slider"
          />
        </div>
        <div className="range-labels tight">
          <span>{altMin.toLocaleString()} ft</span>
          <span>{altMax.toLocaleString()} ft</span>
        </div>
      </div>

      <div className="card-section">
        <div className="card-label">Time Filter</div>
        <div className="card-sub">Slide -24h to +6h from now</div>
        <input
          aria-label="Time offset"
          type="range"
          min={-24}
          max={6}
          step={1}
          value={timeOffset}
          onChange={(e) => onTimeChange(Number(e.target.value))}
          className="slider"
        />
        <div className="range-labels tight">
          <span>-24h</span>
          <span>{formatOffsetLabel(timeOffset)}</span>
          <span>+6h</span>
        </div>
        <div className="time-readout">
          <div className="card-sub">Current time</div>
          <div className="time-value">{currentTimeLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
