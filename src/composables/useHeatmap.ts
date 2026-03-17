import { ref } from 'vue';
import L from 'leaflet';
import TilesAPI from '@/api/tiles';

const interpolateColor = (a: string, b: string, t: number): string => {
    const ca = parseInt(a.slice(1), 16);
    const cb = parseInt(b.slice(1), 16);
    const r = Math.round(((ca >> 16) & 0xFF) * (1 - t) + ((cb >> 16) & 0xFF) * t);
    const g = Math.round(((ca >> 8) & 0xFF) * (1 - t) + ((cb >> 8) & 0xFF) * t);
    const bv = Math.round((ca & 0xFF) * (1 - t) + (cb & 0xFF) * t);
    return `rgb(${r},${g},${bv})`;
};

const scoreToColor = (score: number): string => {
    if (score <= -300) return '#d73027';
    if (score >= 300) return '#1a9850';
    if (score < 0) return interpolateColor('#d73027', '#fee08b', (score + 300) / 300);
    return interpolateColor('#fee08b', '#1a9850', score / 300);
};

export function useHeatmap() {
    const showHeatmap = ref(false);
    let heatmapLayer: any = null;

    const toggleHeatmap = (map: any) => {
        showHeatmap.value = !showHeatmap.value;
        if (!map) return;

        if (showHeatmap.value) {
            if (!heatmapLayer) {
                const tileUrl = `/api/martin/opportunity_heatmap/{z}/{x}/{y}.pbf`;
                const headers = TilesAPI.getAuthHeaders();

                heatmapLayer = (L as any).vectorGrid.protobuf(tileUrl, {
                    pane: 'overlayPane',
                    vectorTileLayerStyles: {
                        opportunity_heatmap: (properties: any) => {
                            if (properties.category !== 'barbershop') {
                                return { radius: 0, fillOpacity: 0, stroke: false };
                            }
                            return {
                                radius: 18,
                                fillColor: scoreToColor(properties.score || 0),
                                fillOpacity: 0.55,
                                stroke: false,
                            };
                        },
                    },
                    interactive: false,
                    fetchOptions: { headers },
                    maxNativeZoom: 14,
                });
            }
            heatmapLayer.addTo(map);
        } else {
            if (heatmapLayer && map.hasLayer(heatmapLayer)) {
                heatmapLayer.remove();
            }
        }
    };

    return {
        showHeatmap,
        toggleHeatmap,
    };
}
