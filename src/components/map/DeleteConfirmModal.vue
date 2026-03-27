<template>
  <BaseModal
    :show="show"
    title="Confirm Deletion"
    stripe-gradient="linear-gradient(to right, #c05e3a, #a84e2e)"
    @cancel="$emit('cancel')"
  >
    <template #icon>
      <span class="material-symbols-outlined warning-icon" aria-hidden="true">warning</span>
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
  font-size: 22px;
  line-height: 1;
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
