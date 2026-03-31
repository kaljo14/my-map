import { ref, computed } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';

// ── Zoning category colors ──────────────────────────────────────────────────
const ZONE_COLORS: Record<string, string> = {
    residential: '#4e8cbb',
    mixed_use: '#7b5ea7',
    commercial: '#e6850a',
    industrial: '#9e7b5c',
    green: '#3da35d',
    transport: '#e8c547',
    public: '#e05c5c',
};

// Maps the first Cyrillic character of the `new_end` zone code to a color.
// Bulgarian zone codes: Ж=жилищна, О=обществено, Ц=централна, З=зелени,
//                       П=производствена, Т=транспортна, С=смесена
const ZONE_CODE_COLORS: Record<string, string> = {
    'Ж': ZONE_COLORS.residential,
    'О': ZONE_COLORS.public,
    'Ц': ZONE_COLORS.commercial,
    'З': ZONE_COLORS.green,
    'П': ZONE_COLORS.industrial,
    'Т': ZONE_COLORS.transport,
    'С': ZONE_COLORS.mixed_use,
};

// Maps English category names used in the UI to their `new_end` first-character prefix.
const CATEGORY_PREFIXES: Record<string, string> = {
    residential: 'Ж',
    public: 'О',
    commercial: 'Ц',
    green: 'З',
    industrial: 'П',
    transport: 'Т',
    mixed_use: 'С',
};

const ALL_ZONING_CATEGORIES = Object.keys(ZONE_COLORS);

function gradientBar(css: string, labels: [string, string, string]): string {
    return `
        <div style="margin-top:10px;height:7px;border-radius:4px;background:${css}"></div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-top:3px">
            <span>${labels[0]}</span><span>${labels[1]}</span><span>${labels[2]}</span>
        </div>`;
}

// ── Shared popup container style ─────────────────────────────────────────────
function popupWrap(content: string): string {
    return `<div style="font-family:system-ui,sans-serif;min-width:200px;color:#0f172a">${content}</div>`;
}

export function useSofiaPlanLayers() {
    // ── Per-layer visibility refs ─────────────────────────────────────────────
    const showZoning = ref(false);
    const activeZoningCategories = ref<string[]>([...ALL_ZONING_CATEGORIES]);
    const showIncome = ref(false);
    const showPropertyPrices = ref(false);
    const showMetroCatchments = ref(false);
    const showPedestrianSyntax = ref(false);
    const pedestrianSyntaxThreshold = ref(0);        // 0–100 (percentage)
    const selectedPedestrianNeighborhoods = ref<string[]>([]);
    const neighborhoodNames = ref<string[]>([]);
    const showSofiaPlanPopulation = ref(false);
    const showBusinessTurnover = ref(false);
    const showDevelopmentPotential = ref(false);
    const showZoningParams = ref(false);
    const showNeighborhoods = ref(false);
    const showCensusAddresses = ref(false);
    const showDemographicForecast = ref(false);
    const showDemographicForecastGe = ref(false);
    const showPopulationPotential = ref(false);
    const showResidentialLoad = ref(false);

    const showAnySofiaPlan = computed(() =>
        showZoning.value || showIncome.value || showPropertyPrices.value ||
        showMetroCatchments.value || showPedestrianSyntax.value || showSofiaPlanPopulation.value ||
        showBusinessTurnover.value || showDevelopmentPotential.value || showZoningParams.value ||
        showNeighborhoods.value || showCensusAddresses.value || showDemographicForecast.value ||
        showDemographicForecastGe.value || showPopulationPotential.value || showResidentialLoad.value
    );

    // ── Active popup (shared across all layers) ───────────────────────────────
    let activePopup: maplibregl.Popup | null = null;

    // ═════════════════════════════════════════════════════════════════════════
    // 1. ZONING (categorical)
    // ═════════════════════════════════════════════════════════════════════════
    function ensureZoning(map: MapLibreMap) {
        if (map.getSource('sofiaplan-zoning')) return;

        map.addSource('sofiaplan-zoning', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanZoningTileUrlTemplate()],
            maxzoom: 14,
        });

        // Color is derived from the first character of `new_end` (e.g. "Ж", "О", "Ц").
        const colorExpr: maplibregl.ExpressionSpecification = [
            'case',
            ['==', ['slice', ['get', 'new_end'], 0, 1], 'Ж'], ZONE_COLORS.residential,
            ['==', ['slice', ['get', 'new_end'], 0, 1], 'О'], ZONE_COLORS.public,
            ['==', ['slice', ['get', 'new_end'], 0, 1], 'Ц'], ZONE_COLORS.commercial,
            ['==', ['slice', ['get', 'new_end'], 0, 1], 'З'], ZONE_COLORS.green,
            ['==', ['slice', ['get', 'new_end'], 0, 1], 'П'], ZONE_COLORS.industrial,
            ['==', ['slice', ['get', 'new_end'], 0, 1], 'Т'], ZONE_COLORS.transport,
            ['==', ['slice', ['get', 'new_end'], 0, 1], 'С'], ZONE_COLORS.mixed_use,
            '#aaaaaa',
        ];

        map.addLayer({
            id: 'sofiaplan-zoning-fill',
            type: 'fill',
            source: 'sofiaplan-zoning',
            'source-layer': 'sofiaplan_zoning_tiles',
            layout: { visibility: 'none' },
            paint: { 'fill-color': colorExpr, 'fill-opacity': 0.5 },
        });

        map.addLayer({
            id: 'sofiaplan-zoning-outline',
            type: 'line',
            source: 'sofiaplan-zoning',
            'source-layer': 'sofiaplan_zoning_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-zoning-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const zoneCode = String(props.new_end || '');
            const zoneLabel = String(props.label || '');
            const color = ZONE_CODE_COLORS[zoneCode.charAt(0)] ?? '#aaaaaa';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">domain</span>Urban Zone
                    </h3>
                    <div style="display:inline-block;padding:6px 14px;border-radius:20px;background:${color}22;border:1px solid ${color}88;color:${color};font-size:14px;font-weight:600;margin-bottom:8px">
                        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px;vertical-align:middle"></span>
                        ${zoneCode}
                    </div>
                    ${zoneLabel ? `<div style="font-size:13px;color:#475569;margin-top:4px">${zoneLabel}</div>` : ''}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-zoning-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-zoning-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setZoningVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-zoning-fill', 'sofiaplan-zoning-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleZoning = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showZoning.value = forceState ?? !showZoning.value;
        ensureZoning(map);
        setZoningVisibility(map, showZoning.value);
    };

    function applyZoningCategoryFilter(map: MapLibreMap) {
        if (!map.getLayer('sofiaplan-zoning-fill')) return;
        const cats = activeZoningCategories.value;
        if (cats.length === ALL_ZONING_CATEGORIES.length) {
            map.setFilter('sofiaplan-zoning-fill', null);
            map.setFilter('sofiaplan-zoning-outline', null);
        } else {
            const prefixes = cats.map(c => CATEGORY_PREFIXES[c]).filter(Boolean);
            const filter: maplibregl.FilterSpecification = prefixes.length === 0
                ? (['==', ['get', 'new_end'], '___never___'] as maplibregl.FilterSpecification)
                : (['any', ...prefixes.map(p =>
                    ['==', ['slice', ['get', 'new_end'], 0, 1], p]
                )] as maplibregl.FilterSpecification);
            map.setFilter('sofiaplan-zoning-fill', filter);
            map.setFilter('sofiaplan-zoning-outline', filter);
        }
    }

    const toggleZoningCategory = (map: MapLibreMap | null, category: string) => {
        if (!map) return;
        const idx = activeZoningCategories.value.indexOf(category);
        if (idx >= 0) {
            activeZoningCategories.value.splice(idx, 1);
        } else {
            activeZoningCategories.value.push(category);
        }
        applyZoningCategoryFilter(map);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 2. INCOME (monthly income in BGN, range 903–1806)
    // ═════════════════════════════════════════════════════════════════════════
    function ensureIncome(map: MapLibreMap) {
        if (map.getSource('sofiaplan-income')) return;

        map.addSource('sofiaplan-income', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanIncomeTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-income-fill',
            type: 'fill',
            source: 'sofiaplan-income',
            'source-layer': 'sofiaplan_income_tiles',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'score'], 900],
                    900, '#f7f4f9', 1125, '#c994c7', 1350, '#dd1c77', 1575, '#980043', 1800, '#67001f'],
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: 'sofiaplan-income-outline',
            type: 'line',
            source: 'sofiaplan-income',
            'source-layer': 'sofiaplan_income_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-income-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const score = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">payments</span>Income Level
                    </h3>
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:28px;font-weight:700;color:#dd1c77">${score}<span style="font-size:14px;color:#64748b;font-weight:400"> BGN/month</span></div>
                    ${gradientBar('linear-gradient(to right,#f7f4f9,#c994c7,#dd1c77,#67001f)', ['900', '1,350', '1,800'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-income-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-income-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setIncomeVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-income-fill', 'sofiaplan-income-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleIncome = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showIncome.value = forceState ?? !showIncome.value;
        ensureIncome(map);
        setIncomeVisibility(map, showIncome.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 3. PROPERTY PRICES (BGN/m², range 121–2412)
    // ═════════════════════════════════════════════════════════════════════════
    function ensurePropertyPrices(map: MapLibreMap) {
        if (map.getSource('sofiaplan-property-prices')) return;

        map.addSource('sofiaplan-property-prices', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanPropertyPricesTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-property-prices-fill',
            type: 'fill',
            source: 'sofiaplan-property-prices',
            'source-layer': 'sofiaplan_property_prices_tiles',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'score'], 100],
                    100, '#ffffcc', 700, '#fed976', 1300, '#fd8d3c', 1900, '#f03b20', 2500, '#bd0026'],
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: 'sofiaplan-property-prices-outline',
            type: 'line',
            source: 'sofiaplan-property-prices',
            'source-layer': 'sofiaplan_property_prices_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-property-prices-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const price = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">real_estate_agent</span>Property Price
                    </h3>
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:24px;font-weight:700;color:#fd8d3c">${price}<span style="font-size:13px;color:#64748b;font-weight:400"> BGN/m²</span></div>
                    ${gradientBar('linear-gradient(to right,#ffffcc,#fed976,#fd8d3c,#bd0026)', ['100', '1,300', '2,500'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-property-prices-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-property-prices-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setPropertyPricesVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-property-prices-fill', 'sofiaplan-property-prices-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const togglePropertyPrices = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showPropertyPrices.value = forceState ?? !showPropertyPrices.value;
        ensurePropertyPrices(map);
        setPropertyPricesVisibility(map, showPropertyPrices.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 4. METRO CATCHMENTS (radius in metres, range 400–2000)
    // ═════════════════════════════════════════════════════════════════════════
    function ensureMetroCatchments(map: MapLibreMap) {
        if (map.getSource('sofiaplan-metro-catchments')) return;

        map.addSource('sofiaplan-metro-catchments', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanMetroCatchmentsTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-metro-catchments-fill',
            type: 'fill',
            source: 'sofiaplan-metro-catchments',
            'source-layer': 'sofiaplan_metro_catchments_tiles',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'score'], 400],
                    400, '#f7fbff', 800, '#9ecae1', 1200, '#3182bd', 1600, '#08519c', 2000, '#08306b'],
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: 'sofiaplan-metro-catchments-outline',
            type: 'line',
            source: 'sofiaplan-metro-catchments',
            'source-layer': 'sofiaplan_metro_catchments_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-metro-catchments-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const score = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">train</span>Metro Catchment
                    </h3>
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:28px;font-weight:700;color:#3182bd">${score}<span style="font-size:14px;color:#64748b;font-weight:400"> m</span></div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:4px">Catchment radius</div>
                    ${gradientBar('linear-gradient(to right,#f7fbff,#9ecae1,#3182bd,#08306b)', ['400 m', '1,200 m', '2,000 m'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-metro-catchments-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-metro-catchments-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setMetroCatchmentsVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-metro-catchments-fill', 'sofiaplan-metro-catchments-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleMetroCatchments = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showMetroCatchments.value = forceState ?? !showMetroCatchments.value;
        ensureMetroCatchments(map);
        setMetroCatchmentsVisibility(map, showMetroCatchments.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 5. PEDESTRIAN SYNTAX (integration metric, range 3–17828)
    // ═════════════════════════════════════════════════════════════════════════
    // Build the combined MapLibre filter for the pedestrian syntax layer,
    // combining neighbourhood selection and percentile threshold.
    function buildPedestrianFilter(threshold: number, neighborhoods: string[]) {
        const conditions: maplibregl.ExpressionSpecification[] = [];
        if (threshold > 0)
            conditions.push(['>=', ['coalesce', ['get', 'local_percentile'], 0], threshold / 100]);
        if (neighborhoods.length > 0)
            conditions.push(['in', ['get', 'neighborhood'], ['literal', neighborhoods]]);
        if (conditions.length === 0) return null;
        if (conditions.length === 1) return conditions[0];
        return ['all', ...conditions] as maplibregl.ExpressionSpecification;
    }

    function ensurePedestrianSyntax(map: MapLibreMap) {
        if (map.getSource('sofiaplan-pedestrian-syntax')) return;

        map.addSource('sofiaplan-pedestrian-syntax', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanPedestrianSyntaxTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-pedestrian-syntax-fill',
            type: 'line',
            source: 'sofiaplan-pedestrian-syntax',
            'source-layer': 'sofiaplan_pedestrian_syntax_tiles',
            layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
            paint: {
                'line-color': ['interpolate', ['linear'], ['get', 'local_percentile'],
                    0,    '#313695',
                    0.25, '#74add1',
                    0.5,  '#ffffbf',
                    0.75, '#f46d43',
                    1,    '#a50026'],
                'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 14, 2.5],
                'line-opacity': 0.85,
            },
        });

        // Neighbourhood layers — borders, click-picker, and selected highlight.
        if (!map.getSource('sofiaplan-neighborhoods')) {
            map.addSource('sofiaplan-neighborhoods', {
                type: 'vector',
                tiles: [TilesAPI.getSofiaPlanNeighborhoodsTileUrlTemplate()],
                maxzoom: 14,
            });
        }

        // Collect neighbourhood names from tile data as tiles load.
        // querySourceFeatures returns all features in the tile cache — no extra API call needed.
        const collectNames = () => {
            const features = map.querySourceFeatures('sofiaplan-neighborhoods', {
                sourceLayer: 'sofiaplan_neighborhoods_tiles',
            });
            const incoming = features
                .map(f => f.properties?.label as string)
                .filter(Boolean);
            if (incoming.length === 0) return;
            const merged = [...new Set([...neighborhoodNames.value, ...incoming])].sort();
            if (merged.length !== neighborhoodNames.value.length)
                neighborhoodNames.value = merged;
        };
        map.on('sourcedata', (e) => {
            if (e.sourceId === 'sofiaplan-neighborhoods') collectNames();
        });
        map.on('idle', collectNames);

        // Visible grey borders
        map.addLayer({
            id: 'sofiaplan-pedestrian-neighborhood-borders',
            type: 'line',
            source: 'sofiaplan-neighborhoods',
            'source-layer': 'sofiaplan_neighborhoods_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#94a3b8', 'line-width': 1, 'line-opacity': 0.6 },
        });

        // Invisible fill used only as a click hit-area
        map.addLayer({
            id: 'sofiaplan-pedestrian-neighborhood-picker',
            type: 'fill',
            source: 'sofiaplan-neighborhoods',
            'source-layer': 'sofiaplan_neighborhoods_tiles',
            layout: { visibility: 'none' },
            paint: { 'fill-color': 'rgba(0,0,0,0)' },
        });

        // Purple outline for selected neighbourhood
        map.addLayer({
            id: 'sofiaplan-pedestrian-neighborhood-selected',
            type: 'line',
            source: 'sofiaplan-neighborhoods',
            'source-layer': 'sofiaplan_neighborhoods_tiles',
            layout: { visibility: 'none' },
            filter: ['==', ['get', 'label'], ''],
            paint: { 'line-color': '#6366f1', 'line-width': 2.5, 'line-opacity': 1 },
        });

        // Click on the invisible picker to toggle a neighbourhood in/out of the selection
        map.on('click', 'sofiaplan-pedestrian-neighborhood-picker', (e) => {
            const name: string = e.features?.[0]?.properties?.label ?? '';
            if (!name) return;
            const current = selectedPedestrianNeighborhoods.value;
            const next = current.includes(name)
                ? current.filter(n => n !== name)
                : [...current, name];
            selectedPedestrianNeighborhoods.value = next;
            if (map.getLayer('sofiaplan-pedestrian-neighborhood-selected'))
                map.setFilter('sofiaplan-pedestrian-neighborhood-selected',
                    next.length > 0
                        ? ['in', ['get', 'label'], ['literal', next]]
                        : ['==', ['get', 'label'], '']);
            if (map.getLayer('sofiaplan-pedestrian-syntax-fill'))
                map.setFilter('sofiaplan-pedestrian-syntax-fill',
                    buildPedestrianFilter(pedestrianSyntaxThreshold.value, next));
        });
        map.on('mouseenter', 'sofiaplan-pedestrian-neighborhood-picker', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-pedestrian-neighborhood-picker', () => { map.getCanvas().style.cursor = ''; });

        map.on('click', 'sofiaplan-pedestrian-syntax-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const score = Number(props.score ?? 0).toLocaleString();
            const neighborhood = props.neighborhood || '';
            const pct = props.local_percentile != null
                ? Math.round(Number(props.local_percentile) * 100)
                : null;
            const pctColor = pct == null ? '#94a3b8'
                : pct >= 75 ? '#a50026'
                : pct >= 50 ? '#f46d43'
                : pct >= 25 ? '#74add1'
                : '#313695';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '260px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 10px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">schema</span>Pedestrian Integration
                    </h3>
                    ${neighborhood ? `<div style="font-size:12px;color:#64748b;margin-bottom:8px">
                        <span class="material-symbols-outlined" style="font-size:12px;vertical-align:middle;margin-right:3px">location_city</span>${neighborhood}
                    </div>` : ''}
                    ${pct != null ? `
                    <div style="margin-bottom:10px">
                        <div style="font-size:11px;color:#64748b;margin-bottom:2px">Rank within neighbourhood</div>
                        <div style="font-size:30px;font-weight:700;color:${pctColor};line-height:1">${pct}<span style="font-size:16px">%</span></div>
                        <div style="font-size:11px;color:#94a3b8">top ${100 - pct}% of streets here</div>
                    </div>` : ''}
                    <div style="font-size:11px;color:#64748b;margin-bottom:2px">Global integration score</div>
                    <div style="font-size:18px;font-weight:600;color:#475569">${score}</div>
                    ${gradientBar('linear-gradient(to right,#313695,#74add1,#ffffbf,#f46d43,#a50026)', ['Lowest', 'Mid', 'Highest'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-pedestrian-syntax-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-pedestrian-syntax-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setPedestrianSyntaxVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-pedestrian-syntax-fill',
         'sofiaplan-pedestrian-neighborhood-borders',
         'sofiaplan-pedestrian-neighborhood-picker',
         'sofiaplan-pedestrian-neighborhood-selected'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
        if (!visible) {
            selectedPedestrianNeighborhoods.value = [];
            if (map.getLayer('sofiaplan-pedestrian-neighborhood-selected'))
                map.setFilter('sofiaplan-pedestrian-neighborhood-selected', ['==', ['get', 'label'], '']);
            if (map.getLayer('sofiaplan-pedestrian-syntax-fill'))
                map.setFilter('sofiaplan-pedestrian-syntax-fill', null);
        }
    }

    const togglePedestrianSyntax = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showPedestrianSyntax.value = forceState ?? !showPedestrianSyntax.value;
        ensurePedestrianSyntax(map);
        setPedestrianSyntaxVisibility(map, showPedestrianSyntax.value);
    };

    const setPedestrianSyntaxThreshold = (map: MapLibreMap | null, threshold: number) => {
        if (!map) return;
        pedestrianSyntaxThreshold.value = threshold;
        if (map.getLayer('sofiaplan-pedestrian-syntax-fill'))
            map.setFilter('sofiaplan-pedestrian-syntax-fill',
                buildPedestrianFilter(threshold, selectedPedestrianNeighborhoods.value));
    };

    // Toggle one neighbourhood in/out of the multi-selection (used by the sidebar picker)
    const selectPedestrianNeighborhood = (map: MapLibreMap | null, names: string[]) => {
        if (!map) return;
        selectedPedestrianNeighborhoods.value = names;
        if (map.getLayer('sofiaplan-pedestrian-neighborhood-selected'))
            map.setFilter('sofiaplan-pedestrian-neighborhood-selected',
                names.length > 0
                    ? ['in', ['get', 'label'], ['literal', names]]
                    : ['==', ['get', 'label'], '']);
        if (map.getLayer('sofiaplan-pedestrian-syntax-fill'))
            map.setFilter('sofiaplan-pedestrian-syntax-fill',
                buildPedestrianFilter(pedestrianSyntaxThreshold.value, names));
    };

    const clearPedestrianNeighborhoods = (map: MapLibreMap | null) =>
        selectPedestrianNeighborhood(map, []);

    // ═════════════════════════════════════════════════════════════════════════
    // 6. POPULATION GRID (total population, range 0–23934)
    // ═════════════════════════════════════════════════════════════════════════
    function ensureSofiaPlanPopulation(map: MapLibreMap) {
        if (map.getSource('sofiaplan-population-grid')) return;

        map.addSource('sofiaplan-population-grid', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanPopulationGridTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-population-grid-fill',
            type: 'fill',
            source: 'sofiaplan-population-grid',
            'source-layer': 'sofiaplan_population_grid_tiles',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
                    0, '#3288bd', 6000, '#abdda4', 12000, '#fee08b', 18000, '#fdae61', 24000, '#f46d43'],
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: 'sofiaplan-population-grid-outline',
            type: 'line',
            source: 'sofiaplan-population-grid',
            'source-layer': 'sofiaplan_population_grid_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-population-grid-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const population = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">group</span>Population Grid (1×1 km)
                    </h3>
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:24px;font-weight:700;color:#f46d43">${population}<span style="font-size:13px;color:#64748b;font-weight:400"> residents</span></div>
                    ${gradientBar('linear-gradient(to right,#3288bd,#abdda4,#fee08b,#f46d43)', ['0', '12,000', '24,000'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-population-grid-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-population-grid-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setSofiaPlanPopulationVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-population-grid-fill', 'sofiaplan-population-grid-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleSofiaPlanPopulation = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showSofiaPlanPopulation.value = forceState ?? !showSofiaPlanPopulation.value;
        ensureSofiaPlanPopulation(map);
        setSofiaPlanPopulationVisibility(map, showSofiaPlanPopulation.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 7. BUSINESS TURNOVER (turnover 2016, range 38–14576)
    // ═════════════════════════════════════════════════════════════════════════
    function ensureBusinessTurnover(map: MapLibreMap) {
        if (map.getSource('sofiaplan-business-turnover')) return;

        map.addSource('sofiaplan-business-turnover', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanBusinessTurnoverTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-business-turnover-fill',
            type: 'fill',
            source: 'sofiaplan-business-turnover',
            'source-layer': 'sofiaplan_business_turnover_tiles',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
                    0, '#e5f5e0', 3500, '#a1d99b', 7000, '#41ab5d', 10500, '#238b45', 14500, '#005a32'],
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: 'sofiaplan-business-turnover-outline',
            type: 'line',
            source: 'sofiaplan-business-turnover',
            'source-layer': 'sofiaplan_business_turnover_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-business-turnover-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const score = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">storefront</span>Business Activity
                    </h3>
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:28px;font-weight:700;color:#41ab5d">${score}</div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:4px">Turnover index (2016)</div>
                    ${gradientBar('linear-gradient(to right,#e5f5e0,#41ab5d,#005a32)', ['0', '7,000', '14,500'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-business-turnover-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-business-turnover-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setBusinessTurnoverVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-business-turnover-fill', 'sofiaplan-business-turnover-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleBusinessTurnover = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showBusinessTurnover.value = forceState ?? !showBusinessTurnover.value;
        ensureBusinessTurnover(map);
        setBusinessTurnoverVisibility(map, showBusinessTurnover.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 8. DEVELOPMENT POTENTIAL (score 1–3)
    // ═════════════════════════════════════════════════════════════════════════
    function ensureDevelopmentPotential(map: MapLibreMap) {
        if (map.getSource('sofiaplan-dev-potential')) return;

        map.addSource('sofiaplan-dev-potential', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanDevelopmentPotentialTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-dev-potential-fill',
            type: 'fill',
            source: 'sofiaplan-dev-potential',
            'source-layer': 'sofiaplan_development_potential_tiles',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'score'], 1],
                    1, '#313695', 1.5, '#74add1', 2, '#fee090', 2.5, '#f46d43', 3, '#a50026'],
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: 'sofiaplan-dev-potential-outline',
            type: 'line',
            source: 'sofiaplan-dev-potential',
            'source-layer': 'sofiaplan_development_potential_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-dev-potential-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const score = Number(props.score ?? 1);
            const areaLabel = props.label || '';
            const potentialLabel = score >= 2.5 ? 'High Potential' : score >= 1.5 ? 'Moderate' : 'Low Potential';
            const color = score >= 2.5 ? '#a50026' : score >= 1.5 ? '#fee090' : '#74add1';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">construction</span>Development Potential
                    </h3>
                    ${areaLabel ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${areaLabel}</div>` : ''}
                    <div style="font-size:28px;font-weight:700;color:${color}">${score.toFixed(0)}<span style="font-size:14px;color:#64748b;font-weight:400"> / 3</span></div>
                    <div style="font-size:12px;color:${color};font-weight:600;margin-top:4px">${potentialLabel}</div>
                    ${gradientBar('linear-gradient(to right,#313695,#74add1,#fee090,#a50026)', ['1', '2', '3'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-dev-potential-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-dev-potential-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setDevelopmentPotentialVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-dev-potential-fill', 'sofiaplan-dev-potential-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleDevelopmentPotential = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showDevelopmentPotential.value = forceState ?? !showDevelopmentPotential.value;
        ensureDevelopmentPotential(map);
        setDevelopmentPotentialVisibility(map, showDevelopmentPotential.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 9. ZONING PARAMETERS
    // ═════════════════════════════════════════════════════════════════════════
    function ensureZoningParams(map: MapLibreMap) {
        if (map.getSource('sofiaplan-zoning-params')) return;

        map.addSource('sofiaplan-zoning-params', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanZoningParamsTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-zoning-params-fill',
            type: 'fill',
            source: 'sofiaplan-zoning-params',
            'source-layer': 'sofiaplan_zoning_params',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'far'], 0],
                    0, '#f0f0f0', 1, '#bdbdbd', 2, '#969696', 3.5, '#525252', 5, '#252525'],
                'fill-opacity': 0.5,
            },
        });

        map.addLayer({
            id: 'sofiaplan-zoning-params-outline',
            type: 'line',
            source: 'sofiaplan-zoning-params',
            'source-layer': 'sofiaplan_zoning_params',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-zoning-params-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const far = Number(props.far ?? 0).toFixed(1);
            const maxHeight = props.max_height ? `${props.max_height} m` : '—';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">rule</span>Zoning Parameters
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                        <div style="background:#f8fafc;padding:8px;border-radius:6px">
                            <div style="font-size:11px;color:#64748b;margin-bottom:3px">Floor Area Ratio</div>
                            <div style="font-size:20px;font-weight:700;color:#525252">FAR ${far}</div>
                        </div>
                        <div style="background:#f8fafc;padding:8px;border-radius:6px">
                            <div style="font-size:11px;color:#64748b;margin-bottom:3px">Max Height</div>
                            <div style="font-size:20px;font-weight:700;color:#525252">${maxHeight}</div>
                        </div>
                    </div>
                    ${gradientBar('linear-gradient(to right,#f0f0f0,#969696,#252525)', ['FAR 0', 'FAR 2.5', 'FAR 5+'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-zoning-params-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-zoning-params-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setZoningParamsVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-zoning-params-fill', 'sofiaplan-zoning-params-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleZoningParams = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showZoningParams.value = forceState ?? !showZoningParams.value;
        ensureZoningParams(map);
        setZoningParamsVisibility(map, showZoningParams.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 10. NEIGHBORHOODS (квартали, 310 polygons)
    // ═════════════════════════════════════════════════════════════════════════
    function ensureNeighborhoods(map: MapLibreMap) {
        if (map.getSource('sofiaplan-neighborhoods')) return;

        map.addSource('sofiaplan-neighborhoods', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanNeighborhoodsTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-neighborhoods-fill',
            type: 'fill',
            source: 'sofiaplan-neighborhoods',
            'source-layer': 'sofiaplan_neighborhoods_tiles',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': '#8b5cf6',
                'fill-opacity': 0.15,
            },
        });

        map.addLayer({
            id: 'sofiaplan-neighborhoods-outline',
            type: 'line',
            source: 'sofiaplan-neighborhoods',
            'source-layer': 'sofiaplan_neighborhoods_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#8b5cf6', 'line-width': 1.5, 'line-opacity': 0.7 },
        });

        map.addLayer({
            id: 'sofiaplan-neighborhoods-label',
            type: 'symbol',
            source: 'sofiaplan-neighborhoods',
            'source-layer': 'sofiaplan_neighborhoods_tiles',
            layout: {
                visibility: 'none',
                'text-field': ['get', 'label'],
                'text-size': 11,
                'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                'text-anchor': 'center',
                'text-max-width': 8,
            },
            paint: {
                'text-color': '#5b21b6',
                'text-halo-color': '#ffffff',
                'text-halo-width': 1.5,
            },
        });

        map.on('click', 'sofiaplan-neighborhoods-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const name = props.label || 'Unknown';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">location_city</span>Neighborhood
                    </h3>
                    <div style="font-size:20px;font-weight:700;color:#8b5cf6">${name}</div>
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-neighborhoods-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-neighborhoods-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setNeighborhoodsVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-neighborhoods-fill', 'sofiaplan-neighborhoods-outline', 'sofiaplan-neighborhoods-label'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleNeighborhoods = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showNeighborhoods.value = forceState ?? !showNeighborhoods.value;
        ensureNeighborhoods(map);
        setNeighborhoodsVisibility(map, showNeighborhoods.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 11. CENSUS ADDRESSES (population per address, ~90k points)
    // ═════════════════════════════════════════════════════════════════════════
    function ensureCensusAddresses(map: MapLibreMap) {
        if (map.getSource('sofiaplan-census-addresses')) return;

        map.addSource('sofiaplan-census-addresses', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanCensusAddressesTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-census-addresses-circle',
            type: 'circle',
            source: 'sofiaplan-census-addresses',
            'source-layer': 'sofiaplan_census_addresses_tiles',
            layout: { visibility: 'none' },
            paint: {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 14, 5],
                'circle-color': ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
                    0, '#edf8fb', 50, '#b2e2e2', 150, '#66c2a4', 400, '#238b45', 1000, '#005824'],
                'circle-opacity': 0.7,
                'circle-stroke-width': 0.5,
                'circle-stroke-color': '#ffffff',
            },
        });

        map.on('click', 'sofiaplan-census-addresses-circle', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const pop = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">home</span>Census Address
                    </h3>
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:28px;font-weight:700;color:#238b45">${pop}<span style="font-size:14px;color:#64748b;font-weight:400"> residents</span></div>
                    ${gradientBar('linear-gradient(to right,#edf8fb,#66c2a4,#005824)', ['0', '500', '1,000+'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-census-addresses-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-census-addresses-circle', () => { map.getCanvas().style.cursor = ''; });
    }

    function setCensusAddressesVisibility(map: MapLibreMap, visible: boolean) {
        if (map.getLayer('sofiaplan-census-addresses-circle')) {
            map.setLayoutProperty('sofiaplan-census-addresses-circle', 'visibility', visible ? 'visible' : 'none');
        }
    }

    const toggleCensusAddresses = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showCensusAddresses.value = forceState ?? !showCensusAddresses.value;
        ensureCensusAddresses(map);
        setCensusAddressesVisibility(map, showCensusAddresses.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 11. DEMOGRAPHIC FORECAST (pop 2017 + forecasts 2030/2040/2050)
    // ═════════════════════════════════════════════════════════════════════════
    function ensureDemographicForecast(map: MapLibreMap) {
        if (map.getSource('sofiaplan-demo-forecast')) return;

        map.addSource('sofiaplan-demo-forecast', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanDemographicForecastTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-demo-forecast-fill',
            type: 'fill',
            source: 'sofiaplan-demo-forecast',
            'source-layer': 'sofiaplan_demographic_forecast_tiles',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
                    0, '#f7fcf5', 5000, '#a1d99b', 15000, '#41ab5d', 30000, '#006d2c', 50000, '#00441b'],
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: 'sofiaplan-demo-forecast-outline',
            type: 'line',
            source: 'sofiaplan-demo-forecast',
            'source-layer': 'sofiaplan_demographic_forecast_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-demo-forecast-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const pop2017 = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            const f2030 = props.forecast_2030 != null ? Number(props.forecast_2030).toLocaleString() : '—';
            const f2040 = props.forecast_2040 != null ? Number(props.forecast_2040).toLocaleString() : '—';
            const f2050 = props.forecast_2050 != null ? Number(props.forecast_2050).toLocaleString() : '—';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">trending_up</span>Demographic Forecast
                    </h3>
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:24px;font-weight:700;color:#41ab5d">${pop2017}<span style="font-size:13px;color:#64748b;font-weight:400"> pop (2017)</span></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px">
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2030</div>
                            <div style="font-size:14px;font-weight:600;color:#006d2c">${f2030}</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2040</div>
                            <div style="font-size:14px;font-weight:600;color:#006d2c">${f2040}</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2050</div>
                            <div style="font-size:14px;font-weight:600;color:#006d2c">${f2050}</div>
                        </div>
                    </div>
                    ${gradientBar('linear-gradient(to right,#f7fcf5,#a1d99b,#41ab5d,#00441b)', ['0', '25,000', '50,000'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-demo-forecast-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-demo-forecast-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setDemographicForecastVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-demo-forecast-fill', 'sofiaplan-demo-forecast-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleDemographicForecast = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showDemographicForecast.value = forceState ?? !showDemographicForecast.value;
        ensureDemographicForecast(map);
        setDemographicForecastVisibility(map, showDemographicForecast.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 12. DEMOGRAPHIC FORECAST GE (pop per planning unit + forecasts)
    // ═════════════════════════════════════════════════════════════════════════
    function ensureDemographicForecastGe(map: MapLibreMap) {
        if (map.getSource('sofiaplan-demo-forecast-ge')) return;

        map.addSource('sofiaplan-demo-forecast-ge', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanDemographicForecastGeTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-demo-forecast-ge-fill',
            type: 'fill',
            source: 'sofiaplan-demo-forecast-ge',
            'source-layer': 'sofiaplan_demographic_forecast_ge_tiles',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
                    0, '#fff7ec', 5000, '#fdbb84', 15000, '#fc8d59', 30000, '#d7301f', 50000, '#7f0000'],
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: 'sofiaplan-demo-forecast-ge-outline',
            type: 'line',
            source: 'sofiaplan-demo-forecast-ge',
            'source-layer': 'sofiaplan_demographic_forecast_ge_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-demo-forecast-ge-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const pop = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            const f2030 = props.forecast_2030 != null ? Number(props.forecast_2030).toLocaleString() : '—';
            const f2040 = props.forecast_2040 != null ? Number(props.forecast_2040).toLocaleString() : '—';
            const f2050 = props.forecast_2050 != null ? Number(props.forecast_2050).toLocaleString() : '—';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">area_chart</span>Forecast (Planning Unit)
                    </h3>
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:24px;font-weight:700;color:#d7301f">${pop}<span style="font-size:13px;color:#64748b;font-weight:400"> pop (current)</span></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px">
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2030</div>
                            <div style="font-size:14px;font-weight:600;color:#7f0000">${f2030}</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2040</div>
                            <div style="font-size:14px;font-weight:600;color:#7f0000">${f2040}</div>
                        </div>
                        <div style="background:#f8fafc;padding:6px;border-radius:6px;text-align:center">
                            <div style="font-size:10px;color:#64748b">2050</div>
                            <div style="font-size:14px;font-weight:600;color:#7f0000">${f2050}</div>
                        </div>
                    </div>
                    ${gradientBar('linear-gradient(to right,#fff7ec,#fc8d59,#7f0000)', ['0', '25,000', '50,000'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-demo-forecast-ge-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-demo-forecast-ge-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setDemographicForecastGeVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-demo-forecast-ge-fill', 'sofiaplan-demo-forecast-ge-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleDemographicForecastGe = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showDemographicForecastGe.value = forceState ?? !showDemographicForecastGe.value;
        ensureDemographicForecastGe(map);
        setDemographicForecastGeVisibility(map, showDemographicForecastGe.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 13. POPULATION POTENTIAL (potential pop at 30m²/person)
    // ═════════════════════════════════════════════════════════════════════════
    function ensurePopulationPotential(map: MapLibreMap) {
        if (map.getSource('sofiaplan-pop-potential')) return;

        map.addSource('sofiaplan-pop-potential', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanPopulationPotentialTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-pop-potential-fill',
            type: 'fill',
            source: 'sofiaplan-pop-potential',
            'source-layer': 'sofiaplan_population_potential_tiles',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
                    0, '#f7fcf0', 10000, '#addd8e', 25000, '#41ab5d', 50000, '#006837', 80000, '#004529'],
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: 'sofiaplan-pop-potential-outline',
            type: 'line',
            source: 'sofiaplan-pop-potential',
            'source-layer': 'sofiaplan_population_potential_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-pop-potential-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const potential = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">groups</span>Population Potential
                    </h3>
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:28px;font-weight:700;color:#41ab5d">${potential}<span style="font-size:14px;color:#64748b;font-weight:400"> potential residents</span></div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:4px">At 30 m²/person</div>
                    ${gradientBar('linear-gradient(to right,#f7fcf0,#addd8e,#41ab5d,#004529)', ['0', '40,000', '80,000'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-pop-potential-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-pop-potential-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setPopulationPotentialVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-pop-potential-fill', 'sofiaplan-pop-potential-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const togglePopulationPotential = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showPopulationPotential.value = forceState ?? !showPopulationPotential.value;
        ensurePopulationPotential(map);
        setPopulationPotentialVisibility(map, showPopulationPotential.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 14. RESIDENTIAL LOAD (current residential load density)
    // ═════════════════════════════════════════════════════════════════════════
    function ensureResidentialLoad(map: MapLibreMap) {
        if (map.getSource('sofiaplan-residential-load')) return;

        map.addSource('sofiaplan-residential-load', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanResidentialLoadTileUrlTemplate()],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'sofiaplan-residential-load-fill',
            type: 'fill',
            source: 'sofiaplan-residential-load',
            'source-layer': 'sofiaplan_residential_load_tiles',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'score'], 0],
                    0, '#eff3ff', 25, '#9ecae1', 50, '#4292c6', 75, '#2171b5', 100, '#084594'],
                'fill-opacity': 0.45,
            },
        });

        map.addLayer({
            id: 'sofiaplan-residential-load-outline',
            type: 'line',
            source: 'sofiaplan-residential-load',
            'source-layer': 'sofiaplan_residential_load_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.on('click', 'sofiaplan-residential-load-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const load = Number(props.score ?? 0).toLocaleString();
            const label = props.label || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '240px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">apartment</span>Residential Load
                    </h3>
                    ${label ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px">${label}</div>` : ''}
                    <div style="font-size:28px;font-weight:700;color:#2171b5">${load}<span style="font-size:14px;color:#64748b;font-weight:400"> density index</span></div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:4px">Current residential load</div>
                    ${gradientBar('linear-gradient(to right,#eff3ff,#4292c6,#084594)', ['Low', 'Medium', 'High'])}
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-residential-load-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-residential-load-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setResidentialLoadVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['sofiaplan-residential-load-fill', 'sofiaplan-residential-load-outline'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleResidentialLoad = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showResidentialLoad.value = forceState ?? !showResidentialLoad.value;
        ensureResidentialLoad(map);
        setResidentialLoadVisibility(map, showResidentialLoad.value);
    };

    // ═════════════════════════════════════════════════════════════════════════
    // MASTER TOGGLE
    // ═════════════════════════════════════════════════════════════════════════
    function toggleAllSofiaPlan(map: MapLibreMap | null, forceState?: boolean) {
        const target = forceState ?? !showAnySofiaPlan.value;
        toggleZoning(map, target);
        toggleIncome(map, target);
        togglePropertyPrices(map, target);
        toggleMetroCatchments(map, target);
        togglePedestrianSyntax(map, target);
        toggleSofiaPlanPopulation(map, target);
        toggleBusinessTurnover(map, target);
        toggleDevelopmentPotential(map, target);
        toggleZoningParams(map, target);
        toggleNeighborhoods(map, target);
        toggleCensusAddresses(map, target);
        toggleDemographicForecast(map, target);
        toggleDemographicForecastGe(map, target);
        togglePopulationPotential(map, target);
        toggleResidentialLoad(map, target);
    }

    return {
        showZoning, toggleZoning, activeZoningCategories, toggleZoningCategory,
        zoningCategoryItems: ALL_ZONING_CATEGORIES.map(cat => ({
            value: cat,
            label: cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            color: ZONE_COLORS[cat],
        })),
        showIncome, toggleIncome,
        showPropertyPrices, togglePropertyPrices,
        showMetroCatchments, toggleMetroCatchments,
        showPedestrianSyntax, togglePedestrianSyntax,
        pedestrianSyntaxThreshold, setPedestrianSyntaxThreshold,
        neighborhoodNames,
        selectedPedestrianNeighborhoods, selectPedestrianNeighborhood, clearPedestrianNeighborhoods,
        showSofiaPlanPopulation, toggleSofiaPlanPopulation,
        showBusinessTurnover, toggleBusinessTurnover,
        showDevelopmentPotential, toggleDevelopmentPotential,
        showZoningParams, toggleZoningParams,
        showNeighborhoods, toggleNeighborhoods,
        showCensusAddresses, toggleCensusAddresses,
        showDemographicForecast, toggleDemographicForecast,
        showDemographicForecastGe, toggleDemographicForecastGe,
        showPopulationPotential, togglePopulationPotential,
        showResidentialLoad, toggleResidentialLoad,
        showAnySofiaPlan,
        toggleAllSofiaPlan,
    };
}
