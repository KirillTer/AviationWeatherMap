import React from 'react';
import { formatOffsetLabel } from '../utils/time';

interface FilterPanelProps {
  showSigmet: boolean;
  showAirSigmet: boolean;
  altitudeRange: [number, number];
  timeOffset: number;
  onToggleSigmet: (value: boolean) => void;
  onToggleAirSigmet: (value: boolean) => void;
  onAltitudeChange: (range: [number, number]) => void;
  onTimeChange: (offset: number) => void;
  onReset: () => void;
}

const clampAltitude = (value: number) => Math.min(48000, Math.max(0, value));

const FilterPanel: React.FC<FilterPanelProps> = ({
  showSigmet,
  showAirSigmet,
  altitudeRange,
  timeOffset,
  onToggleSigmet,
  onToggleAirSigmet,
  onAltitudeChange,
  onTimeChange,
  onReset
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
    <div className="panel">
      <h3 className="panel-title">Filters</h3>
      <p className="secondary">Adjust layers, altitude, and reference time. Updates apply instantly.</p>

      <div className="toggle-row">
        <span className="label-strong">SIGMET</span>
        <input type="checkbox" checked={showSigmet} onChange={(e) => onToggleSigmet(e.target.checked)} />
      </div>
      <div className="toggle-row">
        <span className="label-strong">AIR SIGMET</span>
        <input type="checkbox" checked={showAirSigmet} onChange={(e) => onToggleAirSigmet(e.target.checked)} />
      </div>

      <div className="toggle-row" style={{ borderBottom: 'none' }}>
        <div>
          <div className="label-strong">Altitude window</div>
          <p className="secondary">0–48,000 ft</p>
        </div>
        <div className="range-group">
          <input
            aria-label="Minimum altitude"
            type="range"
            min={0}
            max={48000}
            step={1000}
            value={altMin}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="slider"
          />
          <input
            aria-label="Maximum altitude"
            type="range"
            min={0}
            max={48000}
            step={1000}
            value={altMax}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="slider"
          />
        </div>
      </div>
      <div className="range-labels">
        <span>{altMin.toLocaleString()} ft</span>
        <span>{altMax.toLocaleString()} ft</span>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <div className="label-strong">Reference time</div>
        <p className="secondary">Slide -24h to +6h from now</p>
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
        <div className="range-labels">
          <span>-24h</span>
          <span>{formatOffsetLabel(timeOffset)}</span>
          <span>+6h</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="button" type="button" onClick={() => onTimeChange(0)}>
            Jump to Now
          </button>
          <button className="button" type="button" onClick={onReset} style={{ background: '#1e293b' }}>
            Reset filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
