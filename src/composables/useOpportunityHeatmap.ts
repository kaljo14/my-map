import { ref } from 'vue';
import L from 'leaflet';
import TilesAPI from '@/api/tiles';

export type HeatmapCategory = 'barbershop' | 'gym';

// Three-stop diverging ramp: dark blue (low) → yellow (mid) → dark red (high)
const COLOR_STOPS = [
    { t: 0,   r: 0x31, g: 0x36, b: 0x95 },
    { t: 50,  r: 0xff, g: 0xff, b: 0xbf },
    { t: 100, r: 0xa5, g: 0x00, b: 0x26 },
];

function scoreToColor(score: number): string {
    const s = Math.max(0, Math.min(100, score));

    let lo = COLOR_STOPS[0]!;
    let hi = COLOR_STOPS[COLOR_STOPS.length - 1]!;
    for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
        if (s >= COLOR_STOPS[i]!.t && s <= COLOR_STOPS[i + 1]!.t) {
            lo = COLOR_STOPS[i]!;
            hi = COLOR_STOPS[i + 1]!;
            break;
        }
    }

    const t = (s - lo.t) / (hi.t - lo.t);
    const r = Math.round(lo.r + (hi.r - lo.r) * t);
    const g = Math.round(lo.g + (hi.g - lo.g) * t);
    const b = Math.round(lo.b + (hi.b - lo.b) * t);
    return `rgb(${r},${g},${b})`;
}

export function useOpportunityHeatmap() {
    const showOpportunityHeatmap = ref(false);
    const activeCategory = ref<HeatmapCategory>('barbershop');

    let heatmapLayer: any = null;
    let legendControl: L.Control | null = null;

    // ── Legend ───────────────────────────────────────────────────────────────

    function buildLegend(): L.Control {
        const control = L.control({ position: 'bottomright' });
        control.onAdd = () => {
            const div = L.DomUtil.create('div', 'opportunity-legend');
            div.innerHTML = `
                <div class="opp-legend-title">Opportunity Score</div>
                <div class="opp-legend-gradient"></div>
                <div class="opp-legend-labels">
                    <span>Low</span>
                    <span>Med</span>
                    <span>High</span>
                </div>
            `;
            return div;
        };
        return control;
    }

    // ── Layer ────────────────────────────────────────────────────────────────

    function buildLayer(mapInstance: any): any {
        const tileUrl = TilesAPI.getOpportunityHeatmapTileUrlTemplate();
        const category = activeCategory.value;

        const layer = (L as any).vectorGrid.protobuf(tileUrl, {
            pane: 'overlayPane',
            vectorTileLayerStyles: {
                opportunity_heatmap(properties: any) {
                    if (properties.category !== category) {
                        return { fill: false, weight: 0, stroke: false };
                    }
                    return {
                        fill: true,
                        fillColor: scoreToColor(properties.score ?? 0),
                        fillOpacity: 0.7,
                        weight: 0,
                        stroke: false,
                    };
                },
            },
            interactive: true,
            getFeatureId: (f: any) =>
                `${f.properties.category}_${f.properties.score}_${Math.random()}`,
            maxNativeZoom: 14,
        });

        layer.on('click', (e: any) => {
            const { category: cat, score } = e.layer.properties;
            L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                    <div style="font-family: system-ui, sans-serif; min-width: 180px;">
                        <div style="font-weight: 700; margin-bottom: 8px; font-size: 15px;">
                            ${cat === 'barbershop' ? '✂️ Barbershop' : '🏋️ Gym'} Zone
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px;">
                            <div><span style="color: #64748b;">Category:</span> <strong>${cat}</strong></div>
                            <div>
                                <span style="color: #64748b;">Opportunity score:</span>
                                <strong style="color: ${scoreToColor(score ?? 0)}">
                                    ${Number(score ?? 0).toFixed(1)}/100
                                </strong>
                            </div>
                        </div>
                        <div style="margin-top: 10px; height: 8px; border-radius: 4px;
                             background: linear-gradient(to right, #313695, #ffffbf, #a50026);">
                        </div>
                        <div style="display: flex; justify-content: space-between;
                             font-size: 10px; color: #94a3b8; margin-top: 2px;">
                            <span>Low</span><span>Medium</span><span>High</span>
                        </div>
                    </div>
                `)
                .openOn(mapInstance);
        });

        return layer;
    }

    function attachLayer(mapInstance: any) {
        heatmapLayer = buildLayer(mapInstance);
        heatmapLayer.addTo(mapInstance);

        if (!legendControl) {
            legendControl = buildLegend();
        }
        legendControl.addTo(mapInstance);
    }

    function detachLayer() {
        if (heatmapLayer) {
            heatmapLayer.remove();
            heatmapLayer = null;
        }
        if (legendControl) {
            legendControl.remove();
            legendControl = null;
        }
    }

    // ── Public API ───────────────────────────────────────────────────────────

    function toggleOpportunityHeatmap(mapInstance: any) {
        if (!mapInstance) return;
        showOpportunityHeatmap.value = !showOpportunityHeatmap.value;

        if (showOpportunityHeatmap.value) {
            attachLayer(mapInstance);
        } else {
            detachLayer();
        }
    }

    function setHeatmapCategory(category: HeatmapCategory, mapInstance: any) {
        if (activeCategory.value === category) return;
        activeCategory.value = category;

        // Rebuild the layer so the new filter/colours take effect immediately
        if (showOpportunityHeatmap.value && mapInstance) {
            heatmapLayer?.remove();
            heatmapLayer = buildLayer(mapInstance);
            heatmapLayer.addTo(mapInstance);
        }
    }

    return {
        showOpportunityHeatmap,
        activeCategory,
        toggleOpportunityHeatmap,
        setHeatmapCategory,
    };
}
