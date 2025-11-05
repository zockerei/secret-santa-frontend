<template>
  <button
    @click="toggleDarkMode"
    class="relative inline-flex items-center justify-center w-14 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    :class="darkMode ? 'bg-gray-700' : 'bg-yellow-400'"
    aria-label="Toggle dark mode"
  >
    <!-- Moon Icon (Dark Mode) -->
    <span
      class="absolute left-1 transition-all duration-300"
      :class="darkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-50'"
    >
      🌙
    </span>
    
    <!-- Sun Icon (Light Mode) -->
    <span
      class="absolute right-1 transition-all duration-300"
      :class="!darkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-50'"
    >
      ☀️
    </span>
    
    <!-- Toggle Circle -->
    <span
      class="absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300"
      :class="darkMode ? 'translate-x-6' : 'translate-x-0'"
      style="left: 4px;"
    ></span>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const darkMode = ref(false)

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  
  if (darkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', 'true')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', 'false')
  }
}

// Initialize dark mode from localStorage
onMounted(() => {
  const savedMode = localStorage.getItem('darkMode')
  if (savedMode === 'true') {
    darkMode.value = true
    document.documentElement.classList.add('dark')
  } else if (savedMode === 'false') {
    darkMode.value = false
    document.documentElement.classList.remove('dark')
  } else {
    // Default to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    darkMode.value = prefersDark
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    }
  }
})
</script>

