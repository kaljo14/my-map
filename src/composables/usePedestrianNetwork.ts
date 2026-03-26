import { ref } from 'vue';
import L from 'leaflet';
import TilesAPI from '@/api/tiles';

// walk_score ramp: red (0) → yellow (50) → green (100)
const COLOR_STOPS = [
    { t: 0,   r: 0xd7, g: 0x30, b: 0x27 }, // #d73027
    { t: 50,  r: 0xfe, g: 0xe0, b: 0x8b }, // #fee08b
    { t: 100, r: 0x1a, g: 0x98, b: 0x50 }, // #1a9850
];

function walkScoreToColor(score: number): string {
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

export function usePedestrianNetwork() {
    const showPedestrianNetwork = ref(false);

    let networkLayer: any = null;
    let legendControl: L.Control | null = null;

    // ── Legend ───────────────────────────────────────────────────────────────

    function buildLegend(): L.Control {
        const control = new L.Control({ position: 'bottomright' });
        control.onAdd = () => {
            const div = L.DomUtil.create('div', 'walk-legend');
            div.innerHTML = `
                <div class="walk-legend-title">Walk Score</div>
                <div class="walk-legend-gradient"></div>
                <div class="walk-legend-labels">
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
        const tileUrl = TilesAPI.getOsmEdgesTileUrlTemplate();

        const layer = (L as any).vectorGrid.protobuf(tileUrl, {
            pane: 'overlayPane',
            vectorTileLayerStyles: {
                osm_edges(properties: any) {
                    const score = properties.walk_score ?? 0;
                    return {
                        stroke: true,
                        color: walkScoreToColor(score),
                        weight: 2,
                        opacity: 0.85,
                        fill: false,
                    };
                },
            },
            interactive: true,
            getFeatureId: (f: any) => f.properties.osm_way_id,
            minZoom: 12,
            maxNativeZoom: 16,
        });

        layer.on('click', (e: any) => {
            const { walk_score, highway } = e.layer.properties;
            const score = Number(walk_score ?? 0);
            L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                    <div style="font-family: system-ui, sans-serif; min-width: 180px;">
                        <div style="font-weight: 700; margin-bottom: 8px; font-size: 15px;">
                            🚶 Pedestrian Street
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px;">
                            <div><span style="color: #64748b;">Type:</span> <strong>${highway ?? '—'}</strong></div>
                            <div>
                                <span style="color: #64748b;">Walk score:</span>
                                <strong style="color: ${walkScoreToColor(score)}">
                                    ${score.toFixed(1)}/100
                                </strong>
                            </div>
                        </div>
                        <div style="margin-top: 10px; height: 8px; border-radius: 4px;
                             background: linear-gradient(to right, #d73027, #fee08b, #1a9850);">
                        </div>
                        <div style="display: flex; justify-content: space-between;
                             font-size: 10px; color: #94a3b8; margin-top: 2px;">
                            <span>Low</span><span>Medium</span><span>High</span>
                        </div>
                    </div>
                `)
                .openOn(mapInstance);
        });

        layer.on('tileerror', () => {
            // Expected for tiles outside the Sofia coverage area — suppress
        });

        return layer;
    }

    function attachLayer(mapInstance: any) {
        networkLayer = buildLayer(mapInstance);
        networkLayer.addTo(mapInstance);

        if (!legendControl) {
            legendControl = buildLegend();
        }
        legendControl.addTo(mapInstance);
    }

    function detachLayer() {
        if (networkLayer) {
            networkLayer.remove();
            networkLayer = null;
        }
        if (legendControl) {
            legendControl.remove();
            legendControl = null;
        }
    }

    // ── Public API ───────────────────────────────────────────────────────────

    function togglePedestrianNetwork(mapInstance: any) {
        if (!mapInstance) return;
        showPedestrianNetwork.value = !showPedestrianNetwork.value;

        if (showPedestrianNetwork.value) {
            attachLayer(mapInstance);
        } else {
            detachLayer();
        }
    }

    return {
        showPedestrianNetwork,
        togglePedestrianNetwork,
    };
}
