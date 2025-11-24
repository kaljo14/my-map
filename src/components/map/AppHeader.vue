<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo">💈</div>
      <h1 class="app-title">Barbershop Analysis</h1>
    </div>

    <div class="header-center">
      <button 
        @click="$emit('toggleAnalysisGrid')"
        class="nav-btn"
        :class="{ active: showAnalysisGrid }"
      >
        <span class="icon">🗺️</span>
        Analysis Grid
      </button>
    </div>
    
    <div class="header-right">
      <div class="auth-controls">
        <button v-if="!isAuthenticated" @click="$emit('login')" class="auth-btn login">
          Login
        </button>
        <div v-else class="user-info">
          <span class="username">{{ userProfile?.username || 'User' }}</span>
          <button @click="$emit('logout')" class="auth-btn logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  isAuthenticated: boolean;
  userProfile: any;
  showAnalysisGrid?: boolean;
}>();

defineEmits<{
  (e: 'login'): void;
  (e: 'login'): void;
  (e: 'logout'): void;
  (e: 'toggleAnalysisGrid'): void;
}>();
</script>

<style scoped>
.app-header {
  height: 64px;
  background: #0f172a;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
  color: #f8fafc;
  letter-spacing: -0.5px;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-btn {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #cbd5e0;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: rgba(30, 41, 59, 0.8);
  color: white;
  border-color: rgba(148, 163, 184, 0.4);
}

.nav-btn.active {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  border-color: #6366f1;
}

.nav-btn .icon {
  font-size: 1.1em;
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
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.auth-btn.login:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.auth-btn.logout {
  background: rgba(30, 41, 59, 0.5);
  color: #cbd5e0;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.auth-btn.logout:hover {
  background: rgba(30, 41, 59, 0.8);
  color: white;
  border-color: rgba(148, 163, 184, 0.4);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
