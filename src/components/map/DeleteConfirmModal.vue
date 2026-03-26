<template>
  <BaseModal
    :show="show"
    title="Confirm Deletion"
    stripe-gradient="linear-gradient(to right, #c05e3a, #a84e2e)"
    @cancel="$emit('cancel')"
  >
    <template #icon>
      <svg class="warning-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </template>

    <div class="danger-block">
      <p class="confirm-message">Are you sure you want to delete <strong>{{ shopName }}</strong>?</p>
      <p class="confirm-warning">This action cannot be undone.</p>
    </div>

    <template #confirm>
      <button class="delete-btn" @click="$emit('confirm')">Delete</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '../ui/BaseModal.vue';

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
.warning-icon {
  width: 20px;
  height: 20px;
  color: #c05e3a;
  flex-shrink: 0;
}

.danger-block {
  border-left: 3px solid #c05e3a;
  padding: 10px 12px;
  background: rgba(192, 94, 58, 0.06);
  border-radius: 0 6px 6px 0;
}

.confirm-message {
  color: #4a4030;
  margin: 0 0 6px;
  font-size: 1rem;
}

.confirm-warning {
  color: #c05e3a;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
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
