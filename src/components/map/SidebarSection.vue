<template>
  <div class="sidebar-section">
    <button class="section-header" @click="open = !open" :aria-expanded="open">
      <span v-if="icon" class="section-icon-wrap" aria-hidden="true">
        <span class="material-symbols-outlined section-icon">{{ icon }}</span>
      </span>
      <span v-else class="section-accent"></span>
      <span class="section-title">{{ title }}</span>
      <span class="material-symbols-outlined section-chevron" :class="{ rotated: open }" aria-hidden="true">expand_more</span>
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
  icon?: string;
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
  color: #c4b8ae;
  cursor: pointer;
  text-align: left;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.2px;
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

.section-icon-wrap {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(217, 119, 87, 0.12);
  border-radius: 50%;
  flex-shrink: 0;
}

.section-icon {
  font-size: 15px;
  line-height: 1;
  color: #d97757;
}

.section-title {
  flex: 1;
}

.section-chevron {
  font-size: 18px;
  line-height: 1;
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
