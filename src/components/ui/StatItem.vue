<template>
  <div class="stat-item" :class="{ 'is-inline': inline }">
    <span class="stat-value"><slot /></span>
    <span v-if="label" class="stat-label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  inline?: boolean
}>(), { inline: false })
</script>

<style scoped>
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item.is-inline {
  flex-direction: row;
  gap: var(--stat-gap, 4px);
}

/* In inline mode label sits left of value */
.stat-item.is-inline .stat-label {
  order: -1;
}

.stat-value {
  font-size: var(--stat-value-size, 0.9rem);
  font-weight: var(--stat-value-weight, 700);
  font-family: var(--stat-value-font, inherit);
  color: var(--stat-value-color, #f5f0e8);
  line-height: var(--stat-value-line-height, 1);
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: var(--stat-label-size, 0.8rem);
  font-weight: var(--stat-label-weight, 500);
  color: var(--stat-label-color, #8a7e72);
  text-transform: var(--stat-label-transform, none);
  letter-spacing: var(--stat-label-spacing, normal);
  margin-top: var(--stat-label-gap, 0px);
}
</style>
