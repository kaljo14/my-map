import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';
import { popupWrap, popupHeader, gradientBar, setLayerVisibility } from './mapLayerUtils';

const SOURCE_ID = 'ultimate-foot-traffic';
const LINE_LAYER = 'ultimate-foot-traffic-line';
const SOURCE_LAYER = 'ultimate_foot_traffic_tiles';

const TRAFFIC_STOPS: [number, string][] = [
    [0,   '#440154'],
    [15,  '#3b528b'],
    [40,  '#21918c'],
    [80,  '#5ec962'],
    [130, '#fde725'],
    [200, '#d62728'],
];

function trafficColorExpr(): maplibregl.ExpressionSpecification {
    const stops: (number | string)[] = [];
    TRAFFIC_STOPS.forEach(([v, c]) => stops.push(v, c));
    return ['interpolate', ['linear'], ['to-number', ['get', 'predicted_hourly'], 0], ...stops] as maplibregl.ExpressionSpecification;
}

const LEGEND_CSS = 'linear-gradient(to right, #440154, #3b528b, #21918c, #5ec962, #fde725, #d62728)';

function pctBar(label: string, pct: number): string {
    const w = Math.round(pct * 100);
    return `<div style="display:flex;align-items:center;gap:6px;font-size:12px">
        <span style="width:90px;flex-shrink:0">${label}</span>
        <div style="flex:1;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">
            <div style="width:${w}%;height:100%;background:#d97757;border-radius:3px"></div>
        </div>
        <span style="width:32px;text-align:right;color:#8a7e72">${w}%</span>
    </div>`;
}

export function useUltimateFootTrafficLayer() {
    const showUltimateFootTraffic = ref(false);
    let activePopup: maplibregl.Popup | null = null;

    function ensureLayers(map: MapLibreMap) {
        if (map.getSource(SOURCE_ID)) return;

        map.addSource(SOURCE_ID, {
            type: 'vector',
            tiles: [TilesAPI.getUltimateFootTrafficTileUrlTemplate()],
            maxzoom: 22,
        });

        map.addLayer({
            id: LINE_LAYER,
            type: 'line',
            source: SOURCE_ID,
            'source-layer': SOURCE_LAYER,
            layout: { visibility: 'none' },
            minzoom: 10,
            maxzoom: 20,
            paint: {
                'line-color': trafficColorExpr(),
                'line-width': [
                    'interpolate', ['linear'], ['zoom'],
                    10, 1,
                    14, 2.5,
                    18, 4,
                ] as maplibregl.ExpressionSpecification,
                'line-opacity': 0.8,
            },
        });

        map.on('click', LINE_LAYER, (e) => {
            const feat = e.features?.[0];
            if (!feat) return;
            const p = feat.properties;
            const hourly = Number(p.predicted_hourly ?? 0);
            const syntaxPct = Number(p.syntax_pctl ?? 0);
            const popPct = Number(p.pop_pctl ?? 0);
            const poiPct = Number(p.poi_pctl ?? 0);
            const transitPct = Number(p.transit_pctl ?? 0);
            const neighborhood = p.neighborhood ?? 'N/A';

            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '300px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader('footprint', 'Ultimate Foot Traffic')}
                    <div style="display:flex;flex-direction:column;gap:6px;font-size:13px">
                        <div><strong>Est. pedestrians/hr:</strong> ${hourly.toLocaleString()}</div>
                        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:2px 0">
                        ${pctBar('Street Network', syntaxPct)}
                        ${pctBar('Population', popPct)}
                        ${pctBar('POI Attraction', poiPct)}
                        ${pctBar('Transit Access', transitPct)}
                        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:2px 0">
                        <div><strong>Neighborhood:</strong> ${neighborhood}</div>
                    </div>
                    ${gradientBar(LEGEND_CSS, ['0', '15', '40', '80', '130', '200'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', LINE_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', LINE_LAYER, () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleUltimateFootTraffic = (map: MapLibreMap | null) => {
        if (!map) return;
        showUltimateFootTraffic.value = !showUltimateFootTraffic.value;
        ensureLayers(map);
        setLayerVisibility(map, [LINE_LAYER], showUltimateFootTraffic.value);
    };

    const initUltimateFootTraffic = (map: MapLibreMap) => {
        ensureLayers(map);
    };

    return {
        showUltimateFootTraffic,
        toggleUltimateFootTraffic,
        initUltimateFootTraffic,
    };
}
