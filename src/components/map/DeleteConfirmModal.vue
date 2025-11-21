<template>
  <div v-if="store.showDeleteConfirm" class="shop-modal-overlay">
    <div class="shop-modal">
      <h3>⚠️ Confirm Deletion</h3>
      <p class="confirm-message">Are you sure you want to delete <strong>{{ store.shopToDelete?.name }}</strong>?</p>
      <p class="confirm-warning">This action cannot be undone.</p>
      <div class="modal-actions">
        <button @click="cancelDelete" class="cancel-btn">Cancel</button>
        <button @click="deleteBarbershop" class="delete-btn">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMapStore } from '@/stores/mapStore';
import httpClient from "@/services/httpClient";

const store = useMapStore();

const cancelDelete = () => {
  store.setShowDeleteConfirm(false);
  store.setShopToDelete(null);
};

const deleteBarbershop = async () => {
  if (!store.shopToDelete) return;

  const placeId = store.shopToDelete.place_id;
  
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/places';
    const response = await httpClient.delete(`${apiBaseUrl}/api/barbershops/${placeId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`Barbershop ${store.shopToDelete.name} deleted successfully`);

    // Refresh the barbershops list
    await store.fetchBarbershops();
    
    // Close the confirmation dialog
    store.setShowDeleteConfirm(false);
    store.setShopToDelete(null);
  } catch (error) {
    console.error('Failed to delete barbershop:', error);
    alert('Failed to delete barbershop. Please try again.');
  }
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

.confirm-message {
  font-size: 1rem;
  color: #1a202c;
  margin-bottom: 12px;
  line-height: 1.5;
}

.confirm-message strong {
  color: #dc2626;
}

.confirm-warning {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 24px;
  font-style: italic;
}

.delete-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  transition: all 0.2s;
}

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
}
</style>
