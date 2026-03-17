import { reactive, toRef } from 'vue';
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
        const inst = reactive({
            config,
            visible: config.defaultVisible ?? false,
            filteredPlaces: places.filteredPlaces,
            fetchPlaces: places.fetchPlaces,
            filters: places.filters,
            availableServices: places.availableServices,
            averageRating: places.averageRating,
            resetFilters: places.resetFilters,
            selectedTagFilters: places.selectedTagFilters,
        });
        if (config.category === 'grocery store') {
            inst.selectedTagFilters = ['big-chains'];
        }
        return inst;
    });

    const fetchAll = () => Promise.all(instances.map(i => i.fetchPlaces()));

    const toggleVisible = (category: string) => {
        const inst = instances.find(i => i.config.category === category);
        if (inst) inst.visible = !inst.visible;
    };

    // Shared filter state comes from the primary (first) instance
    const primary = instances[0]!;

    const groceryInst = instances.find(i => i.config.category === 'grocery store');
    const groceryTagFilters = groceryInst
        ? toRef(groceryInst as Record<string, any>, 'selectedTagFilters')
        : toRef({ selectedTagFilters: ['big-chains'] as string[] }, 'selectedTagFilters');

    const toggleGroceryTagFilter = (tag: string) => {
        if (!groceryInst) return;
        const current: string[] = groceryInst.selectedTagFilters;
        if (tag === 'big-chains') {
            // big-chains is single-select: always replace
            groceryInst.selectedTagFilters = ['big-chains'];
        } else {
            // specific chain: multi-select, deselect big-chains
            const withoutBigChains = current.filter((t: string) => t !== 'big-chains');
            const idx = withoutBigChains.indexOf(tag);
            if (idx === -1) {
                withoutBigChains.push(tag);
            } else {
                withoutBigChains.splice(idx, 1);
            }
            // if nothing selected fall back to big-chains
            groceryInst.selectedTagFilters = withoutBigChains.length > 0 ? withoutBigChains : ['big-chains'];
        }
    };

    const resetFilters = () => {
        primary.resetFilters();
        if (groceryInst) groceryInst.selectedTagFilters = ['big-chains'];
    };

    return {
        instances,
        fetchAll,
        toggleVisible,
        filters: primary.filters,
        availableServices: primary.availableServices,
        averageRating: primary.averageRating,
        resetFilters,
        groceryTagFilters,
        toggleGroceryTagFilter,
    };
}
