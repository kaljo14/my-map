<template>
  <div v-if="show" class="shop-modal-overlay">
    <div class="shop-modal">
      <h3>Add Barbershop Location</h3>
      <div class="form-group">
        <label>Barbershop Name:</label>
        <input 
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="text" 
          placeholder="e.g. Cool Cuts"
          class="modal-input"
          ref="shopInput"
          @keyup.enter="$emit('save')"
        />
      </div>
      <div class="modal-actions">
        <button @click="$emit('cancel')" class="cancel-btn">Cancel</button>
        <button @click="$emit('save')" class="save-btn">Save Barbershop</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">


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
  margin: 0 0 20px;
  color: #131314;
  font-size: 1.25rem;
  font-weight: 700;
}

.form-group {
  margin-bottom: 24px;
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

.save-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #131314;
  color: #f5f0e8;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #2a2a2b;
  transform: translateY(-1px);
}
</style>
