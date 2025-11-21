<template>
  <div v-if="show" class="shop-modal-overlay">
    <div class="shop-modal">
      <h3>⚠️ Confirm Deletion</h3>
      <p class="confirm-message">Are you sure you want to delete <strong>{{ shopName }}</strong>?</p>
      <p class="confirm-warning">This action cannot be undone.</p>
      <div class="modal-actions">
        <button @click="$emit('cancel')" class="cancel-btn">Cancel</button>
        <button @click="$emit('confirm')" class="delete-btn">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  show: boolean;
  shopName?: string;
}>();

defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm'): void;
}>();
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

.confirm-message {
  color: #e2e8f0;
  margin-bottom: 8px;
  font-size: 1rem;
}

.confirm-warning {
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 24px;
  font-weight: 500;
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

.delete-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  transition: all 0.2s;
}

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}
</style>
