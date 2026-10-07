import { onScopeDispose, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import maplibregl, { type Map as MapLibreMap, type StyleSpecification } from 'maplibre-gl';
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

// Namespace base-map resources so theme changes preserve application overlays.
function prepareBaseStyle(style: StyleSpecification): StyleSpecification {
    return {
        ...style,
        sources: Object.fromEntries(Object.entries(style.sources).map(([id, source]) =>
            [`basemap-${id}`, source]
        )),
        layers: style.layers.map(layer => ({
            ...layer,
            id: `basemap-${layer.id}`,
            ...('source' in layer ? { source: `basemap-${layer.source}` } : {}),
        })),
    };
}

export function useMapInstance() {
    const route = useRoute();
    const { mapCenter, mapZoom, initializeFromURL, updateURL } = useMapView();
    const mapInstance = shallowRef<MapLibreMap | null>(null);
    const abortController = new AbortController();

    onScopeDispose(() => {
        abortController.abort();
        mapInstance.value?.remove();
        mapInstance.value = null;
    });

    watch(() => route.query, () => {
        initializeFromURL();
        const map = mapInstance.value;
        if (!map) return;
        const center = map.getCenter();
        const [lat, lng] = mapCenter.value;
        // Ignore the rounding from our own URL writes to avoid a feedback loop.
        if (Math.abs(center.lat - lat) > 0.000001 || Math.abs(center.lng - lng) > 0.000001 ||
            Math.abs(map.getZoom() - mapZoom.value) > 0.000001) {
            map.jumpTo({ center: [lng, lat], zoom: mapZoom.value });
        }
    }, { deep: true, immediate: true });

    const initMap = async (container: HTMLElement): Promise<MapLibreMap> => {
        const activeLayer = baseLayers.value.find(l => l.visible) ?? baseLayers.value[0]!;
        const response = await fetch(activeLayer.url, { signal: abortController.signal });
        if (!response.ok) throw new Error(`Base map style failed: ${response.status}`);
        const baseStyle = prepareBaseStyle(await response.json() as StyleSpecification);
        abortController.signal.throwIfAborted();
        const center = mapCenter.value; // [lat, lng]

        const map = new maplibregl.Map({
            container,
            style: baseStyle,
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
        let updateTimeout: ReturnType<typeof setTimeout> | undefined;
        map.once('remove', () => {
            resizeObserver.disconnect();
            clearTimeout(updateTimeout);
        });

        // Surface all MapLibre errors (tile failures, source-layer mismatches, etc.)
        map.on('error', (e) => {
            console.error('[MapLibre]', e.error?.message ?? e);
        });

        return new Promise((resolve, reject) => {
            const onRemove = () => reject(new DOMException('Map was removed before loading', 'AbortError'));
            map.once('remove', onRemove);
            map.once('load', () => {
                map.off('remove', onRemove);
                // In dev mode: fetch Martin catalog to verify source-layer names
                if (import.meta.env.DEV) {
                    checkMartinCatalog();
                }

                // URL sync
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
        map.setStyle(layer.url, {
            transformStyle: (previous, next) => {
                const base = prepareBaseStyle(next);
                const overlaySources = Object.fromEntries(
                    Object.entries(previous?.sources ?? {}).filter(([id]) => !id.startsWith('basemap-'))
                );
                const overlayLayers = (previous?.layers ?? []).filter(l => !l.id.startsWith('basemap-'));
                return {
                    ...base,
                    sources: { ...base.sources, ...overlaySources },
                    layers: [...base.layers, ...overlayLayers],
                };
            },
        });
    };

    return {
        mapInstance,
        initMap,
        switchBaseLayer,
    };
}
