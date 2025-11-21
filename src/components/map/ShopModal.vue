<template>
  <div v-if="store.showShopModal" class="shop-modal-overlay">
    <div class="shop-modal">
      <h3>Add Barbershop Location</h3>
      <div class="form-group">
        <label>Barbershop Name:</label>
        <input 
          v-model="newShopName" 
          type="text" 
          placeholder="e.g. Cool Cuts"
          class="modal-input"
          ref="shopInput"
          @keyup.enter="saveShop"
        />
      </div>
      <div class="modal-actions">
        <button @click="cancelAddShop" class="cancel-btn">Cancel</button>
        <button @click="saveShop" class="save-btn">Save Barbershop</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMapStore } from '@/stores/mapStore';
import httpClient from "@/services/httpClient";

const store = useMapStore();
const newShopName = ref("");

const cancelAddShop = () => {
  store.setShowShopModal(false);
  store.setNewShopPin(null);
  store.toggleAddShopMode(); // Exit mode on cancel
};

const saveShop = async () => {
  if (!store.newShopPin) return;

  const shopData = {
    name: newShopName.value || "Untitled Barbershop",
    lat: store.newShopPin.lat,
    lng: store.newShopPin.lng,
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
    store.addUserShop({
      ...savedShop,
      timestamp: Date.now()
    });

    // Refresh the main barbershops list to include the newly added shop
    await store.fetchBarbershops();
  } catch (error) {
    console.error("Failed to save barbershop:", error);
    alert("Failed to save barbershop. Please try again.");
    return; // Don't close modal on error
  }

  store.setShowShopModal(false);
  store.setNewShopPin(null);
  store.toggleAddShopMode(); // Exit mode after saving
  newShopName.value = ""; // Reset name
};
</script>

<style scoped>
.shop-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.shop-modal {
  background: #1e293b;
  padding: 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.shop-modal h3 {
  margin: 0 0 20px;
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.6);
  color: white;
  font-size: 1rem;
  margin-bottom: 24px;
}

.modal-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: transparent;
  color: #cbd5e0;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: rgba(148, 163, 184, 0.1);
  color: white;
}

.save-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.2s;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}
</style>
