import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';
import { setLayerVisibility, popupWrap, popupHeader, gradientBar } from './mapLayerUtils';

// ── Color ramp: red (low score = few shops) → yellow → green (high score = many shops) ──
const DENSITY_STOPS: [number, string][] = [
    [0,   '#d00000'],
    [20,  '#ff6d00'],
    [40,  '#ffc300'],
    [60,  '#aacc00'],
    [80,  '#55a630'],
    [100, '#2b9348'],
];

function densityColorExpr(): maplibregl.ExpressionSpecification {
    const stops: (number | string)[] = [];
    DENSITY_STOPS.forEach(([v, c]) => stops.push(v, c));
    return ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0], ...stops] as maplibregl.ExpressionSpecification;
}

function scoreColor(score: number): string {
    for (let i = DENSITY_STOPS.length - 1; i >= 0; i--) {
        const stop = DENSITY_STOPS[i];
        if (stop && score >= stop[0]) return stop[1];
    }
    return DENSITY_STOPS[0]![1];
}

const LEGEND_CSS = 'linear-gradient(to right, #d00000, #ff6d00, #ffc300, #aacc00, #55a630, #2b9348)';

// ── Shared map layer setup ──────────────────────────────────────────────────

interface LayerConfig {
    sourceId: string;
    tileUrl: string;
    sourceLayer: string;
    fillId: string;
    outlineId: string;
    popupBuilder: (props: Record<string, unknown>, lngLat: maplibregl.LngLat) => string;
}

function createLayer(cfg: LayerConfig) {
    const show = ref(false);
    let popup: maplibregl.Popup | null = null;

    function ensureLayers(map: MapLibreMap) {
        if (map.getSource(cfg.sourceId)) return;

        map.addSource(cfg.sourceId, {
            type: 'vector',
            tiles: [cfg.tileUrl],
            maxzoom: 14,
        });

        map.addLayer({
            id: cfg.fillId,
            type: 'fill',
            source: cfg.sourceId,
            'source-layer': cfg.sourceLayer,
            layout: { visibility: 'none' },
            paint: {
                'fill-color': densityColorExpr(),
                'fill-opacity': 0.55,
            },
        });

        map.addLayer({
            id: cfg.outlineId,
            type: 'line',
            source: cfg.sourceId,
            'source-layer': cfg.sourceLayer,
            layout: { visibility: 'none' },
            paint: {
                'line-color': 'rgba(255, 255, 255, 0.7)',
                'line-width': [
                    'interpolate', ['linear'], ['zoom'],
                    8, 0.8,
                    10, 1.2,
                    12, 1.8,
                    14, 2.5,
                ] as maplibregl.ExpressionSpecification,
            },
        });

        map.on('click', cfg.fillId, (e) => {
            const props = e.features?.[0]?.properties ?? {};
            popup?.remove();
            popup = new maplibregl.Popup({ maxWidth: '300px' })
                .setLngLat(e.lngLat)
                .setHTML(cfg.popupBuilder(props, e.lngLat))
                .addTo(map);
        });

        map.on('mouseenter', cfg.fillId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', cfg.fillId, () => { map.getCanvas().style.cursor = ''; });
    }

    function toggle(map: MapLibreMap | null, forceState?: boolean) {
        if (!map) return;
        show.value = forceState ?? !show.value;
        ensureLayers(map);
        setLayerVisibility(map, [cfg.fillId, cfg.outlineId], show.value);
    }

    return { show, toggle };
}

// ── Popup builders ──────────────────────────────────────────────────────────

function statBox(label: string, value: string): string {
    return `<div style="padding:8px 10px;border-radius:6px;background:rgba(100,116,139,0.08)">
        <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">${label}</div>
        <div style="font-size:16px;font-weight:600;color:#e2e8f0;margin-top:2px">${value}</div>
    </div>`;
}

function groceryPopup(props: Record<string, unknown>): string {
    const score = Number(props.score ?? 0);
    const stores = Number(props.poi_count ?? 0);
    const pop = Number(props.population ?? 0);
    const nearest = Number(props.nearest_m ?? 0);
    const peoplePerStore = stores > 0 ? Math.round(pop / stores) : 0;

    return popupWrap(`
        ${popupHeader('shopping_cart', 'Grocery Chain Density')}
        <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:14px">
            <div style="font-size:40px;font-weight:800;color:${scoreColor(score)};line-height:1">${score.toFixed(0)}</div>
            <div>
                <div style="font-size:12px;font-weight:600;color:#e2e8f0">/ 100</div>
                <div style="font-size:10px;color:#94a3b8;margin-top:1px">${score < 40 ? 'Underserved' : score < 70 ? 'Moderate' : 'Well served'}</div>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
            ${statBox('Chain Stores in Hex', String(stores))}
            ${statBox('Population', Math.round(pop).toLocaleString())}
        </div>
        ${stores > 0 ? `<div style="padding:10px 12px;border-radius:8px;background:rgba(100,116,139,0.10);margin-bottom:10px;text-align:center">
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">People per Store</div>
            <div style="font-size:28px;font-weight:800;color:${scoreColor(score)};margin-top:4px">${peoplePerStore.toLocaleString()}</div>
        </div>` : `<div style="padding:10px 12px;border-radius:8px;background:rgba(100,116,139,0.10);margin-bottom:10px;text-align:center">
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">No chain stores in this area</div>
            <div style="font-size:14px;color:#94a3b8;margin-top:4px">Nearest: ${nearest < 1000 ? nearest.toFixed(0) + ' m' : (nearest / 1000).toFixed(1) + ' km'}</div>
        </div>`}
        ${gradientBar(LEGEND_CSS, ['Underserved', '', 'Well served'])}
    `);
}

// ── Composable ───────────────────────────────────────────────────────────────

export function useFoodDesertLayers() {
    const groceryDesert = createLayer({
        sourceId: 'grocery-desert',
        tileUrl: TilesAPI.getGroceryDesertTileUrlTemplate(),
        sourceLayer: 'grocery_desert_tiles',
        fillId: 'grocery-desert-fill',
        outlineId: 'grocery-desert-outline',
        popupBuilder: (props) => groceryPopup(props),
    });

    return {
        showGroceryDesert: groceryDesert.show,
        toggleGroceryDesert: groceryDesert.toggle,
    };
}
