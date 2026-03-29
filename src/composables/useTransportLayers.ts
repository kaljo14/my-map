import { ref, computed } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';

// ── Mode colors ───────────────────────────────────────────────────────────────
const COLOR = {
    bus:          '#1565C0',  // dark blue
    busAlt:       '#42A5F5',  // mid blue
    trolleybus:   '#00695C',  // dark teal
    tram:         '#C62828',  // dark red
    tramAlt:      '#EF5350',  // mid red
    railway:      '#F57F17',  // amber
    transit:      '#2E7D32',  // dark green (transit accessibility)
    metro800:     '#6A1B9A',  // deep purple (800 m catchment)
    metro1200:    '#1565C0',  // dark blue  (1200 m+ catchment)
};

// ── Shared helpers ────────────────────────────────────────────────────────────
function gradientBar(css: string, labels: [string, string, string]): string {
    return `
        <div style="margin-top:10px;height:7px;border-radius:4px;background:${css}"></div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-top:3px">
            <span>${labels[0]}</span><span>${labels[1]}</span><span>${labels[2]}</span>
        </div>`;
}

function popupWrap(content: string): string {
    return `<div style="font-family:system-ui,sans-serif;min-width:200px;color:#0f172a">${content}</div>`;
}

function popupHeader(icon: string, title: string): string {
    return `<h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">${icon}</span>${title}
    </h3>`;
}

export function useTransportLayers() {
    // ── Visibility refs ───────────────────────────────────────────────────────
    const showTransitAccessGe       = ref(false);
    const showTransitAccessDistrict = ref(false);
    const showMetroAccess800m       = ref(false);
    const showMetroAccess1200m      = ref(false);
    const showBusLines              = ref(false);
    const showBusLinesAlt           = ref(false);
    const showTrolleybusLines       = ref(false);
    const showTramLines             = ref(false);
    const showTramLinesAlt          = ref(false);
    const showRailwayStations       = ref(false);

    const showAnyTransport = computed(() =>
        showTransitAccessGe.value || showTransitAccessDistrict.value ||
        showMetroAccess800m.value  || showMetroAccess1200m.value      ||
        showBusLines.value         || showBusLinesAlt.value           ||
        showTrolleybusLines.value  || showTramLines.value             ||
        showTramLinesAlt.value     || showRailwayStations.value
    );

    let activePopup: maplibregl.Popup | null = null;

    // =========================================================================
    // HELPERS: generic polygon (choropleth) layer builder
    // =========================================================================
    function addChoroLayer(
        map: MapLibreMap,
        sourceId: string,
        tileUrl: string,
        sourceLayer: string,
        layerFill: string,
        layerOutline: string,
        colorStops: number[],     // [val0, val1, val2, val3, val4] — 5 stops
        colors: string[],         // [col0, col1, col2, col3, col4] — 5 colors
        popupTitle: string,
        popupIcon: string,
        unitLabel: string,
        gradientCss: string,
        gradientLabels: [string, string, string],
    ) {
        if (map.getSource(sourceId)) return;

        map.addSource(sourceId, {
            type: 'vector',
            tiles: [tileUrl],
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
                    'interpolate', ['linear'], ['to-number', ['get', 'score'], colorStops[0]!],
                    colorStops[0]!, colors[0]!,
                    colorStops[1]!, colors[1]!,
                    colorStops[2]!, colors[2]!,
                    colorStops[3]!, colors[3]!,
                    colorStops[4]!, colors[4]!,
                ] as maplibregl.ExpressionSpecification,
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: layerOutline,
            type: 'line',
            source: sourceId,
            'source-layer': sourceLayer,
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', layerFill, (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const score = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '260px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader(popupIcon, popupTitle)}
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:24px;font-weight:700;color:#1e293b">${score}
                        <span style="font-size:13px;color:#64748b;font-weight:400">${unitLabel}</span>
                    </div>
                    ${gradientBar(gradientCss, gradientLabels)}
                `))
                .addTo(map);
        });

        map.on('mouseenter', layerFill, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layerFill, () => { map.getCanvas().style.cursor = ''; });
    }

    function setLayerPairVisibility(map: MapLibreMap, ids: string[], visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ids.forEach(id => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v); });
    }

    // =========================================================================
    // HELPERS: generic line layer builder
    // =========================================================================
    function addLineLayer(
        map: MapLibreMap,
        sourceId: string,
        tileUrl: string,
        sourceLayer: string,
        layerId: string,
        lineColor: string,
        lineWidth: number,
        popupTitle: string,
        popupIcon: string,
    ) {
        if (map.getSource(sourceId)) return;

        map.addSource(sourceId, {
            type: 'vector',
            tiles: [tileUrl],
            maxzoom: 16,
        });

        map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            'source-layer': sourceLayer,
            layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': lineColor, 'line-width': lineWidth },
        });

        map.on('click', layerId, (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const routeLabel = props.label || props.route_id || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '220px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    ${popupHeader(popupIcon, popupTitle)}
                    ${routeLabel
                        ? `<div style="display:inline-block;padding:4px 12px;border-radius:16px;background:${lineColor}22;border:1px solid ${lineColor}88;color:${lineColor};font-size:15px;font-weight:700">
                               <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${lineColor};margin-right:6px;vertical-align:middle"></span>
                               Route ${routeLabel}
                           </div>`
                        : '<div style="font-size:12px;color:#64748b">No route info</div>'
                    }
                `))
                .addTo(map);
        });

        map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
    }

    // =========================================================================
    // 1. TRANSIT ACCESSIBILITY BY GE (score = index, higher = better)
    // =========================================================================
    function ensureTransitAccessGe(map: MapLibreMap) {
        addChoroLayer(
            map,
            'transport-transit-access-ge',
            TilesAPI.getSofiaPlanTransitAccessGeTileUrlTemplate(),
            'sofiaplan_transit_access_ge_tiles',
            'transport-transit-access-ge-fill',
            'transport-transit-access-ge-outline',
            [0, 0.3, 0.6, 0.9, 1.2],
            ['#f7fcf5', '#74c476', '#238b45', '#006d2c', '#00441b'],
            'PT Access (by GE)',
            'directions_transit',
            '',
            'linear-gradient(to right,#f7fcf5,#74c476,#238b45,#00441b)',
            ['0', '0.6', '1.2'],
        );
    }

    const toggleTransitAccessGe = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showTransitAccessGe.value = forceState ?? !showTransitAccessGe.value;
        ensureTransitAccessGe(map);
        setLayerPairVisibility(map, [
            'transport-transit-access-ge-fill',
            'transport-transit-access-ge-outline',
        ], showTransitAccessGe.value);
    };

    // =========================================================================
    // 2. TRANSIT ACCESSIBILITY BY TRANSPORT DISTRICT
    // =========================================================================
    function ensureTransitAccessDistrict(map: MapLibreMap) {
        addChoroLayer(
            map,
            'transport-transit-access-district',
            TilesAPI.getSofiaPlanTransitAccessDistrictTileUrlTemplate(),
            'sofiaplan_transit_access_district_tiles',
            'transport-transit-access-district-fill',
            'transport-transit-access-district-outline',
            [0, 500, 1000, 1500, 2000],
            ['#f7fcf5', '#74c476', '#238b45', '#006d2c', '#00441b'],
            'PT Access (by District)',
            'directions_transit',
            'm',
            'linear-gradient(to right,#f7fcf5,#74c476,#238b45,#00441b)',
            ['0 m', '1000 m', '2000 m'],
        );
    }

    const toggleTransitAccessDistrict = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showTransitAccessDistrict.value = forceState ?? !showTransitAccessDistrict.value;
        ensureTransitAccessDistrict(map);
        setLayerPairVisibility(map, [
            'transport-transit-access-district-fill',
            'transport-transit-access-district-outline',
        ], showTransitAccessDistrict.value);
    };

    // =========================================================================
    // 3. METRO ACCESSIBILITY 800 m CATCHMENT
    // =========================================================================
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

    const toggleMetroAccess800m = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showMetroAccess800m.value = forceState ?? !showMetroAccess800m.value;
        ensureMetroAccess800m(map);
        setLayerPairVisibility(map, [
            'transport-metro-access-800m-fill',
            'transport-metro-access-800m-outline',
        ], showMetroAccess800m.value);
    };

    // =========================================================================
    // 4. METRO ACCESSIBILITY 1200 m+ CATCHMENT
    // =========================================================================
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

    const toggleMetroAccess1200m = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showMetroAccess1200m.value = forceState ?? !showMetroAccess1200m.value;
        ensureMetroAccess1200m(map);
        setLayerPairVisibility(map, [
            'transport-metro-access-1200m-fill',
            'transport-metro-access-1200m-outline',
        ], showMetroAccess1200m.value);
    };

    // =========================================================================
    // 5. BUS LINES (primary)
    // =========================================================================
    function ensureBusLines(map: MapLibreMap) {
        addLineLayer(
            map,
            'transport-bus-lines',
            TilesAPI.getSofiaPlanBusLinesTileUrlTemplate(),
            'sofiaplan_bus_lines_tiles',
            'transport-bus-lines-line',
            COLOR.bus,
            2,
            'Bus Lines',
            'directions_bus',
        );
    }

    const toggleBusLines = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showBusLines.value = forceState ?? !showBusLines.value;
        ensureBusLines(map);
        setLayerPairVisibility(map, ['transport-bus-lines-line'], showBusLines.value);
    };

    // =========================================================================
    // 6. BUS LINES (alternate)
    // =========================================================================
    function ensureBusLinesAlt(map: MapLibreMap) {
        addLineLayer(
            map,
            'transport-bus-lines-alt',
            TilesAPI.getSofiaPlanBusLinesAltTileUrlTemplate(),
            'sofiaplan_bus_lines_alt_tiles',
            'transport-bus-lines-alt-line',
            COLOR.busAlt,
            2,
            'Bus Lines (alt)',
            'directions_bus',
        );
    }

    const toggleBusLinesAlt = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showBusLinesAlt.value = forceState ?? !showBusLinesAlt.value;
        ensureBusLinesAlt(map);
        setLayerPairVisibility(map, ['transport-bus-lines-alt-line'], showBusLinesAlt.value);
    };

    // =========================================================================
    // 7. TROLLEYBUS LINES
    // =========================================================================
    function ensureTrolleybusLines(map: MapLibreMap) {
        addLineLayer(
            map,
            'transport-trolleybus-lines',
            TilesAPI.getSofiaPlanTrolleybusLinesTileUrlTemplate(),
            'sofiaplan_trolleybus_lines_tiles',
            'transport-trolleybus-lines-line',
            COLOR.trolleybus,
            2,
            'Trolleybus Lines',
            'electric_bolt',
        );
    }

    const toggleTrolleybusLines = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showTrolleybusLines.value = forceState ?? !showTrolleybusLines.value;
        ensureTrolleybusLines(map);
        setLayerPairVisibility(map, ['transport-trolleybus-lines-line'], showTrolleybusLines.value);
    };

    // =========================================================================
    // 8. TRAM LINES (primary)
    // =========================================================================
    function ensureTramLines(map: MapLibreMap) {
        addLineLayer(
            map,
            'transport-tram-lines',
            TilesAPI.getSofiaPlanTramLinesTileUrlTemplate(),
            'sofiaplan_tram_lines_tiles',
            'transport-tram-lines-line',
            COLOR.tram,
            2.5,
            'Tram Lines',
            'tram',
        );
    }

    const toggleTramLines = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showTramLines.value = forceState ?? !showTramLines.value;
        ensureTramLines(map);
        setLayerPairVisibility(map, ['transport-tram-lines-line'], showTramLines.value);
    };

    // =========================================================================
    // 9. TRAM LINES (alternate)
    // =========================================================================
    function ensureTramLinesAlt(map: MapLibreMap) {
        addLineLayer(
            map,
            'transport-tram-lines-alt',
            TilesAPI.getSofiaPlanTramLinesAltTileUrlTemplate(),
            'sofiaplan_tram_lines_alt_tiles',
            'transport-tram-lines-alt-line',
            COLOR.tramAlt,
            2,
            'Tram Lines (alt)',
            'tram',
        );
    }

    const toggleTramLinesAlt = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showTramLinesAlt.value = forceState ?? !showTramLinesAlt.value;
        ensureTramLinesAlt(map);
        setLayerPairVisibility(map, ['transport-tram-lines-alt-line'], showTramLinesAlt.value);
    };

    // =========================================================================
    // 10. RAILWAY STATIONS (circle scaled by passenger load)
    // =========================================================================
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

    const toggleRailwayStations = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showRailwayStations.value = forceState ?? !showRailwayStations.value;
        ensureRailwayStations(map);
        setLayerPairVisibility(map, ['transport-railway-stations-circle'], showRailwayStations.value);
    };

    // =========================================================================
    // Toggle all transport layers on/off
    // =========================================================================
    const toggleAllTransport = (map: MapLibreMap | null) => {
        if (!map) return;
        const next = !showAnyTransport.value;
        toggleTransitAccessGe(map, next);
        toggleTransitAccessDistrict(map, next);
        toggleMetroAccess800m(map, next);
        toggleMetroAccess1200m(map, next);
        toggleBusLines(map, next);
        toggleBusLinesAlt(map, next);
        toggleTrolleybusLines(map, next);
        toggleTramLines(map, next);
        toggleTramLinesAlt(map, next);
        toggleRailwayStations(map, next);
    };

    return {
        // Visibility state
        showTransitAccessGe,
        showTransitAccessDistrict,
        showMetroAccess800m,
        showMetroAccess1200m,
        showBusLines,
        showBusLinesAlt,
        showTrolleybusLines,
        showTramLines,
        showTramLinesAlt,
        showRailwayStations,
        showAnyTransport,
        // Toggle functions
        toggleTransitAccessGe,
        toggleTransitAccessDistrict,
        toggleMetroAccess800m,
        toggleMetroAccess1200m,
        toggleBusLines,
        toggleBusLinesAlt,
        toggleTrolleybusLines,
        toggleTramLines,
        toggleTramLinesAlt,
        toggleRailwayStations,
        toggleAllTransport,
    };
}
