<template>
  <div class="info-row">
    <strong>{{ label }}</strong>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()
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
