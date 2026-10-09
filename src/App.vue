<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-x-hidden">
    <!-- Navigation Bar -->
    <nav class="bg-white dark:bg-gray-800 shadow-xs sticky top-0 z-40 transition-colors">
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
            </template>
            
            <template v-else>
              <router-link
                to="/dashboard"
                class="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Dashboard
              </router-link>
              <router-link
                v-if="isAdmin"
                to="/admin"
                class="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Verwaltung
              </router-link>

              <div class="flex items-center space-x-3 border-l dark:border-gray-600 pl-3">
                <span class="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
                  {{ user?.name }}
                  <span v-if="isAdmin" class="ml-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-sm">
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
          </template>
          
          <template v-else>
            <div class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 mb-2">
              {{ user?.name }}
              <span v-if="isAdmin" class="ml-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-sm">
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
            <router-link
              v-if="isAdmin"
              @click="closeMobileMenu"
              to="/admin"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Verwaltung
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

      <!-- Christmas Lights hanging from navbar -->
      <ul class="lightrope" aria-hidden="true">
        <li v-for="n in 50" :key="n"></li>
      </ul>
    </nav>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useToast } from './composables/useToast'
import DarkModeToggle from './components/DarkModeToggle.vue'

const router = useRouter()
const { user, isAuthenticated, isAdmin, logout } = useAuth()
const { toasts, showToast } = useToast()

const mobileMenuOpen = ref(false)

const handleLogout = () => {
  logout()
  mobileMenuOpen.value = false
  router.push('/')
  showToast('Du bist abgemeldet')
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
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

/* Christmas Lights Rope
   li = socket, ::before = bulb (only the bulb's opacity is animated), ::after = wire to the next bulb */
.lightrope {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 80px; /* room for bulbs + glow; clips everything else */
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  justify-content: center; /* overflows evenly on both sides */
  overflow: hidden;
  pointer-events: none;
}

.lightrope li {
  --c: #dc2626; /* Red */
  position: relative;
  flex: none;
  width: 10px;
  height: 8px;
  margin: 0 21px; /* 52px per bulb */
  border-radius: 3px;
  background: #222;
}

.lightrope li:nth-child(3n+2) { --c: #16a34a; } /* Green */
.lightrope li:nth-child(3n)   { --c: #eab308; } /* Gold */

.lightrope li::before {
  content: "";
  position: absolute;
  top: 6px;
  left: -1px;
  width: 12px;
  height: 28px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 5px 24px 3px var(--c);
  animation: twinkle 1.6s ease-in-out infinite alternate;
}

.lightrope li:nth-child(2n)::before { animation-duration: 1.1s; }
.lightrope li:nth-child(3n)::before { animation-duration: 2s; }
.lightrope li:nth-child(4n+1)::before { animation-delay: -0.8s; }

.lightrope li::after {
  content: "";
  position: absolute;
  top: -8px;
  left: 5px;
  width: 52px;
  height: 18px;
  border-bottom: 2px solid #222;
  border-radius: 50%;
}

@keyframes twinkle {
  to { opacity: 0.35; }
}

@media (prefers-reduced-motion: reduce) {
  .lightrope li::before {
    animation: none;
    opacity: 0.8;
  }
}
</style>
