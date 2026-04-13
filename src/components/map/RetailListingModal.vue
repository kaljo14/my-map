<template>
  <BaseModal
    :show="show"
    title="Add Retail Listing"
    stripe-gradient="linear-gradient(to right, #0d9488, #0f766e)"
    @cancel="$emit('close')"
  >
    <template #icon>
      <span class="material-symbols-outlined modal-icon" aria-hidden="true">storefront</span>
    </template>

    <div class="form-fields">
      <div class="form-group">
        <label for="listing-title">Title <span class="required">*</span></label>
        <input
          id="listing-title"
          v-model="form.title"
          type="text"
          placeholder="e.g. Retail space on Vitosha Blvd"
          class="modal-input"
          required
        />
      </div>

      <div class="form-group">
        <label for="listing-address">Address</label>
        <input
          id="listing-address"
          v-model="form.address"
          type="text"
          placeholder="e.g. ul. Vitosha 42"
          class="modal-input"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="listing-size">Size m&sup2;</label>
          <input
            id="listing-size"
            v-model.number="form.size_sqm"
            type="number"
            min="0"
            placeholder="e.g. 120"
            class="modal-input"
          />
        </div>

        <div class="form-group">
          <label for="listing-price">Price &euro;/month</label>
          <input
            id="listing-price"
            v-model.number="form.price_eur"
            type="number"
            min="0"
            placeholder="e.g. 1500"
            class="modal-input"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="listing-url">Listing URL</label>
        <input
          id="listing-url"
          v-model="form.listing_url"
          type="url"
          placeholder="https://..."
          class="modal-input"
        />
      </div>

      <div class="form-group">
        <label for="listing-gmaps">Google Maps Link</label>
        <input
          id="listing-gmaps"
          v-model="form.google_maps_url"
          type="url"
          placeholder="https://maps.google.com/..."
          class="modal-input"
        />
        <span class="form-hint">Paste a Google Maps link if you found the location there.</span>
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input
            v-model="form.is_exact"
            type="checkbox"
            class="modal-checkbox"
          />
          <span>Exact location</span>
        </label>
        <span class="form-hint">Uncheck if the pin is only neighborhood-level accurate.</span>
      </div>
    </div>

    <template #confirm>
      <button class="save-btn" :disabled="!form.title.trim()" @click="onSave">Save Listing</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import BaseModal from '../ui/BaseModal.vue';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', data: { title: string; address?: string; size_sqm?: number; price_eur?: number; listing_url?: string; google_maps_url?: string; is_exact: boolean }): void;
  (e: 'close'): void;
}>();

const form = reactive({
  title: '',
  address: '',
  size_sqm: undefined as number | undefined,
  price_eur: undefined as number | undefined,
  listing_url: '',
  google_maps_url: '',
  is_exact: true,
});

// Reset form when modal opens
watch(() => props.show, (val) => {
  if (val) {
    form.title = '';
    form.address = '';
    form.size_sqm = undefined;
    form.price_eur = undefined;
    form.listing_url = '';
    form.google_maps_url = '';
    form.is_exact = true;
  }
});

function onSave() {
  if (!form.title.trim()) return;
  emit('save', {
    title: form.title.trim(),
    address: form.address.trim() || undefined,
    size_sqm: form.size_sqm || undefined,
    price_eur: form.price_eur || undefined,
    listing_url: form.listing_url.trim() || undefined,
    google_maps_url: form.google_maps_url.trim() || undefined,
    is_exact: form.is_exact,
  });
}
</script>

<style scoped>
.modal-icon {
  font-size: 22px;
  line-height: 1;
  color: #0d9488;
  flex-shrink: 0;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: #4a4030;
  font-size: 0.85rem;
  font-weight: 500;
}

.required {
  color: #c05e3a;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d5ccc0;
  background: #fff;
  color: #131314;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}

.checkbox-group {
  gap: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a4030;
  font-weight: 500;
}

.modal-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #0d9488;
  cursor: pointer;
}

.form-hint {
  font-size: 0.78rem;
  color: #9d9080;
}

.save-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #0d9488;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #0f766e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
