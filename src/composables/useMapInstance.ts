import { shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import { useMapView } from '@/stores/mapViewStore';
import auth from '@/services/auth';
import { baseLayers } from '@/stores/mapConfig';

// ── Martin diagnostic ─────────────────────────────────────────────────────────
// Fetches the Martin catalog (/api/martin/) and logs available sources + their
// source-layer names. This helps catch source-layer name mismatches at startup.
// Only called in dev mode (see map 'load' handler below).
const EXPECTED_MARTIN_SOURCES: Record<string, string> = {
    'metro_line_M1':      'metro_line_M1',
    'metro_line_M2':      'metro_line_M2',
    'metro_line_M3':      'metro_line_M3',
    'metro_line_M4':      'metro_line_M4',
    'barbershop_density': 'barbershop_density',
    'population_grid':    'population_grid',
    'opportunity_heatmap':'opportunity_heatmap',
    'osm_edges':          'osm_edges',
    'osm_pois':           'osm_pois',
    'sofiaplan_zoning_tiles':               'sofiaplan_zoning_tiles',
    'sofiaplan_income_tiles':               'sofiaplan_income_tiles',
    'sofiaplan_property_prices_tiles':      'sofiaplan_property_prices_tiles',
    'sofiaplan_metro_catchments_tiles':     'sofiaplan_metro_catchments_tiles',
    'sofiaplan_pedestrian_syntax_tiles':    'sofiaplan_pedestrian_syntax_tiles',
    'sofiaplan_population_grid_tiles':      'sofiaplan_population_grid_tiles',
    'sofiaplan_business_turnover_tiles':    'sofiaplan_business_turnover_tiles',
    'sofiaplan_development_potential_tiles':'sofiaplan_development_potential_tiles',
    'sofiaplan_zoning_params':              'sofiaplan_zoning_params',
    // Accessibility & Transport
    'sofiaplan_transit_access_ge_tiles':         'sofiaplan_transit_access_ge_tiles',
    'sofiaplan_transit_access_district_tiles':   'sofiaplan_transit_access_district_tiles',
    'sofiaplan_metro_access_800m_tiles':         'sofiaplan_metro_access_800m_tiles',
    'sofiaplan_metro_access_1200m_tiles':        'sofiaplan_metro_access_1200m_tiles',
    'sofiaplan_bus_lines_tiles':                 'sofiaplan_bus_lines_tiles',
    'sofiaplan_bus_lines_alt_tiles':             'sofiaplan_bus_lines_alt_tiles',
    'sofiaplan_trolleybus_lines_tiles':          'sofiaplan_trolleybus_lines_tiles',
    'sofiaplan_tram_lines_tiles':                'sofiaplan_tram_lines_tiles',
    'sofiaplan_tram_lines_alt_tiles':            'sofiaplan_tram_lines_alt_tiles',
    'sofiaplan_railway_stations_tiles':          'sofiaplan_railway_stations_tiles',
};

async function checkMartinCatalog() {
    try {
        const res = await fetch('/api/martin/catalog');
        if (!res.ok) { console.warn('[Martin] catalog not available (/api/martin/catalog returned', res.status, ')'); return; }
        const catalog = await res.json();
        // Martin catalog has shape: { [id]: { content_type, ... } } or an array
        const available: string[] = Array.isArray(catalog)
            ? catalog.map((s: any) => s.id ?? s)
            : Object.keys(catalog);
        console.info('[Martin] available sources:', available);

        for (const [urlName] of Object.entries(EXPECTED_MARTIN_SOURCES)) {
            // Martin catalog uses lowercase by convention — check case-insensitively
            const found = available.find(s => s.toLowerCase() === urlName.toLowerCase());
            if (!found) {
                console.warn(`[Martin] ⚠️  source "${urlName}" not in catalog. Available:`, available);
            } else if (found !== urlName) {
                console.warn(`[Martin] ⚠️  source "${urlName}" found as "${found}" (case differs). Update source-layer to: "${found}"`);
            }
        }

        // For each source: fetch its TileJSON to verify the actual source-layer id
        for (const urlName of Object.keys(EXPECTED_MARTIN_SOURCES)) {
            const tjRes = await fetch(`/api/martin/${urlName}`);
            if (!tjRes.ok) { console.warn(`[Martin] TileJSON 404 for "${urlName}"`); continue; }
            const tj = await tjRes.json();
            const layers: string[] = (tj.vector_layers ?? []).map((l: any) => l.id);
            const expected = EXPECTED_MARTIN_SOURCES[urlName]!;
            if (!layers.includes(expected)) {
                console.warn(`[Martin] ⚠️  source-layer mismatch for "${urlName}": expected "${expected}", actual:`, layers);
            } else {
                console.info(`[Martin] ✓ "${urlName}" → source-layer "${expected}"`);
            }
        }
    } catch (e) {
        console.warn('[Martin] catalog check failed (Martin not running?)', e);
    }
}

// Convert Leaflet-style URL (with {s}, {r}) to array of MapLibre tile URLs
function toMaplibreTileUrls(url: string): string[] {
    const clean = url.replace('{r}', '');
    if (clean.includes('{s}')) {
        const subs = clean.includes('carto') ? ['a', 'b', 'c', 'd'] : ['a', 'b', 'c'];
        return subs.map(s => clean.replace('{s}', s));
    }
    return [clean];
}

export function useMapInstance() {
    const route = useRoute();
    const { mapCenter, mapZoom, initializeFromURL, updateURL } = useMapView();

    watch(() => route.query, () => {
        initializeFromURL();
    }, { deep: true, immediate: true });

    const mapInstance = shallowRef<MapLibreMap | null>(null);

    const initMap = (container: HTMLElement): Promise<MapLibreMap> => {
        const center = mapCenter.value; // [lat, lng]

        const map = new maplibregl.Map({
            container,
            style: {
                version: 8,
                glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
                sources: {},
                layers: [],
            },
            center: [center[1], center[0]], // MapLibre uses [lng, lat]
            zoom: mapZoom.value,
            attributionControl: false,
            transformRequest: (url, resourceType) => {
                if (resourceType === 'Tile' && url.includes('/api/')) {
                    const token = auth.getTokenSync();
                    if (token) {
                        return { url, headers: { Authorization: `Bearer ${token}` } };
                    }
                }
                return { url };
            },
        });

        mapInstance.value = map;

        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

        const resizeObserver = new ResizeObserver(() => map.resize());
        resizeObserver.observe(container);

        // Surface all MapLibre errors (tile failures, source-layer mismatches, etc.)
        map.on('error', (e) => {
            console.error('[MapLibre]', e.error?.message ?? e);
        });

        return new Promise((resolve) => {
            map.on('load', () => {
                // In dev mode: fetch Martin catalog to verify source-layer names
                if (import.meta.env.DEV) {
                    checkMartinCatalog();
                }

                // Add base tile layer from mapConfig
                const activeLayer = baseLayers.value.find(l => l.visible) ?? baseLayers.value[0]!;
                map.addSource('base-tiles', {
                    type: 'raster',
                    tiles: toMaplibreTileUrls(activeLayer.url),
                    tileSize: 256,
                    attribution: activeLayer.attribution,
                });
                map.addLayer({ id: 'base-tiles', type: 'raster', source: 'base-tiles' });

                // URL sync
                let updateTimeout: ReturnType<typeof setTimeout>;
                map.on('moveend', () => {
                    clearTimeout(updateTimeout);
                    updateTimeout = setTimeout(() => {
                        const c = map.getCenter();
                        const z = map.getZoom();
                        mapCenter.value = [c.lat, c.lng];
                        mapZoom.value = z;
                        updateURL(c.lat, c.lng, z);
                    }, 300);
                });

                resolve(map);
            });
        });
    };

    const switchBaseLayer = (map: MapLibreMap, layerName: string) => {
        const layer = baseLayers.value.find(l => l.name === layerName);
        if (!layer) return;
        baseLayers.value.forEach(l => { l.visible = l.name === layerName; });
        const source = map.getSource('base-tiles') as maplibregl.RasterTileSource;
        if (source) {
            (source as any).setTiles(toMaplibreTileUrls(layer.url));
        }
    };

    return {
        mapInstance,
        initMap,
        switchBaseLayer,
    };
}
