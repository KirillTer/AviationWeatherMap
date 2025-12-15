# Aviation Weather Map

Interactive React + MapLibre GL viewer for SIGMET and AIRSIGMET advisories from the Aviation Weather Center (AWC) API.

## Features
- MapLibre GL with OpenStreetMap tiles and live GeoJSON layers.
- Layer toggles for SIGMET and AIRSIGMET.
- Altitude window slider (0–48,000 ft, 1,000 ft steps).
- Time offset slider (-24h to +6h from now); fetches and filters data around that reference time.
- Popups on polygon click with hazard, region, altitude, and validity window.
- Basic unit test coverage for filtering logic (Vitest).

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server (uses Vite proxy for AWC API on localhost):
   ```bash
   npm run dev
   ```
   Open the printed local URL (default http://localhost:5173).
3. Run tests:
   ```bash
   npm test -- --run
   ```

## Data source & CORS
- The app calls the AWC Data API (`/api/data/isigmet`, `/api/data/airsigmet`).
- On localhost, requests are proxied via Vite: `/api/awc/*` → `https://aviationweather.gov/api/data/*`.
- Map base layer uses Carto Positron GL style (`https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`) for reliability. If you prefer MapLibre demo tiles, set `DEFAULT_STYLE` in `src/components/MapView.tsx` accordingly.
- In production, the app defaults to hitting `https://aviationweather.gov/api/data`. Override with `VITE_AWC_BASE` if you need a custom proxy or different base.
- Query params used: `format=geojson`, `from=<ISO>`, `to=<ISO>` built around the selected reference time (24h back, 6h forward).

## Notes
- Time filtering uses a client-side window centered on the chosen offset. Altitude filtering uses available altitude properties (`min_ft`, `max_ft`, `floor`, `ceiling`, etc.).