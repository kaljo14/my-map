import { ref, computed } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';
import { popupWrap, gradientBar, setLayerVisibility } from './mapLayerUtils';

// ── Line color ramp by space-syntax integration score ──────────────────────
// Low integration = cool blue → high integration = hot red
const LINE_COLOR_EXPR: maplibregl.ExpressionSpecification = [
    'interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
    0,    '#313695',
    500,  '#74add1',
    2000, '#ffffbf',
    6000, '#f46d43',
    12000,'#a50026',
];

const LINE_WIDTH_EXPR: maplibregl.ExpressionSpecification = [
    'interpolate', ['linear'], ['zoom'], 10, 0.8, 14, 2.5,
];

// ── Polygon fill color for integration zones (layer 603) ───────────────────
const FILL_COLOR_EXPR: maplibregl.ExpressionSpecification = [
    'interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
    0,    '#313695',
    500,  '#74add1',
    2000, '#ffffbf',
    6000, '#f46d43',
    12000,'#a50026',
];

// ── Layer definition registry ──────────────────────────────────────────────
interface LineLayerDef {
    key: string;
    sourceId: string;
    sourceLayer: string;
    tileUrl: string;
    layerIds: { line: string };
    label: string;
}

interface FillLayerDef {
    key: string;
    sourceId: string;
    sourceLayer: string;
    tileUrl: string;
    layerIds: { fill: string; outline: string };
    label: string;
}

const LINE_LAYERS: LineLayerDef[] = [
    {
        key: 'pedestrianCity',
        sourceId: 'ped-net-city',
        sourceLayer: 'sofiaplan_pedestrian_city_tiles',
        tileUrl: TilesAPI.getPedestrianCityTileUrl(),
        layerIds: { line: 'ped-net-city-line' },
        label: 'Pedestrian Network — City',
    },
    {
        key: 'pedestrianCityAlt',
        sourceId: 'ped-net-city-alt',
        sourceLayer: 'sofiaplan_pedestrian_city_alt_tiles',
        tileUrl: TilesAPI.getPedestrianCityAltTileUrl(),
        layerIds: { line: 'ped-net-city-alt-line' },
        label: 'Pedestrian Network — City (alt)',
    },
    {
        key: 'pedestrianMunicipality',
        sourceId: 'ped-net-municipality',
        sourceLayer: 'sofiaplan_pedestrian_municipality_tiles',
        tileUrl: TilesAPI.getPedestrianMunicipalityTileUrl(),
        layerIds: { line: 'ped-net-municipality-line' },
        label: 'Pedestrian Network — Municipality',
    },
    {
        key: 'pedestrianMunicipalityAlt',
        sourceId: 'ped-net-municipality-alt',
        sourceLayer: 'sofiaplan_pedestrian_municipality_alt_tiles',
        tileUrl: TilesAPI.getPedestrianMunicipalityAltTileUrl(),
        layerIds: { line: 'ped-net-municipality-alt-line' },
        label: 'Pedestrian Network — Municipality (alt)',
    },
    {
        key: 'pedestrianSegmented',
        sourceId: 'ped-net-segmented',
        sourceLayer: 'sofiaplan_pedestrian_segmented_tiles',
        tileUrl: TilesAPI.getPedestrianSegmentedTileUrl(),
        layerIds: { line: 'ped-net-segmented-line' },
        label: 'Pedestrian Network — Segmented',
    },
];

const INTEGRATION_LAYER: FillLayerDef = {
    key: 'pedestrianIntegration',
    sourceId: 'ped-net-integration',
    sourceLayer: 'sofiaplan_pedestrian_integration_tiles',
    tileUrl: TilesAPI.getPedestrianIntegrationTileUrl(),
    layerIds: { fill: 'ped-net-integration-fill', outline: 'ped-net-integration-outline' },
    label: 'Pedestrian Integration Zones',
};

export function usePedestrianNetworkLayers() {
    // ── Visibility refs ────────────────────────────────────────────────────
    const showPedestrianCity = ref(false);
    const showPedestrianCityAlt = ref(false);
    const showPedestrianMunicipality = ref(false);
    const showPedestrianMunicipalityAlt = ref(false);
    const showPedestrianSegmented = ref(false);
    const showPedestrianIntegration = ref(false);

    const showAnyPedestrianNetwork = computed(() =>
        showPedestrianCity.value || showPedestrianCityAlt.value ||
        showPedestrianMunicipality.value || showPedestrianMunicipalityAlt.value ||
        showPedestrianSegmented.value || showPedestrianIntegration.value
    );

    let activePopup: maplibregl.Popup | null = null;

    // ── Line-layer popup HTML ──────────────────────────────────────────────
    function linePopupHtml(props: Record<string, unknown>, label: string): string {
        const score = Number(props.score ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
        const choice = Number(props.choice ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
        const connectivity = Number(props.connectivity ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
        const segLen = Number(props.segment_length ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
        return popupWrap(`
            <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">directions_walk</span>${label}
            </h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;font-size:13px">
                <div><span style="color:#64748b">Integration</span><br><strong>${score}</strong></div>
                <div><span style="color:#64748b">Choice</span><br><strong>${choice}</strong></div>
                <div><span style="color:#64748b">Connectivity</span><br><strong>${connectivity}</strong></div>
                <div><span style="color:#64748b">Segment</span><br><strong>${segLen} m</strong></div>
            </div>
            ${gradientBar('linear-gradient(to right,#313695,#74add1,#ffffbf,#f46d43,#a50026)', ['Low', 'Mid', 'High'])}
        `);
    }

    // ── Ensure + toggle for LINE layers ────────────────────────────────────
    function ensureLineLayer(map: MapLibreMap, def: LineLayerDef) {
        if (map.getSource(def.sourceId)) return;

        map.addSource(def.sourceId, {
            type: 'vector',
            tiles: [def.tileUrl],
            maxzoom: 14,
        });

        map.addLayer({
            id: def.layerIds.line,
            type: 'line',
            source: def.sourceId,
            'source-layer': def.sourceLayer,
            layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
            paint: {
                'line-color': LINE_COLOR_EXPR,
                'line-width': LINE_WIDTH_EXPR,
                'line-opacity': 0.85,
            },
        });

        map.on('click', def.layerIds.line, (e) => {
            const props = e.features?.[0]?.properties ?? {};
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(linePopupHtml(props, def.label))
                .addTo(map);
        });
        map.on('mouseenter', def.layerIds.line, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', def.layerIds.line, () => { map.getCanvas().style.cursor = ''; });
    }

    function setLineVisibility(map: MapLibreMap, def: LineLayerDef, visible: boolean) {
        setLayerVisibility(map, [def.layerIds.line], visible);
    }

    // ── Ensure + toggle for INTEGRATION polygon layer ──────────────────────
    function ensureIntegrationLayer(map: MapLibreMap) {
        const def = INTEGRATION_LAYER;
        if (map.getSource(def.sourceId)) return;

        map.addSource(def.sourceId, {
            type: 'vector',
            tiles: [def.tileUrl],
            maxzoom: 14,
        });

        map.addLayer({
            id: def.layerIds.fill,
            type: 'fill',
            source: def.sourceId,
            'source-layer': def.sourceLayer,
            layout: { visibility: 'none' },
            paint: {
                'fill-color': FILL_COLOR_EXPR,
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: def.layerIds.outline,
            type: 'line',
            source: def.sourceId,
            'source-layer': def.sourceLayer,
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', def.layerIds.fill, (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const score = Number(props.score ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
            const choice = Number(props.choice ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
            const label = props.label || '';
            const district = props.district || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '260px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">blur_on</span>Integration Zone
                    </h3>
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:2px">${label}</div>` : ''}
                    ${district ? `<div style="font-size:11px;color:#94a3b8;margin-bottom:8px">${district}</div>` : ''}
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;font-size:13px">
                        <div><span style="color:#64748b">Integration</span><br><strong>${score}</strong></div>
                        <div><span style="color:#64748b">Choice</span><br><strong>${choice}</strong></div>
                    </div>
                    ${gradientBar('linear-gradient(to right,#313695,#74add1,#ffffbf,#f46d43,#a50026)', ['Low', 'Mid', 'High'])}
                `))
                .addTo(map);
        });
        map.on('mouseenter', def.layerIds.fill, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', def.layerIds.fill, () => { map.getCanvas().style.cursor = ''; });
    }

    function setIntegrationVisibility(map: MapLibreMap, visible: boolean) {
        const def = INTEGRATION_LAYER;
        setLayerVisibility(map, [def.layerIds.fill, def.layerIds.outline], visible);
    }

    // ── Generic toggle factory ─────────────────────────────────────────────
    function makeLineToggle(def: LineLayerDef, visRef: ReturnType<typeof ref<boolean>>) {
        return (map: MapLibreMap | null, forceState?: boolean) => {
            if (!map) return;
            visRef.value = forceState ?? !visRef.value;
            ensureLineLayer(map, def);
            setLineVisibility(map, def, visRef.value);
        };
    }

    const togglePedestrianCity            = makeLineToggle(LINE_LAYERS[0]!, showPedestrianCity);
    const togglePedestrianCityAlt         = makeLineToggle(LINE_LAYERS[1]!, showPedestrianCityAlt);
    const togglePedestrianMunicipality    = makeLineToggle(LINE_LAYERS[2]!, showPedestrianMunicipality);
    const togglePedestrianMunicipalityAlt = makeLineToggle(LINE_LAYERS[3]!, showPedestrianMunicipalityAlt);
    const togglePedestrianSegmented       = makeLineToggle(LINE_LAYERS[4]!, showPedestrianSegmented);

    const togglePedestrianIntegration = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showPedestrianIntegration.value = forceState ?? !showPedestrianIntegration.value;
        ensureIntegrationLayer(map);
        setIntegrationVisibility(map, showPedestrianIntegration.value);
    };

    const toggleAllPedestrianNetwork = (map: MapLibreMap | null) => {
        if (!map) return;
        const next = !showAnyPedestrianNetwork.value;
        togglePedestrianCity(map, next);
        togglePedestrianCityAlt(map, next);
        togglePedestrianMunicipality(map, next);
        togglePedestrianMunicipalityAlt(map, next);
        togglePedestrianSegmented(map, next);
        togglePedestrianIntegration(map, next);
    };

    return {
        showPedestrianCity, togglePedestrianCity,
        showPedestrianCityAlt, togglePedestrianCityAlt,
        showPedestrianMunicipality, togglePedestrianMunicipality,
        showPedestrianMunicipalityAlt, togglePedestrianMunicipalityAlt,
        showPedestrianSegmented, togglePedestrianSegmented,
        showPedestrianIntegration, togglePedestrianIntegration,
        showAnyPedestrianNetwork, toggleAllPedestrianNetwork,
    };
}
