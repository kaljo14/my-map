<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo">💈</div>
      <h1 class="app-title">Barbershop Analysis</h1>
    </div>

    <div class="header-right">
      <div class="auth-controls">
        <button v-if="!isAuthenticated" @click="$emit('login')" class="auth-btn login">
          {{ $t('common.login') }}
        </button>
        <div v-else class="user-info">
          <div class="user-avatar" :title="userProfile?.username || 'User'" aria-hidden="true">
            {{ (userProfile?.username || 'U')[0].toUpperCase() }}
          </div>
          <span class="username">{{ userProfile?.username || 'User' }}</span>
          <button @click="$emit('logout')" class="auth-btn logout">
            {{ $t('common.logout') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">

defineProps<{
  isAuthenticated: boolean;
  userProfile: any;
}>();

defineEmits<{
  (e: 'login'): void;
  (e: 'logout'): void;
}>();
</script>

<style scoped>
.app-header {
  height: 64px;
  background: #161B16;
  border-bottom: 1px solid rgba(245, 240, 232, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  color: #f5f0e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  z-index: 2000;
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-size: 24px;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f5f0e8;
  letter-spacing: -0.5px;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.auth-controls {
  display: flex;
  align-items: center;
}

.auth-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.auth-btn.login {
  background: #d97757;
  color: #f5f0e8;
  box-shadow: 0 2px 8px rgba(217, 119, 87, 0.3);
}

.auth-btn.login:hover {
  background: #c86843;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(217, 119, 87, 0.4);
}

.auth-btn.logout {
  background: rgba(245, 240, 232, 0.06);
  color: #a89e94;
  border: 1px solid rgba(245, 240, 232, 0.12);
}

.auth-btn.logout:hover {
  background: rgba(245, 240, 232, 0.1);
  color: #f5f0e8;
  border-color: rgba(245, 240, 232, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(217, 119, 87, 0.2);
  border: 1px solid rgba(217, 119, 87, 0.4);
  color: #d97757;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.username {
  color: #c4b8ae;
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
