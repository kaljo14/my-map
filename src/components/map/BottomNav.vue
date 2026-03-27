<template>
  <div class="bottom-nav">
    <button class="nav-item active" aria-label="Map view">
      <span class="material-symbols-outlined" aria-hidden="true">map</span>
      <span>Map</span>
    </button>

    <button class="nav-item" aria-label="List view (coming soon)" disabled>
      <span class="material-symbols-outlined" aria-hidden="true">list</span>
      <span>List</span>
    </button>

    <button class="nav-item logout" @click="$emit('logout')" aria-label="Log out">
      <span class="material-symbols-outlined" aria-hidden="true">logout</span>
      <span>Logout</span>
    </button>
  </div>
</template>

<script setup lang="ts">

defineEmits<{
  (e: 'logout'): void;
}>();
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 64px;
  background: rgba(22, 27, 22, 0.96);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(245, 240, 232, 0.08);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 3000;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #5a5048;
  gap: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  touch-action: manipulation;
  position: relative;
}

.nav-item .material-symbols-outlined {
  font-size: 22px;
  line-height: 1;
}

.nav-item span {
  font-size: 10px;
  font-weight: 500;
}

.nav-item.active {
  color: #d97757;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background: #d97757;
}

.nav-item:active { transform: scale(0.95); }

.nav-item.logout { color: #c05e3a; }

.nav-item:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
