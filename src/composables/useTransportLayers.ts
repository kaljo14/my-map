import { ref, computed } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';
import { popupWrap, gradientBar, popupHeader, createLayerToggle } from './mapLayerUtils';
import { CHORO_LAYERS, LINE_LAYERS, type TransportChoroLayerDef, type TransportLineLayerDef } from './transportLayerDefs';

// ── Mode colors (used by custom layers only) ─────────────────────────────────
const COLOR = {
    railway:         '#F57F17',
    metro800:        '#6A1B9A',
    metro1200:       '#1565C0',
    cycling:         '#1B5E20',
    cyclingAlt:      '#66BB6A',
    cyclingPlanned:  '#FF8F00',
};

export function useTransportLayers() {
    let activePopup: maplibregl.Popup | null = null;

    // =========================================================================
    // Generic helpers parameterised by layer definitions
    // =========================================================================

    function addChoroLayer(map: MapLibreMap, def: TransportChoroLayerDef) {
        if (map.getSource(def.sourceId)) return;

        map.addSource(def.sourceId, {
            type: 'vector',
            tiles: [def.tileUrl],
            maxzoom: 14,
        });

        map.addLayer({
            id: def.fillLayerId,
            type: 'fill',
            source: def.sourceId,
            'source-layer': def.sourceLayer,
            layout: { visibility: 'none' },
            paint: {
                'fill-color': [
                    'interpolate', ['linear'], ['to-number', ['get', 'score'], def.colorStops[0]!],
                    def.colorStops[0]!, def.colors[0]!,
                    def.colorStops[1]!, def.colors[1]!,
                    def.colorStops[2]!, def.colors[2]!,
                    def.colorStops[3]!, def.colors[3]!,
                    def.colorStops[4]!, def.colors[4]!,
                ] as maplibregl.ExpressionSpecification,
                'fill-opacity': def.fillOpacity ?? 0.45,
            },
        });

        map.addLayer({
            id: def.outlineLayerId,
            type: 'line',
            source: def.sourceId,
            'source-layer': def.sourceLayer,
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', def.fillLayerId, (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const score = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '260px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader(def.popup.icon, def.popup.title)}
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:24px;font-weight:700;color:#1e293b">${score}
                        <span style="font-size:13px;color:#64748b;font-weight:400">${def.popup.unitLabel}</span>
                    </div>
                    ${gradientBar(def.popup.gradientCss, def.popup.gradientLabels)}
                `))
                .addTo(map);
        });

        map.on('mouseenter', def.fillLayerId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', def.fillLayerId, () => { map.getCanvas().style.cursor = ''; });
    }

    function addLineLayer(map: MapLibreMap, def: TransportLineLayerDef) {
        if (map.getSource(def.sourceId)) return;

        map.addSource(def.sourceId, {
            type: 'vector',
            tiles: [def.tileUrl],
            maxzoom: 16,
        });

        map.addLayer({
            id: def.layerId,
            type: 'line',
            source: def.sourceId,
            'source-layer': def.sourceLayer,
            layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': def.lineColor, 'line-width': def.lineWidth },
        });

        map.on('click', def.layerId, (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const routeLabel = props.label || props.route_id || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '220px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader(def.popup.icon, def.popup.title)}
                    ${routeLabel
                        ? `<div style="display:inline-block;padding:4px 12px;border-radius:16px;background:${def.lineColor}22;border:1px solid ${def.lineColor}88;color:${def.lineColor};font-size:15px;font-weight:700">
                               <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${def.lineColor};margin-right:6px;vertical-align:middle"></span>
                               Route ${routeLabel}
                           </div>`
                        : '<div style="font-size:12px;color:#64748b">No route info</div>'
                    }
                `))
                .addTo(map);
        });

        map.on('mouseenter', def.layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', def.layerId, () => { map.getCanvas().style.cursor = ''; });
    }

    // =========================================================================
    // Factory: generate refs + toggles for data-driven layers
    // =========================================================================

    const choroState = Object.fromEntries(CHORO_LAYERS.map(def => {
        const show = ref(false);
        const toggle = createLayerToggle(show, [def.fillLayerId, def.outlineLayerId],
            (map) => addChoroLayer(map, def));
        return [def.key, { show, toggle }];
    }));

    const lineState = Object.fromEntries(LINE_LAYERS.map(def => {
        const show = ref(false);
        const toggle = createLayerToggle(show, [def.layerId],
            (map) => addLineLayer(map, def));
        return [def.key, { show, toggle }];
    }));

    // =========================================================================
    // Custom layers (unique rendering or popup logic)
    // =========================================================================

    // ── 1. Transit Access by Planning Zone (step expression, access level labels) ──
    const showTransitAccessGe = ref(false);

    function ensureTransitAccessGe(map: MapLibreMap) {
        const sourceId    = 'transport-transit-access-ge';
        const sourceLayer = 'sofiaplan_transit_access_ge_tiles';
        const layerFill   = 'transport-transit-access-ge-fill';
        const layerOutline = 'transport-transit-access-ge-outline';

        if (map.getSource(sourceId)) return;

        map.addSource(sourceId, {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanTransitAccessGeTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: layerFill,
            type: 'fill',
            source: sourceId,
            'source-layer': sourceLayer,
            layout: { visibility: 'none' },
            paint: {
                'fill-color': [
                    'step', ['to-number', ['get', 'score'], 0],
                    '#cbd5e1',
                    0.05, '#bfdbfe',
                    0.35, '#60a5fa',
                    0.65, '#2563eb',
                    0.95, '#1d4ed8',
                ] as maplibregl.ExpressionSpecification,
                'fill-opacity': 0.7,
            },
        });

        map.addLayer({
            id: layerOutline,
            type: 'line',
            source: sourceId,
            'source-layer': sourceLayer,
            layout: { visibility: 'none' },
            paint: { 'line-color': '#475569', 'line-width': 1, 'line-opacity': 0.7 },
        });

        const gradientCss = 'linear-gradient(to right,#e5e7eb,#bfdbfe,#60a5fa,#2563eb,#1d4ed8)';

        map.on('click', layerFill, (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const score = Number(props.score ?? 0);
            const label = props.label || '';
            const [accessLabel, accessColor] =
                score === 0    ? ['No transit access',     '#64748b'] :
                score < 0.35   ? ['Poor transit access',   '#93c5fd'] :
                score < 0.65   ? ['Moderate transit access', '#3b82f6'] :
                score < 0.95   ? ['Good transit access',   '#2563eb'] :
                                 ['Excellent transit access', '#1d4ed8'];
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '260px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader('directions_transit', 'Transit Access — Planning Zone')}
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:18px;font-weight:700;color:${accessColor}">${accessLabel}</div>
                    ${gradientBar(gradientCss, ['None', 'Poor', 'Moderate', 'Good', 'Excellent'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', layerFill, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layerFill, () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleTransitAccessGe = createLayerToggle(
        showTransitAccessGe,
        ['transport-transit-access-ge-fill', 'transport-transit-access-ge-outline'],
        ensureTransitAccessGe,
    );

    // ── 2. Metro Access 800 m (solid fill, no score interpolation) ──────────
    const showMetroAccess800m = ref(false);

    function ensureMetroAccess800m(map: MapLibreMap) {
        if (map.getSource('transport-metro-access-800m')) return;

        map.addSource('transport-metro-access-800m', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanMetroAccess800mTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'transport-metro-access-800m-fill',
            type: 'fill',
            source: 'transport-metro-access-800m',
            'source-layer': 'sofiaplan_metro_access_800m_tiles',
            layout: { visibility: 'none' },
            paint: { 'fill-color': COLOR.metro800, 'fill-opacity': 0.35 },
        });

        map.addLayer({
            id: 'transport-metro-access-800m-outline',
            type: 'line',
            source: 'transport-metro-access-800m',
            'source-layer': 'sofiaplan_metro_access_800m_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': COLOR.metro800, 'line-width': 1.5, 'line-opacity': 0.7 },
        });

        map.on('click', 'transport-metro-access-800m-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const station = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '220px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader('train', 'Metro Access — 800 m')}
                    ${station ? `<div style="font-size:13px;color:#475569;margin-bottom:4px">${station}</div>` : ''}
                    <div style="font-size:13px;font-weight:600;color:${COLOR.metro800}">Within 800 m of metro</div>
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'transport-metro-access-800m-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'transport-metro-access-800m-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleMetroAccess800m = createLayerToggle(
        showMetroAccess800m,
        ['transport-metro-access-800m-fill', 'transport-metro-access-800m-outline'],
        ensureMetroAccess800m,
    );

    // ── 3. Metro Access 1200 m+ (solid fill, no score interpolation) ────────
    const showMetroAccess1200m = ref(false);

    function ensureMetroAccess1200m(map: MapLibreMap) {
        if (map.getSource('transport-metro-access-1200m')) return;

        map.addSource('transport-metro-access-1200m', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanMetroAccess1200mTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'transport-metro-access-1200m-fill',
            type: 'fill',
            source: 'transport-metro-access-1200m',
            'source-layer': 'sofiaplan_metro_access_1200m_tiles',
            layout: { visibility: 'none' },
            paint: { 'fill-color': COLOR.metro1200, 'fill-opacity': 0.25 },
        });

        map.addLayer({
            id: 'transport-metro-access-1200m-outline',
            type: 'line',
            source: 'transport-metro-access-1200m',
            'source-layer': 'sofiaplan_metro_access_1200m_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': COLOR.metro1200, 'line-width': 1.5, 'line-opacity': 0.6 },
        });

        map.on('click', 'transport-metro-access-1200m-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const station = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '220px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader('train', 'Metro Access — 1200 m+')}
                    ${station ? `<div style="font-size:13px;color:#475569;margin-bottom:4px">${station}</div>` : ''}
                    <div style="font-size:13px;font-weight:600;color:${COLOR.metro1200}">Within 1200 m+ of metro</div>
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'transport-metro-access-1200m-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'transport-metro-access-1200m-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleMetroAccess1200m = createLayerToggle(
        showMetroAccess1200m,
        ['transport-metro-access-1200m-fill', 'transport-metro-access-1200m-outline'],
        ensureMetroAccess1200m,
    );

    // ── 4. Railway Stations (circle layer, custom popup with annual passengers) ──
    const showRailwayStations = ref(false);

    function ensureRailwayStations(map: MapLibreMap) {
        if (map.getSource('transport-railway-stations')) return;

        map.addSource('transport-railway-stations', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanRailwayStationsTileUrlTemplate()],
            maxzoom: 16,
        });

        map.addLayer({
            id: 'transport-railway-stations-circle',
            type: 'circle',
            source: 'transport-railway-stations',
            'source-layer': 'sofiaplan_railway_stations_tiles',
            layout: { visibility: 'none' },
            paint: {
                'circle-radius': [
                    'interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
                    0,       6,
                    500000,  10,
                    2000000, 16,
                    4500000, 24,
                ] as maplibregl.ExpressionSpecification,
                'circle-color': COLOR.railway,
                'circle-stroke-color': '#ffffff',
                'circle-stroke-width': 2,
                'circle-opacity': 0.85,
            },
        });

        map.on('click', 'transport-railway-stations-circle', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const name = props.label || '';
            const load = Number(props.score ?? 0).toLocaleString();
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader('train', 'Railway Station')}
                    ${name ? `<div style="font-size:14px;font-weight:600;color:#1e293b;margin-bottom:8px">${name}</div>` : ''}
                    <div style="font-size:13px;color:#64748b">Annual passengers</div>
                    <div style="font-size:24px;font-weight:700;color:${COLOR.railway}">${load}</div>
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'transport-railway-stations-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'transport-railway-stations-circle', () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleRailwayStations = createLayerToggle(
        showRailwayStations,
        ['transport-railway-stations-circle'],
        ensureRailwayStations,
    );

    // ── 5. Built Cycling Network (custom popup with label, direction, length) ──
    const showCyclingNetwork = ref(false);

    function ensureCyclingNetwork(map: MapLibreMap) {
        if (map.getSource('transport-cycling-network')) return;

        map.addSource('transport-cycling-network', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanCyclingNetworkTileUrlTemplate()],
            maxzoom: 16,
        });

        map.addLayer({
            id: 'transport-cycling-network-line',
            type: 'line',
            source: 'transport-cycling-network',
            'source-layer': 'sofiaplan_cycling_network_tiles',
            layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': COLOR.cycling, 'line-width': 2.5 },
        });

        map.on('click', 'transport-cycling-network-line', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader('pedal_bike', 'Built Cycling Network')}
                    ${props.label ? `<div style="font-size:13px;color:#475569;margin-bottom:4px">${props.label}</div>` : ''}
                    ${props.direction ? `<div style="font-size:12px;color:#64748b">Direction: ${props.direction}</div>` : ''}
                    ${props.length_m ? `<div style="font-size:12px;color:#64748b">Length: ${Number(props.length_m).toFixed(0)} m</div>` : ''}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'transport-cycling-network-line', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'transport-cycling-network-line', () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleCyclingNetwork = createLayerToggle(
        showCyclingNetwork,
        ['transport-cycling-network-line'],
        ensureCyclingNetwork,
    );

    // ── 6. Built Cycling Network Alt (custom popup with label, direction) ────
    const showCyclingNetworkAlt = ref(false);

    function ensureCyclingNetworkAlt(map: MapLibreMap) {
        if (map.getSource('transport-cycling-network-alt')) return;

        map.addSource('transport-cycling-network-alt', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanCyclingNetworkAltTileUrlTemplate()],
            maxzoom: 16,
        });

        map.addLayer({
            id: 'transport-cycling-network-alt-line',
            type: 'line',
            source: 'transport-cycling-network-alt',
            'source-layer': 'sofiaplan_cycling_network_alt_tiles',
            layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': COLOR.cyclingAlt, 'line-width': 2 },
        });

        map.on('click', 'transport-cycling-network-alt-line', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader('pedal_bike', 'Built Cycling Network (alt)')}
                    ${props.label ? `<div style="font-size:13px;color:#475569;margin-bottom:4px">${props.label}</div>` : ''}
                    ${props.direction ? `<div style="font-size:12px;color:#64748b">Direction: ${props.direction}</div>` : ''}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'transport-cycling-network-alt-line', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'transport-cycling-network-alt-line', () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleCyclingNetworkAlt = createLayerToggle(
        showCyclingNetworkAlt,
        ['transport-cycling-network-alt-line'],
        ensureCyclingNetworkAlt,
    );

    // ── 7. Planned Cycling Extensions (dashed line, custom popup) ────────────
    const showCyclingPlanned = ref(false);

    function ensureCyclingPlanned(map: MapLibreMap) {
        if (map.getSource('transport-cycling-planned')) return;

        map.addSource('transport-cycling-planned', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanCyclingPlannedTileUrlTemplate()],
            maxzoom: 16,
        });

        map.addLayer({
            id: 'transport-cycling-planned-line',
            type: 'line',
            source: 'transport-cycling-planned',
            'source-layer': 'sofiaplan_cycling_planned_tiles',
            layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': COLOR.cyclingPlanned,
                'line-width': 2,
                'line-dasharray': [4, 3],
            },
        });

        map.on('click', 'transport-cycling-planned-line', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '260px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader('route', 'Planned Cycling Extension')}
                    ${props.label ? `<div style="font-size:14px;font-weight:600;color:#1e293b;margin-bottom:6px">${props.label}</div>` : ''}
                    ${props.priority != null ? `<div style="font-size:12px;color:#64748b">Priority: ${props.priority}</div>` : ''}
                    ${props.project != null ? `<div style="font-size:12px;color:#64748b">Project: ${props.project}</div>` : ''}
                    ${props.note ? `<div style="font-size:12px;color:#64748b;margin-top:4px;font-style:italic">${props.note}</div>` : ''}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'transport-cycling-planned-line', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'transport-cycling-planned-line', () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleCyclingPlanned = createLayerToggle(
        showCyclingPlanned,
        ['transport-cycling-planned-line'],
        ensureCyclingPlanned,
    );

    // =========================================================================
    // Computed + toggle-all
    // =========================================================================

    const showAnyTransport = computed(() =>
        showTransitAccessGe.value || choroState.transitAccessDistrict!.show.value ||
        showMetroAccess800m.value  || showMetroAccess1200m.value      ||
        lineState.busLines!.show.value         || lineState.busLinesAlt!.show.value           ||
        lineState.trolleybusLines!.show.value  || lineState.tramLines!.show.value             ||
        lineState.tramLinesAlt!.show.value     || showRailwayStations.value       ||
        showCyclingNetwork.value   || showCyclingNetworkAlt.value     ||
        showCyclingPlanned.value
    );

    const toggleAllTransport = (map: MapLibreMap | null) => {
        if (!map) return;
        const next = !showAnyTransport.value;
        toggleTransitAccessGe(map, next);
        choroState.transitAccessDistrict!.toggle(map, next);
        toggleMetroAccess800m(map, next);
        toggleMetroAccess1200m(map, next);
        lineState.busLines!.toggle(map, next);
        lineState.busLinesAlt!.toggle(map, next);
        lineState.trolleybusLines!.toggle(map, next);
        lineState.tramLines!.toggle(map, next);
        lineState.tramLinesAlt!.toggle(map, next);
        toggleRailwayStations(map, next);
        toggleCyclingNetwork(map, next);
        toggleCyclingNetworkAlt(map, next);
        toggleCyclingPlanned(map, next);
    };

    // =========================================================================
    // Return (backwards-compatible property names)
    // =========================================================================

    return {
        // Visibility state
        showTransitAccessGe,
        showTransitAccessDistrict: choroState.transitAccessDistrict!.show,
        showMetroAccess800m,
        showMetroAccess1200m,
        showBusLines: lineState.busLines!.show,
        showBusLinesAlt: lineState.busLinesAlt!.show,
        showTrolleybusLines: lineState.trolleybusLines!.show,
        showTramLines: lineState.tramLines!.show,
        showTramLinesAlt: lineState.tramLinesAlt!.show,
        showRailwayStations,
        showCyclingNetwork,
        showCyclingNetworkAlt,
        showCyclingPlanned,
        showAnyTransport,
        // Toggle functions
        toggleTransitAccessGe,
        toggleTransitAccessDistrict: choroState.transitAccessDistrict!.toggle,
        toggleMetroAccess800m,
        toggleMetroAccess1200m,
        toggleBusLines: lineState.busLines!.toggle,
        toggleBusLinesAlt: lineState.busLinesAlt!.toggle,
        toggleTrolleybusLines: lineState.trolleybusLines!.toggle,
        toggleTramLines: lineState.tramLines!.toggle,
        toggleTramLinesAlt: lineState.tramLinesAlt!.toggle,
        toggleRailwayStations,
        toggleCyclingNetwork,
        toggleCyclingNetworkAlt,
        toggleCyclingPlanned,
        toggleAllTransport,
    };
}
