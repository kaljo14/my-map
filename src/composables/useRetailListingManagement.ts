import { ref } from 'vue';
import RetailListingsAPI, { type CreateRetailListingRequest } from '@/api/retailListings';
import type { Map as MapLibreMap } from 'maplibre-gl';

export function useRetailListingManagement(
    refresh: (map: MapLibreMap | null) => Promise<void>,
    mapInstance: { value: MapLibreMap | null },
) {
    const isAddListingMode = ref(false);
    const showListingModal = ref(false);
    const newListingLat = ref(0);
    const newListingLng = ref(0);

    const startAddListing = () => {
        isAddListingMode.value = true;
    };

    const cancelAddListing = () => {
        showListingModal.value = false;
        isAddListingMode.value = false;
        newListingLat.value = 0;
        newListingLng.value = 0;
    };

    const onMapClick = (e: { latlng: { lat: number; lng: number } }) => {
        if (!isAddListingMode.value) return;
        newListingLat.value = e.latlng.lat;
        newListingLng.value = e.latlng.lng;
        showListingModal.value = true;
    };

    const saveListing = async (formData: Omit<CreateRetailListingRequest, 'lat' | 'lng'>) => {
        try {
            await RetailListingsAPI.createListing({
                ...formData,
                lat: newListingLat.value,
                lng: newListingLng.value,
            });
            await refresh(mapInstance.value);
        } catch (error) {
            console.error('Failed to save retail listing:', error);
            alert('Failed to save listing. Please try again.');
            return;
        }

        showListingModal.value = false;
        isAddListingMode.value = false;
        newListingLat.value = 0;
        newListingLng.value = 0;
    };

    const deleteListing = async (id: string) => {
        try {
            await RetailListingsAPI.deleteListing(id);
            await refresh(mapInstance.value);
        } catch (error) {
            console.error('Failed to delete retail listing:', error);
            alert('Failed to delete listing. Please try again.');
        }
    };

    return {
        isAddListingMode,
        showListingModal,
        newListingLat,
        newListingLng,
        startAddListing,
        cancelAddListing,
        onMapClick,
        saveListing,
        deleteListing,
    };
}
