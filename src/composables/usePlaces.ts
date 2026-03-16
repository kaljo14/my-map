import { ref, computed } from 'vue';
import PlacesAPI, { type Place as ApiPlace } from '@/api/places';

export interface Place extends ApiPlace {
    opening_hours_text?: string | null;
    is_open_now?: boolean | null;
    photo_url?: string | null;
    parsed_reviews?: any[] | null;
}

// Types to strip from the services list per category
const TYPE_EXCLUSIONS: Record<string, string[]> = {
    barbershop: ['point_of_interest', 'establishment'],
    gym: ['point_of_interest', 'establishment', 'gym', 'health', 'spa'],
    carwash: ['point_of_interest', 'establishment', 'car_wash'],
};
const DEFAULT_EXCLUSIONS = ['point_of_interest', 'establishment'];

function parsePlaceData(raw: any, category: string): Place {
    const tryParse = (value: any, field: string) => {
        if (value && typeof value === 'string') {
            try { return JSON.parse(value); }
            catch { console.warn(`Failed to parse ${field} for`, raw.name); }
        }
        return null;
    };

    const parsedOpeningHours = tryParse(raw.opening_hours, 'opening_hours');
    const parsedPhotos = tryParse(raw.photos, 'photos');
    const parsedTypes = tryParse(raw.types, 'types');
    const parsedReviews = tryParse(raw.reviews, 'reviews');

    const photoUrl = parsedPhotos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${parsedPhotos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
        : null;

    const exclusions = TYPE_EXCLUSIONS[category] ?? DEFAULT_EXCLUSIONS;
    const services = parsedTypes
        ?.filter((t: string) => !exclusions.includes(t))
        .map((t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
        ?? [];

    return {
        ...raw,
        id: raw.place_id || raw.id,
        rating: raw.rating || 0,
        user_ratings_total: raw.user_ratings_total || 0,
        price_level: raw.price_level || 0,
        photo_url: photoUrl,
        opening_hours_text: parsedOpeningHours?.weekday_text?.join('\n') ?? null,
        is_open_now: parsedOpeningHours?.open_now ?? null,
        parsed_reviews: parsedReviews,
        price: raw.price_level || raw.price || 0,
        reviews: raw.user_ratings_total || raw.reviews || 0,
        services: services.length > 0 ? services : (raw.services || []),
    };
}

export function usePlaces(category: string) {
    const places = ref<Place[]>([]);
    const isLoading = ref(true);
    const error = ref<string | null>(null);

    const filters = ref({
        minRating: 0,
        minReviews: 0,
        minPrice: null as number | null,
        maxPrice: null as number | null,
        services: [] as string[],
    });

    const fetchPlaces = async () => {
        try {
            isLoading.value = true;
            error.value = null;
            const data = await PlacesAPI.getPlaces(category);
            places.value = data.map(raw => parsePlaceData(raw, category));
        } catch (err) {
            console.error(`Failed to fetch ${category}s:`, err);
            error.value = `Failed to load ${category}s. Please try again later.`;
        } finally {
            isLoading.value = false;
        }
    };

    const availableServices = computed(() => {
        const all = new Set<string>();
        places.value.forEach(p => (p.services || []).forEach(s => all.add(s)));
        return Array.from(all).sort();
    });

    const filteredPlaces = computed(() => {
        return places.value.filter(p => {
            if ((p.rating || 0) < filters.value.minRating) return false;
            if ((p.user_ratings_total || 0) < filters.value.minReviews) return false;
            if (filters.value.minPrice !== null && (p.price || 0) < filters.value.minPrice) return false;
            if (filters.value.maxPrice !== null && (p.price || 0) > filters.value.maxPrice) return false;
            if (filters.value.services.length > 0) {
                const hasService = filters.value.services.some(s => (p.services || []).includes(s));
                if (!hasService) return false;
            }
            return true;
        });
    });

    const averageRating = computed(() => {
        if (!filteredPlaces.value.length) return 0;
        return filteredPlaces.value.reduce((acc, p) => acc + (p.rating || 0), 0) / filteredPlaces.value.length;
    });

    const resetFilters = () => {
        filters.value = { minRating: 0, minReviews: 0, minPrice: null, maxPrice: null, services: [] };
    };

    return {
        places,
        isLoading,
        error,
        filters,
        fetchPlaces,
        availableServices,
        filteredPlaces,
        averageRating,
        resetFilters,
    };
}
