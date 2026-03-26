<template>
  <div class="sidebar-section">
    <button class="section-header" @click="open = !open" :aria-expanded="open">
      <span class="section-accent"></span>
      <span class="section-title">{{ title }}</span>
      <svg
        class="section-chevron"
        :class="{ rotated: open }"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <Transition name="section-slide">
      <div v-show="open" class="section-body">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
  defaultOpen?: boolean;
}>();

const open = ref(props.defaultOpen ?? true);
</script>

<style scoped>
.sidebar-section {
  border-top: 1px solid rgba(245, 240, 232, 0.07);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 0;
  color: #8a7e72;
  cursor: pointer;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  transition: color 0.2s, background 0.2s;
  user-select: none;
}

.section-header:hover {
  color: #c4b8ae;
  background: rgba(245, 240, 232, 0.04);
}

.section-header:focus-visible {
  outline: 2px solid #d97757;
  outline-offset: -2px;
}

.section-accent {
  width: 3px;
  height: 12px;
  background: #d97757;
  border-radius: 2px;
  flex-shrink: 0;
  opacity: 0.7;
}

.section-title {
  flex: 1;
}

.section-chevron {
  width: 14px;
  height: 14px;
  color: #5a5048;
  transition: transform 0.22s ease, color 0.2s;
  flex-shrink: 0;
  opacity: 0.6;
}

.section-chevron.rotated {
  transform: rotate(180deg);
  color: #8a7e72;
  opacity: 1;
}

.section-body {
  padding: 0 16px 16px;
}

/* Slide animation */
.section-slide-enter-active,
.section-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: top;
}
.section-slide-enter-from,
.section-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
