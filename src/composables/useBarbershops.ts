import { ref, computed } from 'vue';
import httpClient from '@/services/httpClient';

export interface Barbershop {
    place_id: string;
    name: string;
    lat: number;
    lng: number;
    address?: string;
    business_status?: string;
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    google_maps_url?: string;
    opening_hours?: string;
    photos?: string;
    icon_url?: string;
    types?: string;
    reviews?: string;
    editorial_summary?: string;
    curbside_pickup?: boolean;
    delivery?: boolean;
    dine_in?: boolean;
    takeout?: boolean;
    reservable?: boolean;
    wheelchair_accessible?: boolean;
    utc_offset_minutes?: number;
    // Parsed/Computed fields
    opening_hours_text?: string | null;
    is_open_now?: boolean | null;
    photo_url?: string | null;
    parsed_reviews?: any[] | null;
    // Legacy fields for compatibility
    id?: string | number;
    price?: number;
    services?: string[];
}

export function useBarbershops() {
    const barbershops = ref<Barbershop[]>([]);
    const isLoading = ref(true);
    const error = ref<string | null>(null);

    const filters = ref({
        minRating: 0,
        minReviews: 0,
        minPrice: null as number | null,
        maxPrice: null as number | null,
        services: [] as string[],
    });

    const fetchBarbershops = async () => {
        try {
            isLoading.value = true;
            error.value = null;

            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/places';
            const response = await httpClient.get(`${apiBaseUrl}/api/barbershops`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            barbershops.value = data.map((shop: any) => {
                // Parse JSON string fields
                let parsedOpeningHours = null;
                let parsedPhotos = null;
                let parsedTypes = null;
                let parsedReviews = null;

                try {
                    if (shop.opening_hours && typeof shop.opening_hours === 'string') {
                        parsedOpeningHours = JSON.parse(shop.opening_hours);
                    }
                } catch (e) {
                    console.warn('Failed to parse opening_hours for', shop.name);
                }

                try {
                    if (shop.photos && typeof shop.photos === 'string') {
                        parsedPhotos = JSON.parse(shop.photos);
                    }
                } catch (e) {
                    console.warn('Failed to parse photos for', shop.name);
                }

                try {
                    if (shop.types && typeof shop.types === 'string') {
                        parsedTypes = JSON.parse(shop.types);
                    }
                } catch (e) {
                    console.warn('Failed to parse types for', shop.name);
                }

                try {
                    if (shop.reviews && typeof shop.reviews === 'string') {
                        parsedReviews = JSON.parse(shop.reviews);
                    }
                } catch (e) {
                    console.warn('Failed to parse reviews for', shop.name);
                }

                // Extract photo URL (using Google Places API photo reference)
                const photoUrl = parsedPhotos && parsedPhotos[0]?.photo_reference
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${parsedPhotos[0].photo_reference}&key=YOUR_API_KEY`
                    : null;

                // Extract opening hours text
                const openingHoursText = parsedOpeningHours?.weekday_text?.join('\n') || null;
                const isOpenNow = parsedOpeningHours?.open_now || null;

                // Extract types as readable services
                const services = parsedTypes?.filter((t: string) =>
                    !['point_of_interest', 'establishment'].includes(t)
                ).map((t: string) =>
                    t.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                ) || [];

                return {
                    ...shop,
                    // Ensure required fields have defaults
                    id: shop.place_id || shop.id,
                    rating: shop.rating || 0,
                    user_ratings_total: shop.user_ratings_total || 0,
                    price_level: shop.price_level || 0,
                    // Parsed fields
                    photo_url: photoUrl,
                    opening_hours_text: openingHoursText,
                    is_open_now: isOpenNow,
                    parsed_reviews: parsedReviews,
                    // Legacy compatibility
                    price: shop.price_level || shop.price || 0,
                    reviews: shop.user_ratings_total || shop.reviews || 0,
                    services: services.length > 0 ? services : (shop.services || [])
                };
            });
        } catch (err) {
            console.error('Failed to fetch barbershops:', err);
            error.value = 'Failed to load barbershops. Please try again later.';
        } finally {
            isLoading.value = false;
        }
    };

    const availableServices = computed(() => {
        const allServices = new Set<string>();
        barbershops.value.forEach(shop => {
            (shop.services || []).forEach(service => allServices.add(service));
        });
        return Array.from(allServices).sort();
    });

    const filteredBarbershops = computed(() => {
        return barbershops.value.filter(shop => {
            if ((shop.rating || 0) < filters.value.minRating) return false;
            if ((shop.user_ratings_total || 0) < filters.value.minReviews) return false;
            if (filters.value.minPrice !== null && (shop.price || 0) < filters.value.minPrice) return false;
            if (filters.value.maxPrice !== null && (shop.price || 0) > filters.value.maxPrice) return false;
            if (filters.value.services.length > 0) {
                const hasService = filters.value.services.some(service =>
                    (shop.services || []).includes(service)
                );
                if (!hasService) return false;
            }
            return true;
        });
    });

    const averageRating = computed(() => {
        if (filteredBarbershops.value.length === 0) return 0;
        const sum = filteredBarbershops.value.reduce((acc, shop) => acc + (shop.rating || 0), 0);
        return sum / filteredBarbershops.value.length;
    });

    const averagePrice = computed(() => {
        if (filteredBarbershops.value.length === 0) return 0;
        const sum = filteredBarbershops.value.reduce((acc, shop) => acc + (shop.price || 0), 0);
        return sum / filteredBarbershops.value.length;
    });

    const priceDistribution = computed(() => {
        const ranges = {
            "€0-15": 0,
            "€16-20": 0,
            "€21-25": 0,
            "€26-30": 0,
            "€31-35": 0,
            "€36+": 0,
        };

        filteredBarbershops.value.forEach(shop => {
            if ((shop.price || 0) <= 15) ranges["€0-15"]++;
            else if ((shop.price || 0) <= 20) ranges["€16-20"]++;
            else if ((shop.price || 0) <= 25) ranges["€21-25"]++;
            else if ((shop.price || 0) <= 30) ranges["€26-30"]++;
            else if ((shop.price || 0) <= 35) ranges["€31-35"]++;
            else ranges["€36+"]++;
        });

        return ranges;
    });

    const maxPriceCount = computed(() => {
        return Math.max(...Object.values(priceDistribution.value), 1);
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
        barbershops,
        isLoading,
        error,
        filters,
        fetchBarbershops,
        availableServices,
        filteredBarbershops,
        averageRating,
        averagePrice,
        priceDistribution,
        maxPriceCount,
        resetFilters
    };
}
