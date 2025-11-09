<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <!-- Navigation Bar -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center px-3 py-2 text-gray-900 dark:text-white font-semibold text-xl">
              🎄 Weihnachten
            </router-link>
          </div>
          
          <!-- Desktop Navigation Links -->
          <div class="hidden md:flex items-center space-x-2 sm:space-x-4">
            <!-- Dark Mode Toggle -->
            <DarkModeToggle />
            <template v-if="!isAuthenticated">
              <router-link
                to="/login"
                class="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Anmelden
              </router-link>
              <router-link
                to="/register"
                class="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Registrieren
              </router-link>
            </template>
            
            <template v-else>
              <router-link
                to="/dashboard"
                class="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Dashboard
              </router-link>
              
              <div class="flex items-center space-x-3 border-l dark:border-gray-600 pl-3">
                <span class="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
                  {{ user?.name }}
                  <span v-if="isAdmin" class="ml-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">
                    Admin
                  </span>
                </span>
                <button
                  @click="handleLogout"
                  class="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Abmelden
                </button>
              </div>
            </template>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center space-x-2">
            <DarkModeToggle />
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-700 py-2">
          <template v-if="!isAuthenticated">
            <router-link
              @click="closeMobileMenu"
              to="/login"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Anmelden
            </router-link>
            <router-link
              @click="closeMobileMenu"
              to="/register"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Registrieren
            </router-link>
          </template>
          
          <template v-else>
            <div class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 mb-2">
              {{ user?.name }}
              <span v-if="isAdmin" class="ml-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
            <router-link
              @click="closeMobileMenu"
              to="/dashboard"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Dashboard
            </router-link>
            <button
              @click="handleLogout"
              class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Abmelden
            </button>
          </template>
        </div>
      </div>
    </nav>
    
    <!-- Christmas Lights hanging from navbar -->
    <ul class="lightrope">
      <li v-for="n in 42" :key="n"></li>
    </ul>
    
    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 left-4 md:left-auto z-50 space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 md:px-6 py-3 md:py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out w-full md:max-w-sm',
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
        ]"
      >
        <div class="flex items-center gap-3">
          <span v-if="toast.type === 'success'" class="text-xl md:text-2xl">✓</span>
          <span v-else class="text-xl md:text-2xl">✕</span>
          <p class="font-medium text-sm md:text-base">{{ toast.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useToast } from './composables/useToast'
import DarkModeToggle from './components/DarkModeToggle.vue'

const route = useRoute()
const { user, isAuthenticated, isAdmin, logout, initAuth, loadUser } = useAuth()
const { toasts, showToast } = useToast()

const mobileMenuOpen = ref(false)

const handleLogout = () => {
  logout()
  showToast('Successfully logged out!', 'success')
  mobileMenuOpen.value = false
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

onMounted(() => {
  initAuth()
  if (isAuthenticated.value) {
    loadUser()
  }
})
</script>

<style>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Christmas Lights Rope */
.lightrope {
  text-align: center;
  white-space: nowrap;
  overflow: visible;
  position: sticky;
  z-index: 35;
  margin: 0;
  padding: 0;
  pointer-events: none;
  width: 100%;
  top: 4rem; /* 64px - height of navbar */
  left: 0;
  list-style: none;
  height: 0;
  line-height: 0;
}

.lightrope li {
  position: relative;
  animation-fill-mode: both;
  animation-iteration-count: infinite;
  list-style: none;
  margin: 0;
  padding: 0;
  display: inline-block;
  width: 12px;
  height: 28px;
  border-radius: 50%;
  margin: 0 20px;
  background: rgba(220, 38, 38, 1); /* Red */
  box-shadow: 0px 4.67px 24px 3px rgba(220, 38, 38, 1);
  animation-name: flash-1;
  animation-duration: 2s;
  vertical-align: top;
}

.lightrope li:nth-child(2n+1) {
  background: rgba(22, 163, 74, 1); /* Green */
  box-shadow: 0px 4.67px 24px 3px rgba(22, 163, 74, 1);
  animation-name: flash-2;
  animation-duration: 0.4s;
}

.lightrope li:nth-child(4n+2) {
  background: rgba(234, 179, 8, 1); /* Gold */
  box-shadow: 0px 4.67px 24px 3px rgba(234, 179, 8, 1);
  animation-name: flash-3;
  animation-duration: 1.1s;
}

.lightrope li:nth-child(odd) {
  animation-duration: 1.8s;
}

.lightrope li:nth-child(3n+1) {
  animation-duration: 1.4s;
}

.lightrope li:before {
  content: "";
  position: absolute;
  background: #222;
  width: 10px;
  height: 9.33px;
  border-radius: 3px;
  top: -4.67px;
  left: 1px;
}

.lightrope li:after {
  content: "";
  top: -14px;
  left: 9px;
  position: absolute;
  width: 52px;
  height: 18.67px;
  border-bottom: solid #222 2px;
  border-radius: 50%;
}

.lightrope li:last-child:after {
  content: none;
}

.lightrope li:first-child {
  margin-left: -40px;
}

@keyframes flash-1 {
  0%, 100% {
    background: rgba(220, 38, 38, 1); /* Red */
    box-shadow: 0px 4.67px 24px 3px rgba(220, 38, 38, 1);
  }
  50% {
    background: rgba(220, 38, 38, 0.4);
    box-shadow: 0px 4.67px 24px 3px rgba(220, 38, 38, 0.2);
  }
}

@keyframes flash-2 {
  0%, 100% {
    background: rgba(22, 163, 74, 1); /* Green */
    box-shadow: 0px 4.67px 24px 3px rgba(22, 163, 74, 1);
  }
  50% {
    background: rgba(22, 163, 74, 0.4);
    box-shadow: 0px 4.67px 24px 3px rgba(22, 163, 74, 0.2);
  }
}

@keyframes flash-3 {
  0%, 100% {
    background: rgba(234, 179, 8, 1); /* Gold */
    box-shadow: 0px 4.67px 24px 3px rgba(234, 179, 8, 1);
  }
  50% {
    background: rgba(234, 179, 8, 0.4);
    box-shadow: 0px 4.67px 24px 3px rgba(234, 179, 8, 0.2);
  }
}
</style>
