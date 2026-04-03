import { ref, computed, type Ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';
import { popupWrap, popupHeader, gradientBar, setLayerVisibility, createLayerToggle } from './mapLayerUtils';
import { CHOROPLETH_LAYERS, type SofiaPlanChoroplethDef, type ChoroplethLayerKey } from './sofiaPlanLayerDefs';

type ToggleFn = (map: MapLibreMap | null, forceState?: boolean) => void;
interface LayerEntry { show: Ref<boolean>; toggle: ToggleFn }
type LayerStateMap = { [K in ChoroplethLayerKey]: LayerEntry };

// ── Zoning category colors ──────────────────────────────────────────────────
const ZONE_COLORS = {
    residential: '#4e8cbb',
    mixed_use: '#7b5ea7',
    commercial: '#e6850a',
    industrial: '#9e7b5c',
    green: '#3da35d',
    transport: '#e8c547',
    public: '#e05c5c',
} as const;

const ZONE_CODE_COLORS = {
    'Ж': ZONE_COLORS.residential,
    'О': ZONE_COLORS.public,
    'Ц': ZONE_COLORS.commercial,
    'З': ZONE_COLORS.green,
    'П': ZONE_COLORS.industrial,
    'Т': ZONE_COLORS.transport,
    'С': ZONE_COLORS.mixed_use,
};

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

export function useSofiaPlanLayers() {
    // ── Active popup (shared across all layers) ───────────────────────────
    let activePopup: maplibregl.Popup | null = null;

    // ══════════════════════════════════════════════════════════════════════
    // FACTORY: generate refs + toggles for data-driven choropleth layers
    // ══════════════════════════════════════════════════════════════════════
    function ensureChoroplethLayer(map: MapLibreMap, def: SofiaPlanChoroplethDef) {
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
                'fill-color': def.colorExpr,
                'fill-opacity': def.fillOpacity,
            },
        });

        const outlinePaint = def.outlinePaint ?? { color: '#ffffff', width: 0.5, opacity: 0.4 };
        map.addLayer({
            id: def.outlineLayerId,
            type: 'line',
            source: def.sourceId,
            'source-layer': def.sourceLayer,
            layout: { visibility: 'none' },
            paint: {
                'line-color': outlinePaint.color,
                'line-width': outlinePaint.width,
                'line-opacity': outlinePaint.opacity,
            },
        });

        map.on('click', def.fillLayerId, (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const score = Number(props.score ?? 0);
            const label = (props.label || '') as string;
            activePopup?.remove();

            // For layers with custom headers (buildingDensityGe, buildingFootprintGe),
            // the scoreHtml returns the full popup body including the header.
            const hasCustomHeader = !def.popup.icon && !def.popup.title;
            const bodyHtml = def.popup.scoreHtml(score, label, props as Record<string, unknown>);
            const html = hasCustomHeader
                ? popupWrap(bodyHtml)
                : popupWrap(`
                    ${popupHeader(def.popup.icon, def.popup.title)}
                    ${bodyHtml}
                `);

            activePopup = new maplibregl.Popup({ maxWidth: def.popupMaxWidth ?? '240px' })
                .setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map);
        });

        map.on('mouseenter', def.fillLayerId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', def.fillLayerId, () => { map.getCanvas().style.cursor = ''; });
    }

    // Generate state for all data-driven choropleth layers
    const layerState = Object.fromEntries(CHOROPLETH_LAYERS.map(def => {
        const show = ref(false);
        const toggle = createLayerToggle(show, [def.fillLayerId, def.outlineLayerId],
            (map) => ensureChoroplethLayer(map, def));
        return [def.key, { show, toggle }] as [string, LayerEntry];
    })) as LayerStateMap;

    // ══════════════════════════════════════════════════════════════════════
    // CUSTOM LAYERS (kept as explicit code)
    // ══════════════════════════════════════════════════════════════════════

    // ── 1. ZONING (categorical, with category filter) ─────────────────────
    const showZoning = ref(false);
    const activeZoningCategories = ref<string[]>([...ALL_ZONING_CATEGORIES]);

    function ensureZoning(map: MapLibreMap) {
        if (map.getSource('sofiaplan-zoning')) return;

        map.addSource('sofiaplan-zoning', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanZoningTileUrlTemplate()],
            maxzoom: 14,
        });

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
            const color = (ZONE_CODE_COLORS as Record<string, string>)[zoneCode.charAt(0)] ?? '#aaaaaa';
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

    const toggleZoning = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showZoning.value = forceState ?? !showZoning.value;
        ensureZoning(map);
        setLayerVisibility(map, ['sofiaplan-zoning-fill', 'sofiaplan-zoning-outline'], showZoning.value);
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

    // ── 2. PEDESTRIAN SYNTAX (threshold + neighborhood picker) ────────────
    const showPedestrianSyntax = ref(false);
    const pedestrianSyntaxThreshold = ref(0);
    const selectedPedestrianNeighborhoods = ref<string[]>([]);
    const neighborhoodNames = ref<string[]>([]);

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

        // Neighbourhood layers
        if (!map.getSource('sofiaplan-neighborhoods')) {
            map.addSource('sofiaplan-neighborhoods', {
                type: 'vector',
                tiles: [TilesAPI.getSofiaPlanNeighborhoodsTileUrlTemplate()],
                maxzoom: 14,
            });
        }

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

        map.addLayer({
            id: 'sofiaplan-pedestrian-neighborhood-borders',
            type: 'line',
            source: 'sofiaplan-neighborhoods',
            'source-layer': 'sofiaplan_neighborhoods_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#94a3b8', 'line-width': 1, 'line-opacity': 0.6 },
        });

        map.addLayer({
            id: 'sofiaplan-pedestrian-neighborhood-picker',
            type: 'fill',
            source: 'sofiaplan-neighborhoods',
            'source-layer': 'sofiaplan_neighborhoods_tiles',
            layout: { visibility: 'none' },
            paint: { 'fill-color': 'rgba(0,0,0,0)' },
        });

        map.addLayer({
            id: 'sofiaplan-pedestrian-neighborhood-selected',
            type: 'line',
            source: 'sofiaplan-neighborhoods',
            'source-layer': 'sofiaplan_neighborhoods_tiles',
            layout: { visibility: 'none' },
            filter: ['==', ['get', 'label'], ''],
            paint: { 'line-color': '#6366f1', 'line-width': 2.5, 'line-opacity': 1 },
        });

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
        setLayerVisibility(map, [
            'sofiaplan-pedestrian-syntax-fill',
            'sofiaplan-pedestrian-neighborhood-borders',
            'sofiaplan-pedestrian-neighborhood-picker',
            'sofiaplan-pedestrian-neighborhood-selected',
        ], visible);
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

    // ── 3. NEIGHBORHOODS (categorical, 3 layers) ─────────────────────────
    const showNeighborhoods = ref(false);

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
            paint: { 'fill-color': '#8b5cf6', 'fill-opacity': 0.15 },
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

    const toggleNeighborhoods = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showNeighborhoods.value = forceState ?? !showNeighborhoods.value;
        ensureNeighborhoods(map);
        setLayerVisibility(map, ['sofiaplan-neighborhoods-fill', 'sofiaplan-neighborhoods-outline', 'sofiaplan-neighborhoods-label'], showNeighborhoods.value);
    };

    // ── 4. CENSUS ADDRESSES (circle layer) ────────────────────────────────
    const showCensusAddresses = ref(false);

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

    const toggleCensusAddresses = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showCensusAddresses.value = forceState ?? !showCensusAddresses.value;
        ensureCensusAddresses(map);
        if (map.getLayer('sofiaplan-census-addresses-circle')) {
            map.setLayoutProperty('sofiaplan-census-addresses-circle', 'visibility', showCensusAddresses.value ? 'visible' : 'none');
        }
    };

    // ── 5. RESIDENTIAL TYPOLOGY GE (categorical) ─────────────────────────
    const showResidentialTypologyGe = ref(false);

    function ensureResidentialTypologyGe(map: MapLibreMap) {
        if (map.getSource('sofiaplan-residential-typology-ge')) return;

        map.addSource('sofiaplan-residential-typology-ge', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanResidentialTypologyGeTileUrlTemplate()],
            maxzoom: 14,
        });

        const typologyColorExpr: maplibregl.ExpressionSpecification = [
            'case',
            ['==', ['to-number', ['get', 'score'], 0], 1], '#f9c74f',
            ['==', ['to-number', ['get', 'score'], 0], 2], '#f94144',
            ['==', ['to-number', ['get', 'score'], 0], 3], '#4361ee',
            '#b0b0b0',
        ];

        map.addLayer({
            id: 'sofiaplan-residential-typology-ge-fill',
            type: 'fill',
            source: 'sofiaplan-residential-typology-ge',
            'source-layer': 'sofiaplan_residential_typology_ge_tiles',
            layout: { visibility: 'none' },
            paint: { 'fill-color': typologyColorExpr, 'fill-opacity': 0.8 },
        });

        map.addLayer({
            id: 'sofiaplan-residential-typology-ge-outline',
            type: 'line',
            source: 'sofiaplan-residential-typology-ge',
            'source-layer': 'sofiaplan_residential_typology_ge_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#2d2d2d', 'line-width': 0.6, 'line-opacity': 0.5 },
        });

        map.on('click', 'sofiaplan-residential-typology-ge-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const label = props.label || '';
            const district = props.district || '';
            const score = Number(props.score ?? 0);
            const singlePct = props.single_pct != null ? Number(props.single_pct).toFixed(1) : '\u2014';
            const multiPct = props.multi_pct != null ? Number(props.multi_pct).toFixed(1) : '\u2014';
            const panelPct = props.panel_pct != null ? Number(props.panel_pct).toFixed(1) : '\u2014';
            const typologyLabels: Record<number, string> = {
                1: '\u041D\u0438\u0441\u043A\u0430 \u0436\u0438\u043B\u0438\u0449\u043D\u0430 \u0437\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430',
                2: '\u041C\u043D\u043E\u0433\u043E\u0444\u0430\u043C\u0438\u043B\u043D\u0438 \u0441\u0433\u0440\u0430\u0434\u0438',
                3: '\u041F\u0430\u043D\u0435\u043B\u043D\u0430 \u0437\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430',
                0: '\u0421\u043C\u0435\u0441\u0435\u043D\u0430 / \u043D\u0435\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0430',
            };
            const typologyColors: Record<number, string> = {
                1: '#f9c74f', 2: '#f94144', 3: '#4361ee', 0: '#b0b0b0',
            };
            const typLabel = typologyLabels[score] ?? typologyLabels[0];
            const typColor = typologyColors[score] ?? typologyColors[0];
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 10px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        \uD83C\uDFD8\uFE0F \u0416\u0438\u043B\u0438\u0449\u043D\u0430 \u0442\u0438\u043F\u043E\u043B\u043E\u0433\u0438\u044F \u043F\u043E \u0413\u0415
                    </h3>
                    ${label ? `<div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px">${label}</div>` : ''}
                    ${district ? `<div style="font-size:11px;color:#64748b;margin-bottom:8px">${district}</div>` : ''}
                    <div style="display:inline-block;padding:4px 12px;border-radius:16px;background:${typColor}22;border:1px solid ${typColor}88;color:${typColor};font-size:13px;font-weight:600;margin-bottom:10px">
                        <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${typColor};margin-right:5px;vertical-align:middle"></span>
                        ${typLabel}
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
                        <div style="background:#fffbeb;padding:5px 6px;border-radius:6px;text-align:center;border-left:3px solid #f9c74f">
                            <div style="font-size:9px;color:#64748b;margin-bottom:2px">\u0415\u0434\u0438\u043D\u0438\u0447\u043D\u0438</div>
                            <div style="font-size:15px;font-weight:700;color:#c98d00">${singlePct}%</div>
                        </div>
                        <div style="background:#fff0f0;padding:5px 6px;border-radius:6px;text-align:center;border-left:3px solid #f94144">
                            <div style="font-size:9px;color:#64748b;margin-bottom:2px">\u041C\u043D\u043E\u0433\u043E\u0444\u0430\u043C.</div>
                            <div style="font-size:15px;font-weight:700;color:#c41230">${multiPct}%</div>
                        </div>
                        <div style="background:#eff1ff;padding:5px 6px;border-radius:6px;text-align:center;border-left:3px solid #4361ee">
                            <div style="font-size:9px;color:#64748b;margin-bottom:2px">\u041F\u0430\u043D\u0435\u043B\u043D\u0438</div>
                            <div style="font-size:15px;font-weight:700;color:#2b3fc7">${panelPct}%</div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:8px;font-size:11px;flex-wrap:wrap">
                        <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#f9c74f;margin-right:3px;vertical-align:middle"></span>\u041D\u0438\u0441\u043A\u0430</span>
                        <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#f94144;margin-right:3px;vertical-align:middle"></span>\u041C\u043D\u043E\u0433\u043E\u0444\u0430\u043C\u0438\u043B\u043D\u0430</span>
                        <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#4361ee;margin-right:3px;vertical-align:middle"></span>\u041F\u0430\u043D\u0435\u043B\u043D\u0430</span>
                        <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#b0b0b0;margin-right:3px;vertical-align:middle"></span>\u0421\u043C\u0435\u0441\u0435\u043D\u0430</span>
                    </div>
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-residential-typology-ge-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-residential-typology-ge-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleResidentialTypologyGe = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showResidentialTypologyGe.value = forceState ?? !showResidentialTypologyGe.value;
        ensureResidentialTypologyGe(map);
        setLayerVisibility(map, ['sofiaplan-residential-typology-ge-fill', 'sofiaplan-residential-typology-ge-outline'], showResidentialTypologyGe.value);
    };

    // ── 6. URBAN MORPHOLOGY GE (categorical) ─────────────────────────────
    const showUrbanMorphologyGe = ref(false);

    function ensureUrbanMorphologyGe(map: MapLibreMap) {
        if (map.getSource('sofiaplan-urban-morphology-ge')) return;

        map.addSource('sofiaplan-urban-morphology-ge', {
            type: 'vector',
            tiles: [TilesAPI.getSofiaPlanUrbanMorphologyGeTileUrlTemplate()],
            maxzoom: 14,
        });

        const morphologyColorExpr: maplibregl.ExpressionSpecification = [
            'case',
            ['==', ['to-number', ['get', 'score'], 0], 1], '#06d6a0',
            ['==', ['to-number', ['get', 'score'], 0], 2], '#f77f00',
            ['==', ['to-number', ['get', 'score'], 0], 3], '#118ab2',
            ['==', ['to-number', ['get', 'score'], 0], 4], '#9b2226',
            ['==', ['to-number', ['get', 'score'], 0], 5], '#c77dff',
            '#adb5bd',
        ];

        map.addLayer({
            id: 'sofiaplan-urban-morphology-ge-fill',
            type: 'fill',
            source: 'sofiaplan-urban-morphology-ge',
            'source-layer': 'sofiaplan_urban_morphology_ge_tiles',
            layout: { visibility: 'none' },
            paint: { 'fill-color': morphologyColorExpr, 'fill-opacity': 0.8 },
        });

        map.addLayer({
            id: 'sofiaplan-urban-morphology-ge-outline',
            type: 'line',
            source: 'sofiaplan-urban-morphology-ge',
            'source-layer': 'sofiaplan_urban_morphology_ge_tiles',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#2d2d2d', 'line-width': 0.6, 'line-opacity': 0.5 },
        });

        map.on('click', 'sofiaplan-urban-morphology-ge-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const label = props.label || '';
            const district = props.district || '';
            const score = Number(props.score ?? 0);
            const morphologyLabels: Record<number, string> = {
                1: '\u0412\u0438\u043B\u043D\u0430 \u0437\u043E\u043D\u0430',
                2: '\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u0430 \u0433\u0440\u0430\u0434\u0441\u043A\u0430 \u0441\u0440\u0435\u0434\u0430',
                3: '\u041F\u0430\u043D\u0435\u043B\u043D\u0438 \u043C\u0430\u0441\u0438\u0432\u0438',
                4: '\u0418\u043D\u0434\u0443\u0441\u0442\u0440\u0438\u0430\u043B\u043D\u0430 \u0437\u043E\u043D\u0430',
                5: '\u0421\u043C\u0435\u0441\u0435\u043D\u0430 \u0441\u0440\u0435\u0434\u0430',
                0: '\u041D\u0435\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0430',
            };
            const morphologyColors: Record<number, string> = {
                1: '#06d6a0', 2: '#f77f00', 3: '#118ab2', 4: '#9b2226', 5: '#c77dff', 0: '#adb5bd',
            };
            const morphLabel = morphologyLabels[score] ?? morphologyLabels[0];
            const morphColor = morphologyColors[score] ?? morphologyColors[0];
            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(popupWrap(`
                    <h3 style="margin:0 0 10px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
                        \uD83D\uDDFA\uFE0F \u0413\u0440\u0430\u0434\u0441\u043A\u0430 \u043C\u043E\u0440\u0444\u043E\u043B\u043E\u0433\u0438\u044F \u043F\u043E \u0413\u0415
                    </h3>
                    ${label ? `<div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px">${label}</div>` : ''}
                    ${district ? `<div style="font-size:11px;color:#64748b;margin-bottom:8px">${district}</div>` : ''}
                    <div style="display:inline-block;padding:4px 12px;border-radius:16px;background:${morphColor}22;border:1px solid ${morphColor}88;color:${morphColor};font-size:13px;font-weight:600;margin-bottom:12px">
                        <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${morphColor};margin-right:5px;vertical-align:middle"></span>
                        ${morphLabel}
                    </div>
                    <div style="display:flex;flex-direction:column;gap:5px;font-size:11px;color:#475569">
                        <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#06d6a0;margin-right:5px;vertical-align:middle"></span>\u0412\u0438\u043B\u043D\u0430 \u0437\u043E\u043D\u0430</span>
                        <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#f77f00;margin-right:5px;vertical-align:middle"></span>\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u0430 \u0433\u0440\u0430\u0434\u0441\u043A\u0430 \u0441\u0440\u0435\u0434\u0430</span>
                        <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#118ab2;margin-right:5px;vertical-align:middle"></span>\u041F\u0430\u043D\u0435\u043B\u043D\u0438 \u043C\u0430\u0441\u0438\u0432\u0438</span>
                        <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#9b2226;margin-right:5px;vertical-align:middle"></span>\u0418\u043D\u0434\u0443\u0441\u0442\u0440\u0438\u0430\u043B\u043D\u0430 \u0437\u043E\u043D\u0430</span>
                        <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#c77dff;margin-right:5px;vertical-align:middle"></span>\u0421\u043C\u0435\u0441\u0435\u043D\u0430 \u0441\u0440\u0435\u0434\u0430</span>
                        <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#adb5bd;margin-right:5px;vertical-align:middle"></span>\u041D\u0435\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0430</span>
                    </div>
                `))
                .addTo(map);
        });

        map.on('mouseenter', 'sofiaplan-urban-morphology-ge-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'sofiaplan-urban-morphology-ge-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleUrbanMorphologyGe = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        showUrbanMorphologyGe.value = forceState ?? !showUrbanMorphologyGe.value;
        ensureUrbanMorphologyGe(map);
        setLayerVisibility(map, ['sofiaplan-urban-morphology-ge-fill', 'sofiaplan-urban-morphology-ge-outline'], showUrbanMorphologyGe.value);
    };

    // ══════════════════════════════════════════════════════════════════════
    // COMPUTED
    // ══════════════════════════════════════════════════════════════════════
    const showAnySofiaPlan = computed(() =>
        showZoning.value || showPedestrianSyntax.value || showNeighborhoods.value ||
        showCensusAddresses.value || showResidentialTypologyGe.value || showUrbanMorphologyGe.value ||
        CHOROPLETH_LAYERS.some(def => layerState[def.key].show.value)
    );

    // ══════════════════════════════════════════════════════════════════════
    // MASTER TOGGLE
    // ══════════════════════════════════════════════════════════════════════
    function toggleAllSofiaPlan(map: MapLibreMap | null, forceState?: boolean) {
        const target = forceState ?? !showAnySofiaPlan.value;
        // Custom layers
        toggleZoning(map, target);
        togglePedestrianSyntax(map, target);
        toggleNeighborhoods(map, target);
        toggleCensusAddresses(map, target);
        toggleResidentialTypologyGe(map, target);
        toggleUrbanMorphologyGe(map, target);
        // Data-driven layers
        for (const def of CHOROPLETH_LAYERS) {
            layerState[def.key].toggle(map, target);
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // RETURN (exact same interface)
    // ══════════════════════════════════════════════════════════════════════
    return {
        showZoning, toggleZoning, activeZoningCategories, toggleZoningCategory,
        zoningCategoryItems: ALL_ZONING_CATEGORIES.map(cat => ({
            value: cat,
            label: cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            color: (ZONE_COLORS as Record<string, string>)[cat],
        })),
        showIncome: layerState.income.show, toggleIncome: layerState.income.toggle,
        showPropertyPrices: layerState.propertyPrices.show, togglePropertyPrices: layerState.propertyPrices.toggle,
        showMetroCatchments: layerState.metroCatchments.show, toggleMetroCatchments: layerState.metroCatchments.toggle,
        showPedestrianSyntax, togglePedestrianSyntax,
        pedestrianSyntaxThreshold, setPedestrianSyntaxThreshold,
        neighborhoodNames,
        selectedPedestrianNeighborhoods, selectPedestrianNeighborhood, clearPedestrianNeighborhoods,
        showSofiaPlanPopulation: layerState.sofiaPlanPopulation.show, toggleSofiaPlanPopulation: layerState.sofiaPlanPopulation.toggle,
        showBusinessTurnover: layerState.businessTurnover.show, toggleBusinessTurnover: layerState.businessTurnover.toggle,
        showDevelopmentPotential: layerState.developmentPotential.show, toggleDevelopmentPotential: layerState.developmentPotential.toggle,
        showZoningParams: layerState.zoningParams.show, toggleZoningParams: layerState.zoningParams.toggle,
        showNeighborhoods, toggleNeighborhoods,
        showCensusAddresses, toggleCensusAddresses,
        showDemographicForecast: layerState.demographicForecast.show, toggleDemographicForecast: layerState.demographicForecast.toggle,
        showDemographicForecastGe: layerState.demographicForecastGe.show, toggleDemographicForecastGe: layerState.demographicForecastGe.toggle,
        showPopulationPotential: layerState.populationPotential.show, togglePopulationPotential: layerState.populationPotential.toggle,
        showResidentialLoad: layerState.residentialLoad.show, toggleResidentialLoad: layerState.residentialLoad.toggle,
        showHealthServiceConcentration: layerState.healthServiceConcentration.show, toggleHealthServiceConcentration: layerState.healthServiceConcentration.toggle,
        showHealthInfrastructureConcentration: layerState.healthInfrastructureConcentration.show, toggleHealthInfrastructureConcentration: layerState.healthInfrastructureConcentration.toggle,
        showBuildingDensityGe: layerState.buildingDensityGe.show, toggleBuildingDensityGe: layerState.buildingDensityGe.toggle,
        showBuildingFootprintGe: layerState.buildingFootprintGe.show, toggleBuildingFootprintGe: layerState.buildingFootprintGe.toggle,
        showResidentialTypologyGe, toggleResidentialTypologyGe,
        showUrbanMorphologyGe, toggleUrbanMorphologyGe,
        showAnySofiaPlan,
        toggleAllSofiaPlan,
    };
}
