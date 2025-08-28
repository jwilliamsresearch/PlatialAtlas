"use client";
import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import * as h3 from 'h3-js';
import H3CellModal from './H3CellModal';
import { Box } from '@mui/material';
import { fetchH3Choropleth } from '@/lib/h3';
import { getPalette, PaletteName } from '@/lib/palettes';

type Props = {
  res: number;
  showGrid?: boolean;
  sources?: string[];
  facets?: string[]; // selected facets; empty = total
  palette?: PaletteName;
  classes?: number; // number of color classes
};

export default function MapShell({ res, showGrid = true, sources, facets = [], palette = 'YlGnBu', classes = 5 }: Props) {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<null | { h3: string; n: number; cats?: Record<string, number> }>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const eventsBound = useRef(false);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const minimalStyle = {
      version: 8,
      sources: {},
      layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#f9fafb' } }],
    } as any;

    const osmStyle = {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
          maxzoom: 19,
        },
      },
      layers: [
        { id: 'background', type: 'background', paint: { 'background-color': '#eef2f7' } },
        { id: 'osm', type: 'raster', source: 'osm' },
      ],
    } as any;

    const init = async () => {
      let style: any = osmStyle; // default to OSM
      const url = process.env.NEXT_PUBLIC_MAP_STYLE_URL || '';
      try {
        if (url) {
          const resp = await fetch(url, { cache: 'no-store' });
          if (resp.ok) {
            style = await resp.json();
          }
        }
      } catch (_) {
        // fall back to OSM / minimal style
      }

      const map = new maplibregl.Map({
        container: containerRef.current!,
        style,
        center: [-1.15, 52.95],
        zoom: 9,
      });
      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.on('load', () => {
        setReady(true);
        // ensure layout after first paint
        setTimeout(() => map.resize(), 0);
      });
      map.on('error', (e) => {
        // eslint-disable-next-line no-console
        console.warn('MapLibre error', e && (e as any).error?.message);
      });
      mapRef.current = map;
    };

    init();
    return () => {
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !ready) return;
    const layerId = 'h3-fill';
    const hoverId = 'h3-hover';
    const sourceId = 'h3';
    const update = async () => {
      const m = mapRef.current;
      if (!m) return;
      const b = m.getBounds();
      const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(',');
      let fc: any = { type: 'FeatureCollection', features: [] };
      try {
        fc = await fetchH3Choropleth(res, bbox, sources, facets);
      } catch (err) {
        // Fallback: compute grid client-side with zero counts
        try {
          const [minx, miny, maxx, maxy] = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
          const ring: [number, number][] = [
            [minx, miny],
            [maxx, miny],
            [maxx, maxy],
            [minx, maxy],
            [minx, miny],
          ];
          const cells: string[] = (h3 as any).polygonToCells([ring], res, true);
          const features = cells.map((idx: string) => {
            const boundary: any = (h3 as any).cellToBoundary(idx);
            const asLngLat = Array.isArray(boundary[0])
              ? (boundary as [number, number][]).map(([lat, lng]) => [lng, lat])
              : (boundary as { lat: number; lng: number }[]).map(({ lat, lng }) => [lng, lat]);
            return { type: 'Feature', properties: { h3: idx, n: 0 }, geometry: { type: 'Polygon', coordinates: [asLngLat.concat([asLngLat[0]])] } };
          });
          fc = { type: 'FeatureCollection', features };
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('choropleth fetch failed; fallback grid error', e);
        }
      }
      // Compute color stops based on current data max
      const values = (fc.features || []).map((f: any) => Number(f.properties?.n ?? 0));
      const max = Math.max(1, ...values, 0);
      const colors = getPalette(palette, classes);
      // Build a step expression: low->high
      const steps: any[] = ['step', ['get', 'n'], colors[0]];
      for (let i = 1; i < colors.length; i++) {
        const t = (i / (colors.length - 1)) * max;
        steps.push(t, colors[i]);
      }

      const src = m.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
      if (src) {
        src.setData(fc as any);
        // Update color ramp on each refresh so it adapts to current max
        m.setPaintProperty(layerId, 'fill-color', steps as any);
      } else {
        m.addSource(sourceId, { type: 'geojson', data: fc as any, generateId: true } as any);
        m.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          paint: {
            // Transparent when n == 0, higher opacity on hover otherwise
            'fill-opacity': [
              'case',
              ['==', ['get', 'n'], 0], 0,
              ['boolean', ['feature-state', 'hover'], false], 0.75,
              0.55,
            ],
            'fill-color': steps,
            'fill-outline-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false], '#111',
              '#555'
            ]
          }
        });
        // Add outlines for visibility even when n=0
        m.addLayer({
          id: 'h3-outline',
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#444',
            'line-width': 1,
            // Hide outline for zero-valued hexes
            'line-opacity': [
              'case',
              ['==', ['get', 'n'], 0], 0,
              0.5
            ],
          },
        });
        // Hover highlight layer (thicker outline)
        m.addLayer({
          id: hoverId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#111',
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false], 2.5,
              0
            ],
            'line-opacity': 0.9,
          },
        });
      }
      m.setLayoutProperty(layerId, 'visibility', showGrid ? 'visible' : 'none');
      if (m.getLayer('h3-outline')) {
        m.setLayoutProperty('h3-outline', 'visibility', showGrid ? 'visible' : 'none');
      }
      if (m.getLayer(hoverId)) {
        m.setLayoutProperty(hoverId, 'visibility', showGrid ? 'visible' : 'none');
      }
    };
    update();
    const m = mapRef.current;
    if (!m) return;
    m.on('moveend', update);
    return () => { if (m) m.off('moveend', update); };
  }, [res, ready, showGrid, sources, facets, palette, classes]);

  // Bind click/hover events once layers are present
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !ready || eventsBound.current === true) return;
    const ensureHandlers = () => {
      if (m.getLayer('h3-fill') && !eventsBound.current) {
        const clickHandler = (e: any) => {
          const f = e.features && e.features[0];
          if (!f) return;
          const p: any = f.properties || {};
          const n = typeof p.n === 'string' ? parseInt(p.n, 10) : (p.n ?? 0);
          let cats: any = p.cats;
          if (typeof cats === 'string') {
            try { cats = JSON.parse(cats); } catch { cats = {}; }
          }
          if (!cats || typeof cats !== 'object') cats = {};
          setSelected({ h3: p.h3, n, cats });
          setModalOpen(true);
        };
        let hoveredId: number | null = null;
        const hoverEnter = (e: any) => {
          const f = e.features && e.features[0];
          if (!f) return;
          if (hoveredId !== null) m.setFeatureState({ source: 'h3', id: hoveredId }, { hover: false } as any);
          hoveredId = f.id as number;
          m.setFeatureState({ source: 'h3', id: hoveredId }, { hover: true } as any);
          m.getCanvas().style.cursor = 'pointer';
        };
        const hoverLeave = () => {
          if (hoveredId !== null) m.setFeatureState({ source: 'h3', id: hoveredId }, { hover: false } as any);
          hoveredId = null;
          m.getCanvas().style.cursor = '';
        };
        const enterHandler = () => { m.getCanvas().style.cursor = 'pointer'; };
        const leaveHandler = () => { m.getCanvas().style.cursor = ''; };
        m.on('click', 'h3-fill', clickHandler);
        if (m.getLayer('h3-outline')) {
          m.on('click', 'h3-outline', clickHandler);
          m.on('mouseenter', 'h3-outline', enterHandler);
          m.on('mouseleave', 'h3-outline', leaveHandler);
        }
        m.on('mouseenter', 'h3-fill', enterHandler);
        m.on('mouseleave', 'h3-fill', leaveHandler);
        m.on('mousemove', 'h3-fill', hoverEnter);
        m.on('mouseleave', 'h3-fill', hoverLeave);
        eventsBound.current = true;
      }
    };
    ensureHandlers();
    m.on('sourcedata', ensureHandlers);
    return () => {
      try {
        m.off('sourcedata', ensureHandlers);
        if (m.getLayer('h3-fill')) {
          m.off('click', 'h3-fill', () => {});
          m.off('mouseenter', 'h3-fill', () => {});
          m.off('mouseleave', 'h3-fill', () => {});
        }
        if (m.getLayer('h3-outline')) {
          m.off('click', 'h3-outline', () => {});
          m.off('mouseenter', 'h3-outline', () => {});
          m.off('mouseleave', 'h3-outline', () => {});
        }
      } catch {}
    };
  }, [ready]);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <H3CellModal open={modalOpen} onClose={() => setModalOpen(false)} data={selected} />
    </Box>
  );
}
