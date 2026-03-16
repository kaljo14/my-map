import { ref } from 'vue';
import PlacesAPI, { type Place } from '@/api/places';

export interface ShopLocation {
    lat: number;
    lng: number;
    name: string;
    timestamp: number;
}

export function useShopManagement(fetchPlaces: () => Promise<void>) {
    const showShopModal = ref(false);
    const newShopPin = ref<{ lat: number, lng: number } | null>(null);
    const newShopName = ref("");
    const userAddedShops = ref<ShopLocation[]>([]);
    const isAddShopMode = ref(false);

    const activeEditMenu = ref<string | null>(null);
    const showDeleteConfirm = ref(false);
    const shopToDelete = ref<Place | null>(null);

    const toggleAddShopMode = () => {
        isAddShopMode.value = !isAddShopMode.value;
        if (!isAddShopMode.value) {
            newShopPin.value = null;
            showShopModal.value = false;
        }
    };

    const onMapClick = (e: any) => {
        if (!isAddShopMode.value) return;
        newShopPin.value = { lat: e.latlng.lat, lng: e.latlng.lng };
        newShopName.value = "";
        showShopModal.value = true;
    };

    const cancelAddShop = () => {
        showShopModal.value = false;
        newShopPin.value = null;
        isAddShopMode.value = false;
    };

    const saveShop = async () => {
        if (!newShopPin.value) return;

        try {
            const saved = await PlacesAPI.createPlace({
                name: newShopName.value || "Untitled Barbershop",
                lat: newShopPin.value.lat,
                lng: newShopPin.value.lng,
                address: "",
                business_status: "OPERATIONAL",
                rating: 0,
                category: "barbershop",
            });

            userAddedShops.value.push({ ...saved, timestamp: Date.now() } as any);
            await fetchPlaces();
        } catch (error) {
            console.error("Failed to save place:", error);
            alert("Failed to save. Please try again.");
            return;
        }

        showShopModal.value = false;
        newShopPin.value = null;
        isAddShopMode.value = false;
    };

    const toggleEditMenu = (placeId: string) => {
        activeEditMenu.value = activeEditMenu.value === placeId ? null : placeId;
    };

    const editBarbershop = (shop: Place) => {
        activeEditMenu.value = null;
        alert(`Edit functionality for ${shop.name} will be implemented soon!`);
    };

    const confirmDelete = (shop: Place) => {
        activeEditMenu.value = null;
        shopToDelete.value = shop;
        showDeleteConfirm.value = true;
    };

    const cancelDelete = () => {
        showDeleteConfirm.value = false;
        shopToDelete.value = null;
    };

    const deleteBarbershop = async () => {
        if (!shopToDelete.value) return;

        try {
            await PlacesAPI.deletePlace(shopToDelete.value.place_id);
            await fetchPlaces();
            showDeleteConfirm.value = false;
            shopToDelete.value = null;
        } catch (error) {
            console.error('Failed to delete place:', error);
            alert('Failed to delete. Please try again.');
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
        deleteBarbershop,
    };
}
