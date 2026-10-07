import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';
import { popupWrap, popupHeader, gradientBar, setLayerVisibility } from './mapLayerUtils';

const SOURCE_ID = 'calibrated-foot-traffic';
const LINE_LAYER = 'calibrated-foot-traffic-line';
const SOURCE_LAYER = 'calibrated_foot_traffic_tiles';

const TRAFFIC_STOPS: [number, string][] = [
    [0,   '#313695'],
    [10,  '#74add1'],
    [30,  '#ffffbf'],
    [60,  '#f46d43'],
    [100, '#a50026'],
];

function trafficColorExpr(): maplibregl.ExpressionSpecification {
    const stops: (number | string)[] = [];
    TRAFFIC_STOPS.forEach(([v, c]) => stops.push(v, c));
    return ['interpolate', ['linear'], ['to-number', ['get', 'predicted_hourly'], 0], ...stops] as maplibregl.ExpressionSpecification;
}

const LEGEND_CSS = 'linear-gradient(to right, #313695, #74add1, #ffffbf, #f46d43, #a50026)';

export function useFootTrafficLayer() {
    const showFootTraffic = ref(false);
    let activePopup: maplibregl.Popup | null = null;

    function ensureLayers(map: MapLibreMap) {
        if (map.getSource(SOURCE_ID)) return;

        map.addSource(SOURCE_ID, {
            type: 'vector',
            tiles: [TilesAPI.getCalibratedFootTrafficTileUrlTemplate()],
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
            const integration = Number(p.integration ?? 0);
            const neighborhood = p.neighborhood ?? 'N/A';

            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader('directions_walk', 'Predicted Foot Traffic')}
                    <div style="display:flex;flex-direction:column;gap:6px;font-size:13px">
                        <div><strong>Est. pedestrians/hr:</strong> ${hourly.toLocaleString()}</div>
                        <div><strong>Integration:</strong> ${integration.toFixed(2)}</div>
                        <div><strong>Neighborhood:</strong> ${neighborhood}</div>
                    </div>
                    ${gradientBar(LEGEND_CSS, ['0', '10', '30', '60', '100'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', LINE_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', LINE_LAYER, () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleFootTraffic = (map: MapLibreMap | null) => {
        if (!map) return;
        showFootTraffic.value = !showFootTraffic.value;
        ensureLayers(map);
        setLayerVisibility(map, [LINE_LAYER], showFootTraffic.value);
    };

    const initFootTraffic = (map: MapLibreMap) => {
        ensureLayers(map);
    };

    return {
        showFootTraffic,
        toggleFootTraffic,
        initFootTraffic,
    };
}
