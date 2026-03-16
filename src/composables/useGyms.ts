import { ref, computed } from 'vue';
import PlacesAPI, { type Barbershop as ApiPlace } from '@/api/places';

// Reuse the same interface as Barbershop for now since they share the same structure
export interface Gym extends ApiPlace {
    // Parsed/Computed fields
    opening_hours_text?: string | null;
    is_open_now?: boolean | null;
    photo_url?: string | null;
    parsed_reviews?: any[] | null;
}

export function useGyms() {
    const gyms = ref<Gym[]>([]);
    const isLoading = ref(true);
    const error = ref<string | null>(null);

    const filters = ref({
        minRating: 0,
        minReviews: 0,
        minPrice: null as number | null,
        maxPrice: null as number | null,
        services: [] as string[],
    });

    const fetchGyms = async () => {
        try {
            isLoading.value = true;
            error.value = null;

            const data = await PlacesAPI.getGyms();
            gyms.value = data.map((place: any) => {
                // Parse JSON string fields
                let parsedOpeningHours = null;
                let parsedPhotos = null;
                let parsedTypes = null;
                let parsedReviews = null;

                try {
                    if (place.opening_hours && typeof place.opening_hours === 'string') {
                        parsedOpeningHours = JSON.parse(place.opening_hours);
                    }
                } catch (e) {
                    console.warn('Failed to parse opening_hours for', place.name);
                }

                try {
                    if (place.photos && typeof place.photos === 'string') {
                        parsedPhotos = JSON.parse(place.photos);
                    }
                } catch (e) {
                    console.warn('Failed to parse photos for', place.name);
                }

                try {
                    if (place.types && typeof place.types === 'string') {
                        parsedTypes = JSON.parse(place.types);
                    }
                } catch (e) {
                    console.warn('Failed to parse types for', place.name);
                }

                try {
                    if (place.reviews && typeof place.reviews === 'string') {
                        parsedReviews = JSON.parse(place.reviews);
                    }
                } catch (e) {
                    console.warn('Failed to parse reviews for', place.name);
                }

                // Extract photo URL (using Google Places API photo reference)
                const photoUrl = parsedPhotos && parsedPhotos[0]?.photo_reference
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${parsedPhotos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
                    : null;

                // Extract opening hours text
                const openingHoursText = parsedOpeningHours?.weekday_text?.join('\n') || null;
                const isOpenNow = parsedOpeningHours?.open_now || null;

                // Extract types as readable services
                const services = parsedTypes?.filter((t: string) =>
                    !['point_of_interest', 'establishment', 'gym', 'health', 'spa'].includes(t)
                ).map((t: string) =>
                    t.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                ) || [];

                return {
                    ...place,
                    // Ensure required fields have defaults
                    id: place.place_id || place.id,
                    rating: place.rating || 0,
                    user_ratings_total: place.user_ratings_total || 0,
                    price_level: place.price_level || 0,
                    // Parsed fields
                    photo_url: photoUrl,
                    opening_hours_text: openingHoursText,
                    is_open_now: isOpenNow,
                    parsed_reviews: parsedReviews,
                    // Legacy compatibility
                    price: place.price_level || place.price || 0,
                    reviews: place.user_ratings_total || place.reviews || 0,
                    services: services.length > 0 ? services : (place.services || [])
                };
            });
        } catch (err) {
            console.error('Failed to fetch gyms:', err);
            error.value = 'Failed to load gyms. Please try again later.';
        } finally {
            isLoading.value = false;
        }
    };

    const availableServices = computed(() => {
        const allServices = new Set<string>();
        gyms.value.forEach(place => {
            (place.services || []).forEach(service => allServices.add(service));
        });
        return Array.from(allServices).sort();
    });

    const filteredGyms = computed(() => {
        return gyms.value.filter(place => {
            if ((place.rating || 0) < filters.value.minRating) return false;
            if ((place.user_ratings_total || 0) < filters.value.minReviews) return false;
            if (filters.value.minPrice !== null && (place.price || 0) < filters.value.minPrice) return false;
            if (filters.value.maxPrice !== null && (place.price || 0) > filters.value.maxPrice) return false;
            if (filters.value.services.length > 0) {
                const hasService = filters.value.services.some(service =>
                    (place.services || []).includes(service)
                );
                if (!hasService) return false;
            }
            return true;
        });
    });

    const averageRating = computed(() => {
        if (filteredGyms.value.length === 0) return 0;
        const sum = filteredGyms.value.reduce((acc, place) => acc + (place.rating || 0), 0);
        return sum / filteredGyms.value.length;
    });

    const resetFilters = () => {
        filters.value = {
            minRating: 0,
            minReviews: 0,
            minPrice: null,
            maxPrice: null,
            services: [],
        };
    };

    return {
        gyms,
        isLoading,
        error,
        filters,
        fetchGyms,
        availableServices,
        filteredGyms,
        averageRating,
        resetFilters
    };
}
