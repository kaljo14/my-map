import { watch, onUnmounted, type Ref } from 'vue';
import Supercluster from 'supercluster';
import { ScatterplotLayer, TextLayer, IconLayer } from '@deck.gl/layers';
import maplibregl, { type Map as MapLibreMap, type LngLat } from 'maplibre-gl';
import { setDeckLayers, removeDeckLayers } from './useDeckOverlay';
import type { Place } from '@/api/places';
import type { PlaceTypeConfig } from './usePlacesManager';

export interface PlaceInstance {
  config: PlaceTypeConfig;
  visible: boolean;
  filteredPlaces: Place[];
  [key: string]: unknown;
}

interface PointProperties { id: string; tags: string }
type PointFeature = GeoJSON.Feature<GeoJSON.Point, PointProperties>;

const CATEGORY_ICONS: Record<string, string> = {
  barbershop: '/icons/marker-barbershop.svg',
  gym: '/icons/marker-gym.svg',
  carwash: '/icons/marker-carwash.svg',
  'grocery store': '/icons/marker-grocery.svg',
};

interface IconDescriptor {
  url: string;
  width: number;
  height: number;
  anchorY: number;
  size?: number;
}

const CHAIN_ICONS: Record<string, IconDescriptor> = {
  lidl:       { url: '/Lidl-Logo.svg',            width: 60,  height: 60,  anchorY: 30,  size: 28 },
  kaufland:   { url: '/Kaufland_201x_logo.svg',   width: 500, height: 500, anchorY: 250, size: 28 },
  billa:      { url: '/Billa_Logo_2012.svg',       width: 483, height: 196, anchorY: 98,  size: 20 },
  fantastico: { url: '/Fantastico.png',             width: 300, height: 150, anchorY: 75,  size: 28 },
};

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function getIconDescriptor(feature: PointFeature, category: string): IconDescriptor {
  let tags: string[] = [];
  try {
    tags = JSON.parse(feature.properties.tags || '[]');
  } catch { /* ignore */ }
  for (const [chain, descriptor] of Object.entries(CHAIN_ICONS)) {
    if (tags.includes(chain)) return descriptor;
  }
  const url = CATEGORY_ICONS[category] ?? CATEGORY_ICONS['barbershop']!;
  return { url, width: 64, height: 64, anchorY: 32 };
}

function formatClusterCount(count: number): string {
  return count >= 1000 ? `${Math.round(count / 100) / 10}k` : String(count);
}

function clusterSize(count: number): number {
  if (count < 10) return 19;
  if (count < 50) return 24;
  if (count < 200) return 29;
  return 34;
}

export function usePlacesDeckLayer(
  inst: PlaceInstance,
  mapRef: Ref<MapLibreMap | null>,
  enableClustering: Ref<boolean>,
  openShopPopup: (place: Place, lngLat: LngLat, inst: PlaceInstance) => void,
) {
  const namespace = `places-${inst.config.category.replace(/ /g, '-')}`;
  const color = hexToRgb(inst.config.clusterColor);

  let index: Supercluster<PointProperties, PointProperties> | null = null;
  let features: PointFeature[] = [];

  function buildIndex() {
    features = inst.filteredPlaces.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      properties: {
        id: String(p.place_id || p.id),
        tags: Array.isArray(p.tags) ? JSON.stringify(p.tags) : (p.tags ?? '[]'),
      },
    }));

    index = new Supercluster<PointProperties, PointProperties>({ radius: 60, maxZoom: 14 });
    index.load(features);
    updateLayers();
  }

  function updateLayers() {
    const map = mapRef.value;
    if (!map || !inst.visible) {
      setDeckLayers(namespace, []);
      return;
    }

    if (enableClustering.value && index) {
      const bounds = map.getBounds();
      const zoom = Math.floor(map.getZoom());
      const bbox: [number, number, number, number] = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];
      const clusters = index.getClusters(bbox, zoom);

      const clusterFeatures = clusters.filter(
        (c) => c.properties && 'cluster' in c.properties && c.properties.cluster,
      );
      const pointFeatures = clusters.filter(
        (c) => !c.properties || !('cluster' in c.properties) || !c.properties.cluster,
      );

      setDeckLayers(namespace, [
        new ScatterplotLayer({
          id: `${namespace}-clusters`,
          data: clusterFeatures,
          getPosition: (d: any) => d.geometry.coordinates,
          getRadius: (d: any) => clusterSize(d.properties.point_count),
          getFillColor: [...color, 230],
          radiusUnits: 'pixels',
          pickable: true,
          autoHighlight: true,
          highlightColor: [...color, 255],
          onClick: ({ object }: any) => {
            if (!object || !index) return;
            const clusterId = object.properties.cluster_id;
            const expansionZoom = index.getClusterExpansionZoom(clusterId);
            map.easeTo({
              center: object.geometry.coordinates as [number, number],
              zoom: expansionZoom + 0.5,
            });
          },
        }),
        new TextLayer({
          id: `${namespace}-cluster-labels`,
          data: clusterFeatures,
          getPosition: (d: any) => d.geometry.coordinates,
          getText: (d: any) => formatClusterCount(d.properties.point_count),
          getSize: 13,
          getColor: [255, 255, 255, 255],
          fontWeight: 700,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'center',
          billboard: false,
          sizeUnits: 'pixels',
        }),
        new IconLayer({
          id: `${namespace}-points`,
          data: pointFeatures,
          getPosition: (d: any) => d.geometry.coordinates,
          getIcon: (d: any) => getIconDescriptor(d as PointFeature, inst.config.category),
          getSize: (d: any) => getIconDescriptor(d as PointFeature, inst.config.category).size ?? 48,
          sizeUnits: 'pixels',
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 255, 255, 80],
          onClick: ({ object }: any) => {
            if (!object) return;
            const id = String(object.properties.id);
            const place = inst.filteredPlaces.find(
              (p) => String(p.place_id || p.id) === id,
            );
            if (place) {
              const coords = object.geometry.coordinates;
              openShopPopup(
                place,
                new maplibregl.LngLat(coords[0], coords[1]),
                inst,
              );
            }
          },
        }),
      ]);
    } else {
      // No clustering — render all filtered places as icons
      setDeckLayers(namespace, [
        new IconLayer({
          id: `${namespace}-all-points`,
          data: features,
          getPosition: (d: any) => d.geometry.coordinates,
          getIcon: (d: any) => getIconDescriptor(d as PointFeature, inst.config.category),
          getSize: (d: any) => getIconDescriptor(d as PointFeature, inst.config.category).size ?? 48,
          sizeUnits: 'pixels',
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 255, 255, 80],
          onClick: ({ object }: any) => {
            if (!object) return;
            const id = String(object.properties.id);
            const place = inst.filteredPlaces.find(
              (p) => String(p.place_id || p.id) === id,
            );
            if (place) {
              const coords = object.geometry.coordinates;
              openShopPopup(
                place,
                new maplibregl.LngLat(coords[0], coords[1]),
                inst,
              );
            }
          },
        }),
      ]);
    }
  }

  // Rebuild supercluster when filtered places change
  watch(
    () => inst.filteredPlaces,
    () => buildIndex(),
    { deep: false },
  );

  // Re-render layers when visibility or clustering toggles
  watch(
    () => inst.visible,
    () => updateLayers(),
  );
  watch(enableClustering, () => updateLayers());

  // Re-render on map move/zoom
  function onMapUpdate() {
    updateLayers();
  }

  watch(mapRef, (map, oldMap) => {
    if (oldMap) {
      oldMap.off('moveend', onMapUpdate);
      oldMap.off('zoomend', onMapUpdate);
    }
    if (map) {
      map.on('moveend', onMapUpdate);
      map.on('zoomend', onMapUpdate);
      // Initial render if data already loaded
      if (inst.filteredPlaces.length > 0) buildIndex();
    }
  }, { immediate: true });

  onUnmounted(() => {
    const map = mapRef.value;
    if (map) {
      map.off('moveend', onMapUpdate);
      map.off('zoomend', onMapUpdate);
    }
    removeDeckLayers(namespace);
  });
}
