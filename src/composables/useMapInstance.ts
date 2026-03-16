import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import L from 'leaflet';
import { useMapView } from '@/stores/mapViewStore';

export function useMapInstance() {
    const route = useRoute();
    const { mapCenter, mapZoom, initializeFromURL, updateURL } = useMapView();

    // Sync store with URL changes (back/forward or manual edit)
    watch(() => route.query, () => {
        initializeFromURL();
    }, { deep: true, immediate: true });

    // Local refs for the l-map component binding (initialized after store sync)
    const zoom = ref(mapZoom.value);
    const center = ref(mapCenter.value);

    watch(mapZoom, (newZoom) => { zoom.value = newZoom; });
    watch(mapCenter, (newCenter) => { center.value = newCenter; });

    const mapInstance = ref<L.Map | null>(null);

    const onMapReady = (map: L.Map) => {
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
