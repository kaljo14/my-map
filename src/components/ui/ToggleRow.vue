<template>
  <button
    :class="['toggle-row', `toggle-row--${variant}`, { active: modelValue }]"
    :disabled="disabled"
    @click="$emit('toggle')"
  >
    <span v-if="icon || $slots.icon" class="toggle-row-icon">
      <slot name="icon">{{ icon }}</slot>
    </span>
    <span class="toggle-row-label">
      <slot>{{ label }}</slot>
    </span>
    <slot name="trailing">
      <TogglePill :model-value="modelValue" :size="pillSize" />
    </slot>
  </button>
</template>

<script setup lang="ts">
import TogglePill from './TogglePill.vue';

const props = defineProps<{
  modelValue: boolean;
  label?: string;
  icon?: string;
  variant?: 'sidebar' | 'control';
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'toggle'): void;
}>();

const pillSize = props.variant === 'control' ? 'md' : 'sm';
</script>

<style scoped>
/* ── Shared base ─────────────────────────────────────────── */
.toggle-row {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.toggle-row:disabled {
  opacity: 0.6;
  cursor: default;
}

.toggle-row-label {
  flex: 1;
  font-weight: 500;
  letter-spacing: 0.1px;
}

/* ── Sidebar variant (dark panel) ────────────────────────── */
.toggle-row--sidebar {
  padding: 9px 10px;
  border-radius: 9px;
  border: 1px solid transparent;
  color: #5a5048;
  font-size: 0.875rem;
}

.toggle-row--sidebar:hover {
  background: rgba(245, 240, 232, 0.05);
  border-color: rgba(245, 240, 232, 0.06);
  color: #a89e94;
}

.toggle-row--sidebar.active {
  color: #c4b8ae;
  background: rgba(245, 240, 232, 0.04);
}

.toggle-row--sidebar .toggle-row-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}

.toggle-row--sidebar .toggle-row-icon svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.toggle-row--sidebar .toggle-row-icon .material-symbols-outlined {
  font-size: 18px;
  line-height: 1;
}


/* ── Control variant (light popover) ─────────────────────── */
.toggle-row--control {
  padding: 0;
  border-radius: 0;
  color: #131314;
  font-size: 14px;
}

.toggle-row--control:hover {
  background: transparent;
}

.toggle-row--control .toggle-row-label {
  font-weight: 600;
  font-size: 14px;
  color: #131314;
}
</style>
