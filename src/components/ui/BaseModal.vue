<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal-overlay"
        tabindex="-1"
        @keyup.escape="$emit('cancel')"
      >
        <div class="modal-box" role="dialog" :aria-label="title">
          <div class="modal-stripe" :style="{ background: stripeGradient }"></div>

          <h3 class="modal-title">
            <slot name="icon" />
            {{ title }}
          </h3>

          <div class="modal-body">
            <slot />
          </div>

          <div class="modal-actions">
            <button class="cancel-btn" @click="$emit('cancel')">
              {{ cancelText ?? 'Cancel' }}
            </button>
            <slot name="confirm" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  title: string;
  stripeGradient: string;
  cancelText?: string;
}>();

defineEmits<{
  (e: 'cancel'): void;
}>();
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(19, 19, 20, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(6px);
}

.modal-box {
  background: #f5f0e8;
  padding: 28px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 24px 48px rgba(19, 19, 20, 0.2);
  border: 1px solid #e0d8cc;
  overflow: hidden;
  position: relative;
}

.modal-stripe {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
}

.modal-title {
  margin: 0 0 20px;
  color: #131314;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-body {
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #d5ccc0;
  background: transparent;
  color: #6b6057;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #ede7dc;
  color: #131314;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.96) translateY(8px);
  opacity: 0;
}
</style>
