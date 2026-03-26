import { ref } from 'vue';
import L from 'leaflet';
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
    food:      '🍽️',
    retail:    '🛍️',
    education: '🎓',
    health:    '🏥',
    finance:   '💳',
    culture:   '🏛️',
    leisure:   '🌳',
    other:     '📍',
};

const TYPE_EMOJIS: Record<string, string> = {
    // food
    restaurant:     '🍽️',
    cafe:           '☕',
    bar:            '🍺',
    fast_food:      '🍔',
    pub:            '🍻',
    // health
    pharmacy:       '💊',
    hospital:       '🏥',
    dentist:        '🦷',
    clinic:         '🩺',
    doctors:        '🩺',
    // finance
    bank:           '🏦',
    atm:            '💳',
    // education
    school:         '🏫',
    university:     '🎓',
    library:        '📚',
    kindergarten:   '🧒',
    // retail
    supermarket:    '🛒',
    hairdresser:    '✂️',
    clothes:        '👗',
    bakery:         '🥐',
    butcher:        '🥩',
    florist:        '💐',
    // tourism
    museum:         '🏛️',
    hotel:          '🏨',
    attraction:     '📍',
    // leisure
    playground:     '🛝',
    park:           '🌳',
    fitness_centre: '🏋️',
    sports_centre:  '🏟️',
    swimming_pool:  '🏊',
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

function categoryColor(cat: string): string {
    return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other!;
}

function poiEmoji(p: any): string {
    const type = p.amenity || p.shop || p.tourism || p.leisure;
    return TYPE_EMOJIS[type] ?? CATEGORY_EMOJIS[p.category] ?? '📍';
}

function poiLabel(p: any): string {
    return p.name
        || p.amenity?.replace(/_/g, ' ')
        || p.shop?.replace(/_/g, ' ')
        || p.tourism?.replace(/_/g, ' ')
        || p.leisure?.replace(/_/g, ' ')
        || p.category
        || '—';
}

function poiSubtitle(p: any): string {
    const type = p.amenity || p.shop || p.tourism || p.leisure;
    if (!type || type === p.name) return p.category ?? '';
    return type.replace(/_/g, ' ');
}

export function useOsmPois() {
    const showOsmPois = ref(false);
    const activeCategoryFilter = ref<string | null>(null);

    let poisLayer: any = null;
    let legendControl: L.Control | null = null;
    let mapRef: any = null;
    let currentZoom = 13;
    let zoomEndHandler: (() => void) | null = null;

    // ── Legend ───────────────────────────────────────────────────────────────

    function updateLegendActiveState(container: HTMLElement) {
        const clearBtn = container.querySelector('.poi-legend-clear') as HTMLElement | null;
        container.querySelectorAll<HTMLElement>('.poi-legend-row').forEach(row => {
            const key = row.dataset.key;
            if (activeCategoryFilter.value === null || key === activeCategoryFilter.value) {
                row.classList.remove('dimmed');
            } else {
                row.classList.add('dimmed');
            }
        });
        if (clearBtn) {
            clearBtn.style.display = activeCategoryFilter.value ? 'block' : 'none';
        }
    }

    function buildLegend(): L.Control {
        const control = new L.Control({ position: 'bottomright' });
        control.onAdd = () => {
            const div = L.DomUtil.create('div', 'poi-legend');
            const rows = LEGEND_ENTRIES.map(e => `
                <div class="poi-legend-row" data-key="${e.key}" title="Filter to ${e.label}">
                    <span class="poi-legend-emoji">${CATEGORY_EMOJIS[e.key]}</span>
                    <span class="poi-legend-dot" style="background:${categoryColor(e.key)}"></span>
                    <span class="poi-legend-label">${e.label}</span>
                </div>
            `).join('');
            div.innerHTML = `
                <div class="poi-legend-title">OSM POIs</div>
                ${rows}
                <div class="poi-legend-clear" style="display:none">✕ Show all</div>
            `;

            div.querySelectorAll<HTMLElement>('.poi-legend-row').forEach(row => {
                row.addEventListener('click', e => {
                    e.stopPropagation();
                    const key = row.dataset.key!;
                    activeCategoryFilter.value = activeCategoryFilter.value === key ? null : key;
                    updateLegendActiveState(div);
                    if (poisLayer) poisLayer.redraw();
                });
            });

            const clearBtn = div.querySelector<HTMLElement>('.poi-legend-clear')!;
            clearBtn.addEventListener('click', e => {
                e.stopPropagation();
                activeCategoryFilter.value = null;
                updateLegendActiveState(div);
                if (poisLayer) poisLayer.redraw();
            });

            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        return control;
    }

    // ── Layer ────────────────────────────────────────────────────────────────

    function buildLayer(mapInstance: any): any {
        currentZoom = mapInstance.getZoom();

        const tileUrl = TilesAPI.getOsmPoisTileUrlTemplate();
        const layer = (L as any).vectorGrid.protobuf(tileUrl, {
            rendererFactory: (L as any).svg.tile,
            pane: 'overlayPane',
            vectorTileLayerStyles: {
                osm_pois(properties: any) {
                    const cat = properties.category ?? 'other';
                    if (activeCategoryFilter.value !== null && activeCategoryFilter.value !== cat) {
                        return { radius: 1, fill: false, stroke: false, opacity: 0, fillOpacity: 0 };
                    }
                    const color = categoryColor(cat);
                    const radius = currentZoom >= 15 ? 4 : currentZoom >= 13 ? 3 : 2;
                    return {
                        fill: true,
                        fillColor: color,
                        fillOpacity: 0.85,
                        radius,
                        stroke: true,
                        color: '#ffffff',
                        weight: 1,
                        opacity: 1,
                    };
                },
            },
            interactive: true,
            getFeatureId: (f: any) => f.properties.osm_id ?? Math.random(),
            minZoom: 10,
            maxNativeZoom: 16,
        });

        // Leaflet 1.9 _fireDOMEvent checks `target.getLatLng` to decide if the target is a
        // "marker" and then calls target.getLatLng() to get the latlng. PointSymbolizer extends
        // L.CircleMarker (which has getLatLng) but never sets _latlng — it uses pixel _point
        // instead. This causes latLngToContainerPoint(undefined) to throw on every POI click.
        // Fix: shadow getLatLng with undefined on each PointSymbolizer instance so Leaflet falls
        // back to mouseEventToContainerPoint(e) which correctly uses the cursor position.
        const _origCreateLayer = layer._createLayer;
        layer._createLayer = function(feat: any, pxPerExtent: any) {
            const symbolizer = _origCreateLayer.call(this, feat, pxPerExtent);
            if (feat.type === 1) {
                symbolizer.getLatLng = undefined;
            }
            return symbolizer;
        };

        layer.on('click', (e: any) => {
            if (e.originalEvent) e.originalEvent.stopPropagation();
            if (!e.latlng) return;
            const p = e.layer.properties;
            const emoji = poiEmoji(p);
            const label = poiLabel(p);
            const color = categoryColor(p.category ?? 'other');
            const cat = (p.category ?? 'other').replace(/_/g, ' ');

            // Build tag chips for every non-null OSM key
            const tagEntries: Array<{ key: string; value: string }> = [];
            for (const key of ['amenity', 'shop', 'tourism', 'leisure'] as const) {
                if (p[key]) tagEntries.push({ key, value: p[key].replace(/_/g, ' ') });
            }
            const chips = tagEntries.map(({ key, value }) => `
                <span style="
                    display:inline-flex;align-items:center;gap:3px;
                    background:#f1f5f9;border:1px solid #e2e8f0;
                    border-radius:4px;padding:2px 6px;
                    font-size:10px;color:#475569;white-space:nowrap
                ">
                    <span style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em">${key}</span>
                    <span style="color:#1e293b">${value}</span>
                </span>
            `).join('');

            const latlng = L.latLng(e.latlng.lat, e.latlng.lng);
            const osmUrl = `https://www.openstreetmap.org/?mlat=${latlng.lat.toFixed(6)}&mlon=${latlng.lng.toFixed(6)}&zoom=19`;

            L.popup({ maxWidth: 240 })
                .setLatLng(latlng)
                .setContent(`
                    <div style="font-family:system-ui,sans-serif;padding:2px 0;min-width:180px">
                        <div style="font-size:24px;margin-bottom:5px;line-height:1">${emoji}</div>
                        <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:#1a1a1a;line-height:1.3">${label}</div>
                        ${chips ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">${chips}</div>` : ''}
                        <div style="display:flex;align-items:center;gap:5px;padding-top:7px;border-top:1px solid #e2e8f0">
                            <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block"></span>
                            <span style="font-size:11px;color:#64748b;text-transform:capitalize">${cat}</span>
                            <a href="${osmUrl}" target="_blank" rel="noopener"
                               style="margin-left:auto;font-size:10px;color:#3b82f6;text-decoration:none;white-space:nowrap">
                                OSM ↗
                            </a>
                        </div>
                    </div>
                `)
                .openOn(mapInstance);
        });

        layer.on('tileerror', () => {
            // Expected for tiles outside Sofia coverage — suppress
        });

        zoomEndHandler = () => {
            currentZoom = mapInstance.getZoom();
            layer.redraw();
        };
        mapInstance.on('zoomend', zoomEndHandler);

        return layer;
    }

    function attachLayer(mapInstance: any) {
        mapRef = mapInstance;
        poisLayer = buildLayer(mapInstance);
        poisLayer.addTo(mapInstance);

        if (!legendControl) {
            legendControl = buildLegend();
        }
        legendControl.addTo(mapInstance);
    }

    function detachLayer() {
        if (poisLayer) {
            poisLayer.remove();
            poisLayer = null;
        }
        if (legendControl) {
            legendControl.remove();
            legendControl = null;
        }
        if (mapRef && zoomEndHandler) {
            mapRef.off('zoomend', zoomEndHandler);
            zoomEndHandler = null;
        }
        activeCategoryFilter.value = null;
        mapRef = null;
    }

    // ── Public API ───────────────────────────────────────────────────────────

    function toggleOsmPois(mapInstance: any) {
        if (!mapInstance) return;
        showOsmPois.value = !showOsmPois.value;

        if (showOsmPois.value) {
            attachLayer(mapInstance);
        } else {
            detachLayer();
        }
    }

    return {
        showOsmPois,
        toggleOsmPois,
    };
}
