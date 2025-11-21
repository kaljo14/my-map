<template>
  <div v-if="isAuthenticated">
    <RouterView />
  </div>
  <div v-else class="loading">
    <p>Authenticating...</p>
  </div>
</template>

<script setup lang="ts">
import auth from './services/auth';

const { isAuthenticated } = auth;
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
