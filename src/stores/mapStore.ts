import { defineStore } from 'pinia';
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

export interface OpportunityZone {
    lat: number;
    lng: number;
    nearestDistance: number;
}

export interface ShopLocation {
    lat: number;
    lng: number;
    name: string;
    timestamp: number;
}

export const useMapStore = defineStore('map', () => {
    // State
    const barbershops = ref<Barbershop[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const userAddedShops = ref<ShopLocation[]>([]);

    const filters = ref({
        minRating: 0,
        minPrice: null as number | null,
        maxPrice: null as number | null,
        services: [] as string[],
    });

    const searchRadius = ref(1.5);
    const showOpportunityZones = ref(false);
    const isAddShopMode = ref(false);

    const newShopPin = ref<{ lat: number, lng: number } | null>(null);
    const showShopModal = ref(false);
    const showDeleteConfirm = ref(false);
    const shopToDelete = ref<Barbershop | null>(null);

    // Getters
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
        interface PriceRanges {
            "€0-15": number;
            "€16-20": number;
            "€21-25": number;
            "€26-30": number;
            "€31-35": number;
            "€36+": number;
        }

        const ranges: PriceRanges = {
            "€0-15": 0,
            "€16-20": 0,
            "€21-25": 0,
            "€26-30": 0,
            "€31-35": 0,
            "€36+": 0,
        };

        filteredBarbershops.value.forEach(shop => {
            const price = shop.price || 0;
            if (price <= 15) ranges["€0-15"]++;
            else if (price <= 20) ranges["€16-20"]++;
            else if (price <= 25) ranges["€21-25"]++;
            else if (price <= 30) ranges["€26-30"]++;
            else if (price <= 35) ranges["€31-35"]++;
            else ranges["€36+"]++;
        });

        return ranges;
    });

    const maxPriceCount = computed(() => {
        return Math.max(...Object.values(priceDistribution.value), 1);
    });

    // Opportunity Zones Logic
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const opportunityZones = computed((): OpportunityZone[] => {
        if (!showOpportunityZones.value) return [];

        const zones: OpportunityZone[] = [];
        const latStart = 42.62;
        const latEnd = 42.75;
        const minLng = 23.27;
        const maxLng = 23.38;
        const gridStep = 0.015;

        for (let lat = latStart; lat <= latEnd; lat += gridStep) {
            for (let lng = minLng; lng <= maxLng; lng += gridStep) {
                let minDistance = Infinity;

                barbershops.value.forEach(shop => {
                    const dist = calculateDistance(lat, lng, shop.lat, shop.lng);
                    if (dist < minDistance) minDistance = dist;
                });

                if (minDistance > searchRadius.value) {
                    zones.push({
                        lat,
                        lng,
                        nearestDistance: minDistance
                    });
                }
            }
        }

        const filteredZones: OpportunityZone[] = [];
        const minZoneDistance = 0.5;

        zones.forEach(zone => {
            const isTooClose = filteredZones.some(existing =>
                calculateDistance(zone.lat, zone.lng, existing.lat, existing.lng) < minZoneDistance
            );

            if (!isTooClose) {
                filteredZones.push(zone);
            }
        });

        return filteredZones.sort((a, b) => b.nearestDistance - a.nearestDistance);
    });

    // Actions
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

                const photoUrl = parsedPhotos && parsedPhotos[0]?.photo_reference
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${parsedPhotos[0].photo_reference}&key=YOUR_API_KEY`
                    : null;

                const openingHoursText = parsedOpeningHours?.weekday_text?.join('\n') || null;
                const isOpenNow = parsedOpeningHours?.open_now || null;

                const services = parsedTypes?.filter((t: string) =>
                    !['point_of_interest', 'establishment'].includes(t)
                ).map((t: string) =>
                    t.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                ) || [];

                return {
                    ...shop,
                    id: shop.place_id || shop.id,
                    rating: shop.rating || 0,
                    user_ratings_total: shop.user_ratings_total || 0,
                    price_level: shop.price_level || 0,
                    photo_url: photoUrl,
                    opening_hours_text: openingHoursText,
                    is_open_now: isOpenNow,
                    parsed_reviews: parsedReviews,
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

    const resetFilters = () => {
        filters.value = {
            minRating: 0,
            minPrice: null,
            maxPrice: null,
            services: [],
        };
    };

    const toggleOpportunityZones = () => {
        showOpportunityZones.value = !showOpportunityZones.value;
    };

    const toggleAddShopMode = () => {
        isAddShopMode.value = !isAddShopMode.value;
        if (!isAddShopMode.value) {
            newShopPin.value = null;
            showShopModal.value = false;
        }
    };

    const setNewShopPin = (pin: { lat: number, lng: number } | null) => {
        newShopPin.value = pin;
    };

    const setShowShopModal = (show: boolean) => {
        showShopModal.value = show;
    };

    const setShopToDelete = (shop: Barbershop | null) => {
        shopToDelete.value = shop;
    };

    const setShowDeleteConfirm = (show: boolean) => {
        showDeleteConfirm.value = show;
    };

    const addUserShop = (shop: ShopLocation) => {
        userAddedShops.value.push(shop);
    };

    return {
        // State
        barbershops,
        isLoading,
        error,
        userAddedShops,
        filters,
        searchRadius,
        showOpportunityZones,
        isAddShopMode,
        newShopPin,
        showShopModal,
        showDeleteConfirm,
        shopToDelete,

        // Getters
        availableServices,
        filteredBarbershops,
        averageRating,
        averagePrice,
        priceDistribution,
        maxPriceCount,
        opportunityZones,

        // Actions
        fetchBarbershops,
        resetFilters,
        toggleOpportunityZones,
        toggleAddShopMode,
        setNewShopPin,
        setShowShopModal,
        setShopToDelete,
        setShowDeleteConfirm,
        addUserShop
    };
});
