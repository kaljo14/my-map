import type { Ref } from 'vue';
import type { Map as MapLibreMap } from 'maplibre-gl';

// ── Shared popup / legend helpers ────────────────────────────────────────────

export function popupWrap(content: string): string {
    return `<div style="font-family:system-ui,sans-serif;min-width:200px;color:#0f172a">${content}</div>`;
}

export function gradientBar(css: string, labels: string[]): string {
    return `
        <div style="margin-top:10px;height:7px;border-radius:4px;background:${css}"></div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-top:3px">
            ${labels.map(l => `<span>${l}</span>`).join('')}
        </div>`;
}

export function popupHeader(icon: string, title: string): string {
    return `<h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;font-size:15px;color:#1e293b">
        <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">${icon}</span>${title}
    </h3>`;
}

// ── Layer visibility helper ──────────────────────────────────────────────────

export function setLayerVisibility(map: MapLibreMap, layerIds: string[], visible: boolean): void {
    const v = visible ? 'visible' : 'none';
    layerIds.forEach(id => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v); });
}

// ── Toggle factory ───────────────────────────────────────────────────────────

export function createLayerToggle(
    visibilityRef: Ref<boolean>,
    layerIds: string[],
    ensureFn: (map: MapLibreMap) => void,
): (map: MapLibreMap | null, forceState?: boolean) => void {
    return (map, forceState) => {
        if (!map) return;
        visibilityRef.value = forceState ?? !visibilityRef.value;
        ensureFn(map);
        setLayerVisibility(map, layerIds, visibilityRef.value);
    };
}
