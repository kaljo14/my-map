<template>
  <div class="signin-page">
    <SignIn routing="path" path="/sign-in" :fallback-redirect-url="'/map'" />
  </div>
</template>

<script setup lang="ts">
import { SignIn } from '@clerk/vue'
</script>

<style scoped>
.signin-page {
  min-height: 100vh;
  background: #08090C;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
