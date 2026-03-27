import { ref, watch } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';

const CATEGORY_COLORS: Record<string, string> = {
    food:      '#f97316',
    retail:    '#8b5cf6',
    education: '#3b82f6',
    health:    '#ef4444',
    finance:   '#eab308',
    culture:   '#06b6d4',
    leisure:   '#22c55e',
    other:     '#94a3b8',
};

const CATEGORY_EMOJIS: Record<string, string> = {
    food:      'restaurant',
    retail:    'shopping_bag',
    education: 'school',
    health:    'local_hospital',
    finance:   'credit_card',
    culture:   'museum',
    leisure:   'park',
    other:     'location_on',
};

const GROCERY_SHOP_TYPES = ['supermarket', 'convenience', 'grocery', 'greengrocer', 'deli'];

const TYPE_EMOJIS: Record<string, string> = {
    restaurant:'restaurant', cafe:'local_cafe', bar:'local_bar', fast_food:'fastfood', pub:'sports_bar',
    pharmacy:'local_pharmacy', hospital:'local_hospital', dentist:'dentistry', clinic:'medical_services', doctors:'medical_services',
    bank:'account_balance', atm:'atm',
    school:'school', university:'school', library:'local_library', kindergarten:'child_care',
    supermarket:'shopping_cart', hairdresser:'content_cut', clothes:'checkroom', bakery:'bakery_dining', butcher:'set_meal', florist:'local_florist',
    museum:'museum', hotel:'hotel', attraction:'attractions',
    playground:'child_friendly', park:'park', fitness_centre:'fitness_center', sports_centre:'stadium', swimming_pool:'pool',
};

const LEGEND_ENTRIES = [
    { key: 'food',      label: 'Food & Drink' },
    { key: 'retail',    label: 'Retail' },
    { key: 'education', label: 'Education' },
    { key: 'health',    label: 'Health' },
    { key: 'finance',   label: 'Finance' },
    { key: 'culture',   label: 'Culture' },
    { key: 'leisure',   label: 'Leisure' },
    { key: 'other',     label: 'Other' },
];

function poiEmoji(p: Record<string, any>): string {
    const type = p.amenity || p.shop || p.tourism || p.leisure;
    return TYPE_EMOJIS[type] ?? CATEGORY_EMOJIS[p.category] ?? 'location_on';
}

function poiLabel(p: Record<string, any>): string {
    return p.name
        || p.amenity?.replace(/_/g, ' ')
        || p.shop?.replace(/_/g, ' ')
        || p.tourism?.replace(/_/g, ' ')
        || p.leisure?.replace(/_/g, ' ')
        || p.category || '—';
}

export function useOsmPois() {
    const showOsmPois = ref(false);
    const activeCategoryFilter = ref<string | null>(null);
    const areaPolygon = ref<[number, number][] | null>(null); // [lat, lng] pairs

    let activePopup: maplibregl.Popup | null = null;
    let legendContainer: HTMLElement | null = null;
    let mapRef: MapLibreMap | null = null;

    function applyFilter(map: MapLibreMap) {
        if (!map.getLayer('osm-pois-layer')) return;

        const baseFilters: maplibregl.ExpressionSpecification[] = [];
        if (activeCategoryFilter.value) {
            baseFilters.push(['==', ['get', 'category'], activeCategoryFilter.value]);
        }
        if (areaPolygon.value && areaPolygon.value.length >= 3) {
            const coords = [...areaPolygon.value, areaPolygon.value[0]!].map(([lat, lng]) => [lng, lat]);
            baseFilters.push(['within', { type: 'Polygon', coordinates: [coords] }] as maplibregl.ExpressionSpecification);
        }

        // Circle layer: always exclude grocery types
        const circleFilters: maplibregl.ExpressionSpecification[] = [
            ...baseFilters,
            ['!', ['in', ['get', 'shop'], ['literal', GROCERY_SHOP_TYPES]]],
        ];
        map.setFilter('osm-pois-layer', ['all', ...circleFilters]);

        // Grocery icon layer: only grocery types, same area/category filters
        if (map.getLayer('osm-grocery-layer')) {
            const groceryFilters: maplibregl.ExpressionSpecification[] = [
                ...baseFilters,
                ['in', ['get', 'shop'], ['literal', GROCERY_SHOP_TYPES]],
            ];
            map.setFilter('osm-grocery-layer', ['all', ...groceryFilters]);
        }
    }

    function setAreaPolygon(polygon: [number, number][] | null, map: MapLibreMap | null) {
        areaPolygon.value = polygon;
        const m = map ?? mapRef;
        if (m) applyFilter(m);
    }

    // ── Legend (Vue overlay) ─────────────────────────────────────────────────
    // Legend is mounted as a DOM element injected into the map container.

    function buildLegendElement(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'poi-legend maplibregl-ctrl';

        const rows = LEGEND_ENTRIES.map(e => `
            <div class="poi-legend-row" data-key="${e.key}" title="Filter to ${e.label}">
                <span class="material-symbols-outlined poi-legend-emoji">${CATEGORY_EMOJIS[e.key]}</span>
                <span class="poi-legend-dot" style="background:${CATEGORY_COLORS[e.key] ?? '#94a3b8'}"></span>
                <span class="poi-legend-label">${e.label}</span>
            </div>
        `).join('');

        div.innerHTML = `
            <div class="poi-legend-title">OSM POIs</div>
            ${rows}
            <div class="poi-legend-clear" style="display:none"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">close</span> Show all</div>
        `;

        div.querySelectorAll<HTMLElement>('.poi-legend-row').forEach(row => {
            row.addEventListener('click', e => {
                e.stopPropagation();
                const key = row.dataset.key!;
                activeCategoryFilter.value = activeCategoryFilter.value === key ? null : key;
                updateLegendState(div);
            });
        });

        div.querySelector<HTMLElement>('.poi-legend-clear')!.addEventListener('click', e => {
            e.stopPropagation();
            activeCategoryFilter.value = null;
            updateLegendState(div);
        });

        div.addEventListener('click', e => e.stopPropagation());
        return div;
    }

    function updateLegendState(container: HTMLElement) {
        const clearBtn = container.querySelector<HTMLElement>('.poi-legend-clear');
        container.querySelectorAll<HTMLElement>('.poi-legend-row').forEach(row => {
            const key = row.dataset.key;
            row.classList.toggle('dimmed', activeCategoryFilter.value !== null && key !== activeCategoryFilter.value);
        });
        if (clearBtn) clearBtn.style.display = activeCategoryFilter.value ? 'block' : 'none';
    }

    // ── Layer ────────────────────────────────────────────────────────────────

    function buildCategoryColorExpression(): maplibregl.ExpressionSpecification {
        return [
            'match', ['get', 'category'],
            'food',      CATEGORY_COLORS.food!,
            'retail',    CATEGORY_COLORS.retail!,
            'education', CATEGORY_COLORS.education!,
            'health',    CATEGORY_COLORS.health!,
            'finance',   CATEGORY_COLORS.finance!,
            'culture',   CATEGORY_COLORS.culture!,
            'leisure',   CATEGORY_COLORS.leisure!,
            CATEGORY_COLORS.other!,
        ];
    }

    function ensureLayer(map: MapLibreMap) {
        mapRef = map;
        if (map.getSource('osm-pois')) return;

        const tileUrl = TilesAPI.getOsmPoisTileUrlTemplate();
        map.addSource('osm-pois', {
            type: 'vector',
            tiles: [tileUrl],
            minzoom: 10,
            maxzoom: 16,
        });

        map.addLayer({
            id: 'osm-pois-layer',
            type: 'circle',
            source: 'osm-pois',
            'source-layer': 'osm_pois',
            layout: { visibility: 'none' },
            paint: {
                'circle-color': buildCategoryColorExpression(),
                'circle-radius': [
                    'interpolate', ['linear'], ['zoom'],
                    10, 2,
                    13, 3,
                    15, 4,
                ],
                'circle-opacity': 0.85,
                'circle-stroke-color': '#fff',
                'circle-stroke-width': 1,
            },
        });

        map.addLayer({
            id: 'osm-grocery-layer',
            type: 'symbol',
            source: 'osm-pois',
            'source-layer': 'osm_pois',
            filter: ['in', ['get', 'shop'], ['literal', GROCERY_SHOP_TYPES]],
            layout: {
                visibility: 'none',
                'text-field': '🛒',
                'text-size': 18,
                'text-allow-overlap': false,
                'text-ignore-placement': false,
            },
        });

        map.on('click', 'osm-pois-layer', (e) => {
            const p = e.features?.[0]?.properties ?? {};
            const emoji = poiEmoji(p);
            const label = poiLabel(p);
            const color = CATEGORY_COLORS[p.category] ?? CATEGORY_COLORS.other!;
            const cat = (p.category ?? 'other').replace(/_/g, ' ');

            const tagEntries: Array<{ key: string; value: string }> = [];
            for (const key of ['amenity', 'shop', 'tourism', 'leisure'] as const) {
                if (p[key]) tagEntries.push({ key, value: p[key].replace(/_/g, ' ') });
            }
            const chips = tagEntries.map(({ key, value }) => `
                <span style="display:inline-flex;align-items:center;gap:3px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:2px 6px;font-size:10px;color:#475569;white-space:nowrap">
                    <span style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em">${key}</span>
                    <span style="color:#1e293b">${value}</span>
                </span>
            `).join('');

            const osmUrl = `https://www.openstreetmap.org/?mlat=${e.lngLat.lat.toFixed(6)}&mlon=${e.lngLat.lng.toFixed(6)}&zoom=19`;

            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '260px' })
                .setLngLat(e.lngLat)
                .setHTML(`
                    <div style="font-family:system-ui,sans-serif;padding:2px 0;min-width:180px">
                        <div style="margin-bottom:5px;line-height:1"><span class="material-symbols-outlined" style="font-size:28px;color:#475569">${emoji}</span></div>
                        <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:#1a1a1a;line-height:1.3">${label}</div>
                        ${chips ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">${chips}</div>` : ''}
                        <div style="display:flex;align-items:center;gap:5px;padding-top:7px;border-top:1px solid #e2e8f0">
                            <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block"></span>
                            <span style="font-size:11px;color:#64748b;text-transform:capitalize">${cat}</span>
                            <a href="${osmUrl}" target="_blank" rel="noopener" style="margin-left:auto;font-size:10px;color:#3b82f6;text-decoration:none;white-space:nowrap">OSM ↗</a>
                        </div>
                    </div>
                `)
                .addTo(map);
        });

        map.on('mouseenter', 'osm-pois-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'osm-pois-layer', () => { map.getCanvas().style.cursor = ''; });

        // Sync legend category filter + area polygon → MapLibre layer filter
        watch(activeCategoryFilter, () => applyFilter(map));
    }

    function attachLegend(map: MapLibreMap) {
        if (legendContainer) return;
        legendContainer = buildLegendElement();
        // Position it in the bottom-right corner of the map container
        const mapEl = map.getContainer();
        mapEl.appendChild(legendContainer);
    }

    function detachLegend() {
        legendContainer?.remove();
        legendContainer = null;
        activeCategoryFilter.value = null;
    }

    const toggleOsmPois = (map: MapLibreMap | null) => {
        if (!map) return;
        showOsmPois.value = !showOsmPois.value;

        if (showOsmPois.value) {
            ensureLayer(map);
            map.setLayoutProperty('osm-pois-layer', 'visibility', 'visible');
            map.setLayoutProperty('osm-grocery-layer', 'visibility', 'visible');
            attachLegend(map);
        } else {
            if (map.getLayer('osm-pois-layer')) {
                map.setLayoutProperty('osm-pois-layer', 'visibility', 'none');
            }
            if (map.getLayer('osm-grocery-layer')) {
                map.setLayoutProperty('osm-grocery-layer', 'visibility', 'none');
            }
            detachLegend();
        }
    };

    return {
        showOsmPois,
        toggleOsmPois,
        setAreaPolygon,
    };
}
