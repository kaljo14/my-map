<template>
  <div class="panel-header">
    <div class="header-left">
      <span v-if="icon" class="header-icon">{{ icon }}</span>
      <span class="panel-title">{{ title }}</span>
    </div>
    <button class="close-btn" :title="closeTitle" @click="emit('close')">×</button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  icon?: string
  closeTitle?: string
}>(), {
  closeTitle: 'Close',
})

const emit = defineEmits<{ close: [] }>()
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 12px;
  border-bottom: 1px solid rgba(245, 240, 232, 0.07);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 0.95rem;
  color: #10b981;
}

.panel-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f5f0e8;
  letter-spacing: 0.2px;
}

.close-btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: 1px solid rgba(245, 240, 232, 0.1);
  background: rgba(245, 240, 232, 0.04);
  color: #8a7e72;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 1;
  padding: 0;
  transition: all 0.15s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}
</style>
