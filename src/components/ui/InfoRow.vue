<template>
  <div class="info-row">
    <strong>
      <span v-if="icon" class="material-symbols-outlined row-icon">{{ icon }}</span>{{ label }}
    </strong>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; icon?: string }>()
</script>

<style scoped>
.info-row {
  font-size: 0.9rem;
  color: #4a4030;
  line-height: 1.4;
}

.info-row strong {
  color: #131314;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.row-icon {
  font-size: 15px;
  line-height: 1;
  flex-shrink: 0;
}

:slotted(a) {
  color: #d97757;
  text-decoration: none;
}

:slotted(a:hover) {
  color: #c05e3a;
  text-decoration: underline;
}
</style>
