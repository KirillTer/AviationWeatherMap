# Aviation Weather Map

Interactive React + MapLibre GL viewer for SIGMET and AIRSIGMET advisories from the Aviation Weather Center API. Includes altitude and time filters, layer toggles, and clickable popups.

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
2. Start dev server:
   ```bash
   npm run dev
   ```
   Open the printed local URL (default http://localhost:5173).
3. Run tests:
   ```bash
   npm test -- --run
   ```

## Notes
- Data source endpoints use the AWC Data API (`/api/data/isigmet`, `/api/data/airsigmet`) and a Vite dev proxy (`/api/awc` → `https://aviationweather.gov/api/data`) to avoid CORS during development. For production, set `VITE_AWC_BASE=https://aviationweather.gov/api/data` or route through your own backend.
- Time filtering uses a client-side window centered on the chosen offset (24h back / 6h forward). Altitude filtering uses any available altitude properties present in the feed (`min_ft`, `max_ft`, `floor`, `ceiling`, etc.).
