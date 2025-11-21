import { ref } from 'vue';
import httpClient from '@/services/httpClient';
import type { Barbershop } from './useBarbershops';

export interface ShopLocation {
    lat: number;
    lng: number;
    name: string;
    timestamp: number;
}

export function useShopManagement(fetchBarbershops: () => Promise<void>) {
    const showShopModal = ref(false);
    const newShopPin = ref<{ lat: number, lng: number } | null>(null);
    const newShopName = ref("");
    const userAddedShops = ref<ShopLocation[]>([]);
    const isAddShopMode = ref(false);

    // Edit menu state
    const activeEditMenu = ref<string | null>(null);
    const showDeleteConfirm = ref(false);
    const shopToDelete = ref<Barbershop | null>(null);

    const toggleAddShopMode = () => {
        isAddShopMode.value = !isAddShopMode.value;
        if (!isAddShopMode.value) {
            newShopPin.value = null;
            showShopModal.value = false;
        }
    };

    const onMapClick = (e: any) => {
        if (!isAddShopMode.value) return;

        // e.latlng contains the coordinates
        newShopPin.value = {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        };
        newShopName.value = "";
        showShopModal.value = true;
    };

    const cancelAddShop = () => {
        showShopModal.value = false;
        newShopPin.value = null;
        isAddShopMode.value = false; // Exit mode on cancel
    };

    const saveShop = async () => {
        if (!newShopPin.value) return;

        const shopData = {
            name: newShopName.value || "Untitled Barbershop",
            lat: newShopPin.value.lat,
            lng: newShopPin.value.lng,
            address: "", // Empty for now, as it's not collected in the modal
            business_status: "OPERATIONAL", // Default status for a new shop
            rating: 0 // Default rating for a new shop
        };

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/places';
            const response = await httpClient.post(`${apiBaseUrl}/api/barbershops`, shopData);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const savedShop = await response.json();
            console.log("Barbershop saved successfully:", savedShop);

            // Add to local state for immediate display
            userAddedShops.value.push({
                ...savedShop,
                timestamp: Date.now()
            });

            // Refresh the main barbershops list to include the newly added shop
            await fetchBarbershops();
        } catch (error) {
            console.error("Failed to save barbershop:", error);
            alert("Failed to save barbershop. Please try again.");
            return; // Don't close modal on error
        }

        showShopModal.value = false;
        newShopPin.value = null;
        isAddShopMode.value = false; // Exit mode after saving
    };

    // Edit menu functions
    const toggleEditMenu = (placeId: string) => {
        if (activeEditMenu.value === placeId) {
            activeEditMenu.value = null;
        } else {
            activeEditMenu.value = placeId;
        }
    };

    const editBarbershop = (shop: Barbershop) => {
        // Close the edit menu
        activeEditMenu.value = null;

        // TODO: Implement edit functionality
        // For now, just show an alert
        alert(`Edit functionality for ${shop.name} will be implemented soon!`);
    };

    const confirmDelete = (shop: Barbershop) => {
        // Close the edit menu
        activeEditMenu.value = null;

        // Show confirmation dialog
        shopToDelete.value = shop;
        showDeleteConfirm.value = true;
    };

    const cancelDelete = () => {
        showDeleteConfirm.value = false;
        shopToDelete.value = null;
    };

    const deleteBarbershop = async () => {
        if (!shopToDelete.value) return;

        const placeId = shopToDelete.value.place_id;

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/places';
            const response = await httpClient.delete(`${apiBaseUrl}/api/barbershops/${placeId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`Barbershop ${shopToDelete.value.name} deleted successfully`);

            // Refresh the barbershops list
            await fetchBarbershops();

            // Close the confirmation dialog
            showDeleteConfirm.value = false;
            shopToDelete.value = null;
        } catch (error) {
            console.error('Failed to delete barbershop:', error);
            alert('Failed to delete barbershop. Please try again.');
        }
    };

    return {
        showShopModal,
        newShopPin,
        newShopName,
        userAddedShops,
        isAddShopMode,
        activeEditMenu,
        showDeleteConfirm,
        shopToDelete,
        toggleAddShopMode,
        onMapClick,
        cancelAddShop,
        saveShop,
        toggleEditMenu,
        editBarbershop,
        confirmDelete,
        cancelDelete,
        deleteBarbershop
    };
}
