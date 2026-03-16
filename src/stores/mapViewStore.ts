import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Default map view (Sofia center)
const DEFAULT_CENTER: [number, number] = [42.6977, 23.3219];
const DEFAULT_ZOOM = 12;

// Map view state
export const mapCenter = ref<[number, number]>(DEFAULT_CENTER);
export const mapZoom = ref(DEFAULT_ZOOM);

/**
 * Composable to manage map view with URL synchronization
 */
export function useMapView() {
    const route = useRoute();
    const router = useRouter();

    /**
     * Initialize map view from URL parameters
     */
    const initializeFromURL = () => {
        const lat = parseFloat(route.query.lat as string);
        const lng = parseFloat(route.query.lng as string);
        const zoom = parseInt(route.query.zoom as string, 10);

        // Map will update automatically via v-model or explicit setting
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            mapCenter.value = [lat, lng];
        }

        if (!isNaN(zoom) && zoom >= 1 && zoom <= 20) {
            mapZoom.value = zoom;
        }
    };

    /**
     * Update URL with current map view
     */
    const updateURL = (lat: number, lng: number, zoom: number) => {
        // Round to 6 decimal places for cleaner URLs (~0.1m precision)
        const roundedLat = Math.round(lat * 1000000) / 1000000;
        const roundedLng = Math.round(lng * 1000000) / 1000000;

        // Skip if values haven't meaningfully changed
        if (
            parseFloat(route.query.lat as string) === roundedLat &&
            parseFloat(route.query.lng as string) === roundedLng &&
            parseInt(route.query.zoom as string, 10) === zoom
        ) {
            return;
        }

        router.replace({
            query: {
                ...route.query,
                lat: roundedLat.toString(),
                lng: roundedLng.toString(),
                zoom: zoom.toString(),
            },
        });
    };

    return {
        mapCenter,
        mapZoom,
        initializeFromURL,
        updateURL,
    };
}
