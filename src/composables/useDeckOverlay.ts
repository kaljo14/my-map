import { MapboxOverlay } from '@deck.gl/mapbox';
import type { Layer } from '@deck.gl/core';
import type { Map as MapLibreMap, IControl } from 'maplibre-gl';

let overlay: MapboxOverlay | null = null;
const layerRegistry = new Map<string, Layer[]>();

function flush() {
  if (!overlay) return;
  const all: Layer[] = [];
  for (const layers of layerRegistry.values()) {
    all.push(...layers);
  }
  overlay.setProps({ layers: all });
}

export function initDeckOverlay(map: MapLibreMap): MapboxOverlay {
  if (overlay) return overlay;
  overlay = new MapboxOverlay({ interleaved: false });
  map.addControl(overlay as unknown as IControl);
  return overlay;
}

export function setDeckLayers(namespace: string, layers: Layer[]) {
  layerRegistry.set(namespace, layers);
  flush();
}

export function removeDeckLayers(namespace: string) {
  layerRegistry.delete(namespace);
  flush();
}
