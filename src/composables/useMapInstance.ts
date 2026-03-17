import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { Map as LeafletMap } from 'leaflet';
import { useMapView } from '@/stores/mapViewStore';

export function useMapInstance() {
    const route = useRoute();
    const { mapCenter, mapZoom, initializeFromURL, updateURL } = useMapView();

    watch(() => route.query, () => {
        initializeFromURL();
    }, { deep: true, immediate: true });

    const zoom = ref(mapZoom.value);
    const center = ref(mapCenter.value);

    watch(mapZoom, (newZoom) => { zoom.value = newZoom; });
    watch(mapCenter, (newCenter) => { center.value = newCenter; });

    const mapInstance = ref<LeafletMap | null>(null);

    const onMapReady = (map: LeafletMap) => {
        mapInstance.value = map;

        let updateTimeout: ReturnType<typeof setTimeout>;
        map.on('moveend', () => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                const c = map.getCenter();
                const z = map.getZoom();

                mapCenter.value = [c.lat, c.lng];
                mapZoom.value = z;

                updateURL(c.lat, c.lng, z);
            }, 300);
        });
    };

    return {
        mapInstance,
        zoom,
        center,
        onMapReady,
    };
}
