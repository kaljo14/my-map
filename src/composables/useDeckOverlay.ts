// deck.gl 9.2 uses this adapter for both MapLibre and Mapbox renderers.
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { Layer } from '@deck.gl/core';
import type { Map as MapLibreMap, IControl } from 'maplibre-gl';

interface OverlayState {
  overlay: MapboxOverlay;
  layerRegistry: Map<string, Layer[]>;
}

const overlays = new WeakMap<MapLibreMap, OverlayState>();

function flush({ overlay, layerRegistry }: OverlayState) {
  const all: Layer[] = [];
  for (const layers of layerRegistry.values()) {
    all.push(...layers);
  }
  overlay.setProps({ layers: all });
}

export function initDeckOverlay(map: MapLibreMap): MapboxOverlay {
  const existing = overlays.get(map);
  if (existing) return existing.overlay;
  const overlay = new MapboxOverlay({ interleaved: false });
  map.addControl(overlay as unknown as IControl);
  const state = { overlay, layerRegistry: new Map<string, Layer[]>() };
  overlays.set(map, state);
  // MapLibre removes/finalizes its controls when the map is destroyed.
  map.once('remove', () => {
    state.layerRegistry.clear();
    overlays.delete(map);
  });
  return overlay;
}

export function setDeckLayers(map: MapLibreMap, namespace: string, layers: Layer[]) {
  const state = overlays.get(map);
  if (!state) return;
  state.layerRegistry.set(namespace, layers);
  flush(state);
}

export function removeDeckLayers(map: MapLibreMap, namespace: string) {
  const state = overlays.get(map);
  if (!state) return;
  state.layerRegistry.delete(namespace);
  flush(state);
}
