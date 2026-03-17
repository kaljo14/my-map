import { reactive } from 'vue';
import { usePlaces } from './usePlaces';

export interface PlaceTypeConfig {
    category: string;
    emoji: string;
    labelKey: string;
    markerClass: string;
    defaultVisible?: boolean;
}

export const PLACE_TYPES: PlaceTypeConfig[] = [
    { category: 'barbershop',    emoji: '💈', labelKey: 'showBarbershops',   markerClass: 'barbershop-marker', defaultVisible: true },
    { category: 'gym',           emoji: '🏋️', labelKey: 'showGyms',          markerClass: 'gym-marker' },
    { category: 'carwash',       emoji: '🚗', labelKey: 'showCarwashes',      markerClass: 'carwash-marker' },
    { category: 'grocery store', emoji: '🛒', labelKey: 'showGroceryStores',  markerClass: 'grocery-marker' },
];

export function usePlacesManager(types: PlaceTypeConfig[] = PLACE_TYPES) {
    // Each instance is wrapped with reactive() so refs auto-unwrap in templates
    const instances = types.map(config => {
        const places = usePlaces(config.category);
        return reactive({
            config,
            visible: config.defaultVisible ?? false,
            filteredPlaces: places.filteredPlaces,
            fetchPlaces: places.fetchPlaces,
            filters: places.filters,
            availableServices: places.availableServices,
            averageRating: places.averageRating,
            resetFilters: places.resetFilters,
        });
    });

    const fetchAll = () => Promise.all(instances.map(i => i.fetchPlaces()));

    const toggleVisible = (category: string) => {
        const inst = instances.find(i => i.config.category === category);
        if (inst) inst.visible = !inst.visible;
    };

    // Shared filter state comes from the primary (first) instance
    const primary = instances[0];

    return {
        instances,
        fetchAll,
        toggleVisible,
        filters: primary.filters,
        availableServices: primary.availableServices,
        averageRating: primary.averageRating,
        resetFilters: primary.resetFilters,
    };
}
