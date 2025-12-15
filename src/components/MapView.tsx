import { useEffect, useRef } from 'react';
import maplibregl, { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import { WeatherFeatureCollection, WeatherProperties } from '../types';

interface MapViewProps {
  sigmets: WeatherFeatureCollection;
  airSigmets: WeatherFeatureCollection;
  showSigmet: boolean;
  showAirSigmet: boolean;
}

function formatPopupContent(props: WeatherProperties): string {
  const hazard = props.hazard || props.phenomenon || props.event || 'SIGMET';
  const altitudeFloor = props.min_ft ?? props.floor ?? props.base;
  const altitudeTop = props.max_ft ?? props.ceiling ?? props.top;
  const altitudeText = `${altitudeFloor ?? 'Unknown'} to ${altitudeTop ?? 'Unknown'} ft`;
  const validFrom = props.validTimeFrom || props.valid_time_from || props.valid_from || props.issueTime;
  const validTo = props.validTimeTo || props.valid_time_to || props.valid_to;
  const rawText = (props.raw_text || props.rawText || props.raw) as string | undefined;

  return `
    <div class="popup-card">
      <div class="popup-header">
        <span class="pill pill-sigmet is-active">SIGMET</span>
        <span class="popup-hazard">${hazard}</span>
      </div>
      <div class="popup-line"><span class="popup-label">Hazard:</span><span>${hazard}</span></div>
      <div class="popup-line"><span class="popup-label">Altitude:</span><span>${altitudeText}</span></div>
      <div class="popup-line"><span class="popup-label">Valid From:</span><span>${validFrom || 'Unknown'}</span></div>
      <div class="popup-line"><span class="popup-label">Valid To:</span><span>${validTo || 'Unknown'}</span></div>
      ${rawText ? `<div class="popup-raw">${rawText}</div>` : ''}
    </div>
  `;
}

const DEFAULT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const MapView = ({ sigmets, airSigmets, showSigmet, showAirSigmet }: MapViewProps) => {
  const mapRef = useRef<MapLibreMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DEFAULT_STYLE,
      center: [-96, 38],
      zoom: 3.8,
      attributionControl: { compact: true }
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    const addSourcesAndLayers = () => {
      if (!map.getSource('sigmet')) {
        map.addSource('sigmet', { type: 'geojson', data: sigmets });
      }
      if (!map.getSource('airsigmet')) {
        map.addSource('airsigmet', { type: 'geojson', data: airSigmets });
      }

      if (!map.getLayer('sigmet-fill')) {
        map.addLayer({
          id: 'sigmet-fill',
          type: 'fill',
          source: 'sigmet',
          paint: {
            'fill-color': '#ef4444',
            'fill-opacity': 0.28,
            'fill-outline-color': '#991b1b'
          }
        });
        map.addLayer({
          id: 'sigmet-outline',
          type: 'line',
          source: 'sigmet',
          paint: { 'line-color': '#b91c1c', 'line-width': 1.2, 'line-dasharray': [1, 1] }
        });
      }

      if (!map.getLayer('airsigmet-fill')) {
        map.addLayer({
          id: 'airsigmet-fill',
          type: 'fill',
          source: 'airsigmet',
          paint: {
            'fill-color': '#38bdf8',
            'fill-opacity': 0.22,
            'fill-outline-color': '#0ea5e9'
          }
        });
        map.addLayer({
          id: 'airsigmet-outline',
          type: 'line',
          source: 'airsigmet',
          paint: { 'line-color': '#0284c7', 'line-width': 1.2 }
        });
      }

      const handleClick = (layerId: string) => (event: maplibregl.MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature?.properties) return;
        const popupHtml = formatPopupContent(feature.properties as WeatherProperties);
        new maplibregl.Popup({ closeButton: true })
          .setLngLat(event.lngLat)
          .setHTML(popupHtml)
          .addTo(map);
      };

      map.on('click', 'sigmet-fill', handleClick('sigmet-fill'));
      map.on('click', 'airsigmet-fill', handleClick('airsigmet-fill'));
      map.on('mouseenter', 'sigmet-fill', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseenter', 'airsigmet-fill', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', 'sigmet-fill', () => (map.getCanvas().style.cursor = ''));
      map.on('mouseleave', 'airsigmet-fill', () => (map.getCanvas().style.cursor = ''));
    };

    if (map.isStyleLoaded()) {
      addSourcesAndLayers();
    } else {
      map.on('load', addSourcesAndLayers);
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const updateSource = (id: string, data: WeatherFeatureCollection) => {
      const source = map.getSource(id) as GeoJSONSource | undefined;
      if (source) {
        source.setData(data as any);
      }
    };
    updateSource('sigmet', sigmets);
    updateSource('airsigmet', airSigmets);

    const setVisibility = (layerId: string, visible: boolean) => {
      if (!map.getLayer(layerId)) return;
      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    };

    setVisibility('sigmet-fill', showSigmet);
    setVisibility('sigmet-outline', showSigmet);
    setVisibility('airsigmet-fill', showAirSigmet);
    setVisibility('airsigmet-outline', showAirSigmet);
  }, [sigmets, airSigmets, showAirSigmet, showSigmet]);

  return <div ref={containerRef} className="map-canvas" />;
};

export default MapView;
