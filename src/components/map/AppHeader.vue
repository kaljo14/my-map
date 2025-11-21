<template>
  <header class="app-header">
    <div class="header-left">
      <h1>Barbershop Maps</h1>
    </div>
    <div class="auth-controls">
      <button v-if="!isAuthenticated" @click="login" class="auth-btn login">Login</button>
      <div v-else class="user-info">
        <span class="username">{{ userProfile?.username || 'User' }}</span>
        <button @click="logout" class="auth-btn logout">Logout</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import auth from "@/services/auth";

const { isAuthenticated, userProfile, login, logout } = auth;
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
  z-index: 2000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.header-left h1 {
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.auth-controls {
  display: flex;
  justify-content: flex-end;
}

.auth-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
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
  background: rgba(148, 163, 184, 0.1);
  color: #cbd5e0;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.auth-btn.logout:hover {
  background: rgba(148, 163, 184, 0.2);
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
