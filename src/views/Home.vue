<template>
  <div class="min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="mb-6">
          <span class="text-6xl sm:text-8xl">🎄</span>
        </div>
        <h1 class="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-red-600 via-yellow-600 to-green-600 bg-clip-text text-transparent dark:from-red-400 dark:via-yellow-400 dark:to-green-400">
          Frohe Weihnachten
        </h1>
        <p class="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto font-light">
          Eine besinnliche Zeit mit Familie und Freunden
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <router-link
            to="/login"
            class="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white px-10 py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Anmelden
          </router-link>
          <router-link
            to="/register"
            class="w-full sm:w-auto bg-white dark:bg-gray-800 text-red-700 dark:text-red-400 px-10 py-4 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition border-2 border-red-600 dark:border-red-700 shadow-lg"
          >
            Registrieren
          </router-link>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div class="grid md:grid-cols-3 gap-8 mt-20">
        <router-link 
          to="/christmas-cannon"
          class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition border-t-4 border-red-500 cursor-pointer block"
        >
          <div class="text-5xl mb-4">🎄</div>
          <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Christmas Cannon</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Schmücke den Raum mit Weihnachtsdeko!
          </p>
        </router-link>
        
        <router-link 
          to="/let-it-draw"
          class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition border-t-4 border-yellow-500 cursor-pointer block"
        >
          <div class="text-5xl mb-4">⭐</div>
          <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Let it draw</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Weihnachtszeichnung
          </p>
        </router-link>
        
        <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center transform hover:scale-105 transition border-t-4 border-green-600">
          <div class="text-5xl mb-4">🕯️</div>
          <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Besinnlich</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Ruhe und Gemütlichkeit genießen
          </p>
        </div>
      </div>

      <!-- Christmas Quote -->
      <div class="mt-20 text-center">
        <div class="inline-block bg-gradient-to-r from-red-100 to-green-100 dark:from-red-900/30 dark:to-green-900/30 p-8 rounded-3xl shadow-xl">
          <p class="text-2xl italic text-gray-700 dark:text-gray-200 mb-4">
            "Weihnachten ist die Zeit, in der Kinder ganz brav sind – zumindest solange der Weihnachtsmann zuschaut"
          </p>
          <div class="flex justify-center space-x-2 text-3xl">
            <span>❄️</span>
            <span>🎄</span>
            <span>⭐</span>
            <span>🎁</span>
            <span>❄️</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Simple Christmas-themed homepage
</script>
