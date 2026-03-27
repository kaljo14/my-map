import { ref } from 'vue'

export const isLoaded = ref(false)
export const isAuthenticated = ref(false)
export const userProfile = ref<{
  username: string
  email: string
  firstName: string
  lastName: string
} | null>(null)

// Called by App.vue via useAuth() watch — keeps refs in sync with Clerk state
export function syncAuthState(signedIn: boolean, user: any, loaded: boolean) {
  isLoaded.value = loaded
  isAuthenticated.value = signedIn
  if (user) {
    userProfile.value = {
      username: user.username ?? user.fullName ?? '',
      email: user.primaryEmailAddress?.emailAddress ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    }
  } else {
    userProfile.value = null
  }
}

export function login() {
  window.location.href = '/sign-in'
}

export function logout() {
  window.Clerk?.signOut()
}

export async function getToken(): Promise<string | null> {
  return (await window.Clerk?.session?.getToken()) ?? null
}

export function getTokenSync(): string | undefined {
  return (window.Clerk?.session as any)?.lastActiveToken?.getRawString()
}

export default { isLoaded, isAuthenticated, userProfile, syncAuthState, login, logout, getToken, getTokenSync }
