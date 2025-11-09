<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-br from-red-50 to-green-50 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden" style="min-height: 100vh; min-height: 100dvh;">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">🎄 Weihnachten</h1>
        <p class="text-gray-600 dark:text-gray-300">Willkommen zurück! Bitte melde dich an.</p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Anmelden</h2>
        
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-Mail
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="deine@email.com"
            />
          </div>
          
          <div class="mb-6">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Passwort
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>
          
          <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>
          
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-red-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Anmeldung läuft...' : 'Anmelden' }}
          </button>
        </form>
        
        <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Noch kein Konto? 
          <router-link to="/register" class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold">
            Registrieren
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('🔐 Attempting login with:', email.value)
    
    await login({
      email: email.value,
      password: password.value
    })
    
    console.log('✅ Login successful, redirecting to dashboard')
    
    // Redirect to dashboard
    router.push('/dashboard')
  } catch (err) {
    // Log the full error for debugging
    console.error('❌ Login failed:', err)
    
    // Try to get the most specific error message
    if (err.response) {
      // Backend responded with an error
      const detail = err.response.data?.detail || err.response.data?.message
      error.value = detail || `Login failed: ${err.response.status} ${err.response.statusText}`
    } else if (err.request) {
      // No response from backend
      error.value = 'Cannot connect to server'
    } else {
      error.value = err.message || 'Login failed. Please try again.'
    }
    
    console.error('💬 Error shown to user:', error.value)
  } finally {
    loading.value = false
  }
}
</script>
