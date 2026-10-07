<template>
  <div class="checkbox-group">
    <label
      v-for="item in items"
      :key="item.value"
      class="checkbox-item"
    >
      <input
        type="checkbox"
        :checked="checkedItems.includes(item.value)"
        @change="$emit('change', item.value)"
      />
      <span v-if="item.color" class="color-dot" :style="{ backgroundColor: item.color }"></span>
      <span class="checkbox-label">{{ item.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
export interface CheckboxItem {
  value: string;
  label: string;
  color?: string;
}

defineProps<{
  items: CheckboxItem[];
  checkedItems: string[];
}>();

defineEmits<{
  (e: 'change', value: string): void;
}>();
</script>

<style scoped>
.checkbox-group {
  margin-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
  padding-left: 8px;
  border-left: 2px solid rgba(245, 240, 232, 0.1);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8rem;
  padding: 4px;
  color: #8a7e72;
  cursor: pointer;
  user-select: none;
}

.checkbox-item input[type='checkbox'] {
  accent-color: #d97757;
  cursor: pointer;
  flex-shrink: 0;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(245, 240, 232, 0.15);
  flex-shrink: 0;
}

.checkbox-label {
  flex: 1;
}
</style>
