<script setup lang="ts">
import { watch } from 'vue'
import { useAuth, useUser } from '@clerk/vue'
import auth from './services/auth'

const { isLoaded, isSignedIn } = useAuth()
const { user } = useUser()

watch([isLoaded, isSignedIn, user], ([loaded, signedIn, u]) => {
  auth.syncAuthState(signedIn ?? false, u, loaded ?? false)
}, { immediate: true })
</script>

<template>
  <RouterView />
</template>

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
