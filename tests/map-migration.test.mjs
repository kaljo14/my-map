import { register } from 'node:module';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mock, test } from 'node:test';
import { createRenderer, effectScope, nextTick, reactive, ref, shallowRef } from 'vue';

register('./source-loader.mjs', import.meta.url);

class FakeMap extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.style = options.style;
    this.center = { lng: options.center[0], lat: options.center[1] };
    this.zoom = options.zoom;
    this.controls = [];
    this.removed = false;
    this.jumps = 0;
    queueMicrotask(() => this.emit('load'));
  }
  addControl(control) { this.controls.push(control); }
  getCenter() { return this.center; }
  getZoom() { return this.zoom; }
  getBounds() { return { getWest: () => 23, getSouth: () => 42, getEast: () => 24, getNorth: () => 43 }; }
  jumpTo({ center, zoom }) { this.center = { lng: center[0], lat: center[1] }; this.zoom = zoom; this.jumps++; }
  easeTo(options) { this.jumpTo(options); }
  setStyle(url, { transformStyle }) { this.style = transformStyle(this.style, darkStyle); }
  getSource(id) { return this.style.sources[id]; }
  addSource(id, source) { this.style.sources[id] = { ...source, setData(data) { this.data = data; } }; }
  addLayer(layer) { this.style.layers.push(layer); }
  remove() { this.removed = true; this.emit('remove'); this.removeAllListeners(); }
  resize() {}
}
class FakeOverlay {
  constructor(props) { this.props = props; }
  setProps(props) { Object.assign(this.props, props); }
}
class FakeObserver {
  static instances = [];
  constructor() { FakeObserver.instances.push(this); this.disconnected = false; }
  observe() {}
  disconnect() { this.disconnected = true; }
}

const route = reactive({ query: { lat: '42.7', lng: '23.3', zoom: '12.75' } });
const router = { replace: mock.fn(({ query }) => { route.query = query; }) };
const areaFilter = mock.fn();
mock.module('vue-router', { namedExports: { useRoute: () => route, useRouter: () => router } });
mock.module('maplibre-gl', { defaultExport: {
  Map: FakeMap, AttributionControl: class {}, NavigationControl: class {},
  LngLat: class { constructor(lng, lat) { this.lng = lng; this.lat = lat; } },
} });
mock.module('@deck.gl/mapbox', { namedExports: { MapboxOverlay: FakeOverlay } });
mock.module(new URL('../src/services/auth.ts', import.meta.url), { defaultExport: { getTokenSync: () => 'test-token' } });
mock.module(new URL('../src/stores/layerStore.ts', import.meta.url), {
  namedExports: { useLayerStore: () => ({ osmPois: { setAreaPolygon: areaFilter } }) },
});

const { useMapInstance } = await import('../src/composables/useMapInstance.ts');
const { baseLayers } = await import('../src/stores/mapConfig.ts');
const { initDeckOverlay, setDeckLayers, removeDeckLayers } = await import('../src/composables/useDeckOverlay.ts');
const { usePlacesDeckLayer } = await import('../src/composables/usePlacesDeckLayer.ts');
const { usePolygonDrawing } = await import('../src/composables/usePolygonDrawing.ts');

const lightStyle = {
  version: 8,
  sources: { streets: { type: 'vector', url: 'https://example.test/tiles.json' } },
  layers: [{ id: 'roads', type: 'line', source: 'streets', 'source-layer': 'transportation' }],
};
const darkStyle = { ...lightStyle, layers: [{ ...lightStyle.layers[0], paint: { 'line-color': '#111' } }] };
const makeMap = () => new FakeMap({ center: [23.3, 42.7], zoom: 12, style: { version: 8, sources: {}, layers: [] } });

// Vue's real component lifecycle without a DOM or WebGL context.
const renderer = createRenderer({
  createComment: () => ({}), createElement: () => ({}), createText: () => ({}),
  insert() {}, remove() {}, setText() {}, setElementText() {}, patchProp() {},
  parentNode: () => null, nextSibling: () => null,
});
function mount(setup) {
  const app = renderer.createApp({ setup() { setup(); return () => null; } });
  app.mount({});
  return app;
}

test('MapLibre preserves overlays across themes, follows fractional URL views, and releases resources', async () => {
  const originalFetch = globalThis.fetch;
  const originalObserver = globalThis.ResizeObserver;
  globalThis.fetch = async () => ({ ok: true, json: async () => structuredClone(lightStyle) });
  globalThis.ResizeObserver = FakeObserver;
  const scope = effectScope();
  try {
    const api = scope.run(useMapInstance);
    const map = await api.initMap({});
    assert.deepEqual(map.options.center, [23.3, 42.7]);
    assert.equal(map.getZoom(), 12.75);
    assert.equal(map.style.layers[0].source, 'basemap-streets');
    assert.equal(map.style.layers[0]['source-layer'], 'transportation');

    const polygon = { type: 'geojson', data: { type: 'FeatureCollection', features: [] } };
    const overlay = { id: 'selection', type: 'fill', source: 'polygon', layout: { visibility: 'none' }, filter: ['==', ['get', 'id'], 7] };
    map.style.sources.polygon = polygon;
    map.style.layers.push(overlay);
    api.switchBaseLayer(map, 'Minimal Dark');
    assert.equal(map.style.sources.polygon, polygon);
    assert.equal(map.style.layers.at(-1), overlay);
    assert.deepEqual(Object.keys(map.style.sources), ['basemap-streets', 'polygon']);
    api.switchBaseLayer(map, 'Minimal Light');
    assert.equal(map.style.layers.length, 2);

    route.query = { lat: '42.72', lng: '23.35', zoom: '14.25' };
    await nextTick();
    assert.deepEqual(map.getCenter(), { lat: 42.72, lng: 23.35 });
    assert.equal(map.getZoom(), 14.25);
    const jumps = map.jumps;
    map.emit('moveend');
    await new Promise(resolve => setTimeout(resolve, 320));
    await nextTick();
    assert.equal(map.jumps, jumps, 'writing the URL must not move the camera again');

    map.emit('moveend');
    const writes = router.replace.mock.callCount();
    scope.stop();
    assert.equal(map.removed, true);
    assert.equal(api.mapInstance.value, null);
    assert.equal(FakeObserver.instances.at(-1).disconnected, true);
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.equal(router.replace.mock.callCount(), writes, 'no URL writes after teardown');
  } finally {
    scope.stop();
    globalThis.fetch = originalFetch;
    globalThis.ResizeObserver = originalObserver;
    baseLayers.value.forEach(layer => { layer.visible = layer.name === 'Minimal Light'; });
  }
});

test('unmount during the style fetch aborts initialization before a map is constructed', async () => {
  const originalFetch = globalThis.fetch;
  let signal;
  globalThis.fetch = (_url, options) => new Promise((_resolve, reject) => {
    signal = options.signal;
    signal.addEventListener('abort', () => reject(signal.reason));
  });
  const scope = effectScope();
  try {
    const api = scope.run(useMapInstance);
    const pending = api.initMap({});
    scope.stop();
    await assert.rejects(pending, { name: 'AbortError' });
    assert.equal(signal.aborted, true);
    assert.equal(api.mapInstance.value, null);
  } finally {
    scope.stop();
    globalThis.fetch = originalFetch;
  }
});

test('deck overlays belong to their map and are fresh after map removal', () => {
  const first = makeMap();
  const second = makeMap();
  const a = initDeckOverlay(first);
  const b = initDeckOverlay(second);
  assert.notEqual(a, b);
  assert.equal(initDeckOverlay(first), a);
  setDeckLayers(first, 'places', ['first']);
  setDeckLayers(second, 'places', ['second']);
  assert.deepEqual(a.props.layers, ['first']);
  assert.deepEqual(b.props.layers, ['second']);
  removeDeckLayers(first, 'places');
  assert.deepEqual(a.props.layers, []);
  first.remove();
  assert.deepEqual(b.props.layers, ['second']);
  second.remove();
  assert.notEqual(initDeckOverlay(makeMap()), a);
});

test('place clusters expand, toggles update layers, and component unmount removes watchers/listeners', async () => {
  const mapRef = shallowRef(null);
  const clustering = ref(true);
  const inst = reactive({
    config: { category: 'barbershop', clusterColor: '#d97757' }, visible: true,
    filteredPlaces: [
      { place_id: '1', lat: 42.7, lng: 23.3 },
      { place_id: '2', lat: 42.7001, lng: 23.3001 },
    ],
  });
  const app = mount(() => usePlacesDeckLayer(inst, mapRef, clustering, () => {}));
  const map = makeMap();
  const overlay = initDeckOverlay(map);
  mapRef.value = map;
  await nextTick();
  const clusters = overlay.props.layers[0];
  assert.equal(clusters.props.data[0].properties.point_count, 2);
  clusters.props.onClick({ object: clusters.props.data[0] });
  assert.ok(map.getZoom() > 12);

  clustering.value = false;
  await nextTick();
  assert.equal(overlay.props.layers.length, 1);
  assert.equal(overlay.props.layers[0].props.data.length, 2);
  inst.visible = false;
  await nextTick();
  assert.deepEqual(overlay.props.layers, []);
  app.unmount();
  assert.equal(map.listenerCount('moveend'), 0);
  assert.equal(map.listenerCount('zoomend'), 0);
  inst.visible = true;
  await nextTick();
  assert.deepEqual(overlay.props.layers, [], 'unmounted watchers must not repopulate layers');
  map.remove();
});

test('drawing converts lat/lng to GeoJSON lng/lat and closes the polygon ring', async () => {
  const originalWindow = globalThis.window;
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  const map = makeMap();
  const vertices = ref([]);
  const polygon = ref(null);
  let drawing;
  const app = mount(() => { drawing = usePolygonDrawing(shallowRef(map), vertices, polygon, ref(true), () => {}); });
  try {
    drawing.initDrawingLayers(map);
    vertices.value = [[42.7, 23.3], [42.8, 23.4], [42.7, 23.5]];
    await nextTick();
    assert.deepEqual(map.getSource('drawing-line').data.features[0].geometry.coordinates[0], [23.3, 42.7]);
    polygon.value = vertices.value;
    await nextTick();
    const ring = map.getSource('active-polygon').data.features[0].geometry.coordinates[0];
    assert.equal(ring.length, 4);
    assert.deepEqual(ring[0], ring.at(-1));
    assert.deepEqual(map.getSource('drawing-line').data.features, []);
    assert.equal(areaFilter.mock.calls.at(-1).arguments[0], polygon.value);
    polygon.value = null;
    await nextTick();
    assert.deepEqual(map.getSource('active-polygon').data.features, []);
  } finally {
    app.unmount();
    map.remove();
    globalThis.window = originalWindow;
  }
});
