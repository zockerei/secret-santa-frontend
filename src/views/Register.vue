<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">🎄 Weihnachten</h1>
        <p class="text-gray-600 dark:text-gray-300">Erstelle dein Konto um loszulegen.</p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Registrieren</h2>
        
        <form @submit.prevent="handleRegister">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Joe"
            />
          </div>
          
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
          
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Passwort
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Mindestens 8 Zeichen</p>
          </div>
          
          <div class="mb-6">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>
          
          <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>
          
          <div v-if="success" class="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
            <p class="text-sm text-green-600 dark:text-green-400">{{ success }}</p>
          </div>
          
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-red-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Erstelle Konto...' : 'Registrieren' }}
          </button>
        </form>
        
        <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Bereits ein Konto? 
          <router-link to="/login" class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold">
            Anmelden
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
const { register } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

const handleRegister = async () => {
  try {
    loading.value = true
    error.value = ''
    success.value = ''
    
    // Validate passwords match
    if (password.value !== confirmPassword.value) {
      error.value = 'Passwörter stimmen nicht überein'
      loading.value = false
      return
    }
    
    await register({
      name: name.value,
      email: email.value,
      password: password.value
    })
    
    success.value = 'Konto erfolgreich erstellt! Weiterleitung zum Login...'
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
  } catch (err) {
    error.value = err.response?.data?.detail || 'Registrierung fehlgeschlagen. Bitte versuche es erneut.'
  } finally {
    loading.value = false
  }
}
</script>

