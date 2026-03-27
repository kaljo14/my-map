<template>
  <span
    class="toggle-pill"
    :class="{ on: modelValue, 'toggle-pill--md': size === 'md' }"
    aria-hidden="true"
  ></span>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  size?: 'sm' | 'md';
}>();
</script>

<style scoped>
.toggle-pill {
  display: inline-block;
  width: 34px;
  height: 18px;
  border-radius: 9px;
  background: rgba(245, 240, 232, 0.12);
  position: relative;
  flex-shrink: 0;
  transition: background 0.25s;
}

.toggle-pill::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #5a5048;
  transition: transform 0.25s, background 0.25s;
}

.toggle-pill.on {
  background: rgba(34, 197, 94, 0.25);
}

.toggle-pill.on::after {
  transform: translateX(16px);
  background: #16a34a;
}

/* md variant — light surface (MapControls) */
.toggle-pill--md {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: #c9bfb4;
}

.toggle-pill--md::after {
  width: 18px;
  height: 18px;
  background: #f5f0e8;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.toggle-pill--md.on {
  background: #d97757;
}

.toggle-pill--md.on::after {
  transform: translateX(18px);
  background: #f5f0e8;
}
</style>
