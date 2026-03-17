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
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(19, 19, 20, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(6px);
}

.shop-modal {
  background: #f5f0e8;
  padding: 28px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 24px 48px rgba(19, 19, 20, 0.2);
  border: 1px solid #e0d8cc;
}

.shop-modal h3 {
  margin: 0 0 16px;
  color: #131314;
  font-size: 1.25rem;
  font-weight: 700;
}

.confirm-message {
  color: #4a4030;
  margin-bottom: 8px;
  font-size: 1rem;
}

.confirm-warning {
  color: #c05e3a;
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
  border: 1px solid #d5ccc0;
  background: transparent;
  color: #6b6057;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #ede7dc;
  color: #131314;
}

.delete-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #c05e3a;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #a84e2e;
  transform: translateY(-1px);
}
</style>
