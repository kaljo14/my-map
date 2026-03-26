<template>
  <div class="bottom-nav">
    <button class="nav-item active" aria-label="Map view">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <span>Map</span>
    </button>

    <button class="nav-item" aria-label="List view (coming soon)" disabled>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
      <span>List</span>
    </button>

    <button class="nav-item logout" @click="$emit('logout')" aria-label="Log out">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
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

.nav-item svg {
  width: 20px;
  height: 20px;
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
