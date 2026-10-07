<template>
  <BaseModal
    :show="show"
    title="Add Barbershop Location"
    stripe-gradient="linear-gradient(to right, #d97757, #c86843)"
    @cancel="$emit('cancel')"
  >
    <template #icon>
      <span class="material-symbols-outlined modal-icon" aria-hidden="true">content_cut</span>
    </template>

    <div class="form-group">
      <label>Barbershop Name:</label>
      <input
        :value="modelValue"
        type="text"
        placeholder="e.g. Cool Cuts"
        class="modal-input"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keyup.enter="$emit('save')"
      />
      <span class="form-hint">First pin a location on the map, then name it here.</span>
    </div>

    <template #confirm>
      <button class="save-btn" @click="$emit('save')">Save Barbershop</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '../ui/BaseModal.vue';

defineProps<{
  show: boolean;
  modelValue: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'cancel'): void;
  (e: 'save'): void;
}>();
</script>

<style scoped>
.modal-icon {
  font-size: 22px;
  line-height: 1;
  color: #d97757;
  flex-shrink: 0;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a4030;
  font-size: 0.9rem;
  font-weight: 500;
}

.modal-input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d5ccc0;
  background: #fff;
  color: #131314;
  font-size: 1rem;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #d97757;
  box-shadow: 0 0 0 3px rgba(217, 119, 87, 0.12);
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 0.8rem;
  color: #9d9080;
}

.save-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #d97757;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #c86843;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(217, 119, 87, 0.3);
}
</style>
