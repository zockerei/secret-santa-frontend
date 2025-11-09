<template>
  <div class="min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- SVG Filters for Electric Border -->
    <svg class="absolute w-0 h-0">
      <defs>
        <filter id="electric-displace" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
          <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
            <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
          </feOffset>
          
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
          <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
            <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
          </feOffset>
          
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="2" />
          <feOffset in="noise1" dx="0" dy="0" result="offsetNoise3">
            <animate attributeName="dx" values="490; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
          </feOffset>
          
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="2" />
          <feOffset in="noise2" dx="0" dy="0" result="offsetNoise4">
            <animate attributeName="dx" values="0; -490" dur="6s" repeatCount="indefinite" calcMode="linear" />
          </feOffset>
          
          <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
          <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
          <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />
          
          <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="20" xChannelSelector="R" yChannelSelector="B" />
        </filter>
      </defs>
    </svg>

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

      <!-- Decorative Elements with Electric Borders -->
      <div class="grid md:grid-cols-3 gap-8 mt-20">
        <!-- Christmas Cannon Card with Red Electric Border -->
        <router-link 
          to="/christmas-cannon"
          class="electric-card electric-red block cursor-pointer"
        >
          <div class="electric-inner">
            <div class="electric-border-outer">
              <div class="electric-main-border"></div>
            </div>
            <div class="electric-glow-1"></div>
            <div class="electric-glow-2"></div>
          </div>
          <div class="electric-overlay-1"></div>
          <div class="electric-overlay-2"></div>
          <div class="electric-bg-glow"></div>
          
          <div class="electric-content">
            <div class="text-5xl mb-4">🎄</div>
            <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Christmas Cannon</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Schmücke den Raum mit Weihnachtsdeko
            </p>
          </div>
        </router-link>
        
        <!-- Let it draw Card with Gold Electric Border -->
        <router-link 
          to="/let-it-draw"
          class="electric-card electric-gold block cursor-pointer"
        >
          <div class="electric-inner">
            <div class="electric-border-outer">
              <div class="electric-main-border"></div>
            </div>
            <div class="electric-glow-1"></div>
            <div class="electric-glow-2"></div>
          </div>
          <div class="electric-overlay-1"></div>
          <div class="electric-overlay-2"></div>
          <div class="electric-bg-glow"></div>
          
          <div class="electric-content">
            <div class="text-5xl mb-4">⭐</div>
            <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Let it draw</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Weihnachtszeichnung
            </p>
          </div>
        </router-link>
        
        <!-- Besinnlich Card with Green Electric Border -->
        <router-link 
          to="/christmas-music"
          class="electric-card electric-green block cursor-pointer"
        >
          <div class="electric-inner">
            <div class="electric-border-outer">
              <div class="electric-main-border"></div>
            </div>
            <div class="electric-glow-1"></div>
            <div class="electric-glow-2"></div>
          </div>
          <div class="electric-overlay-1"></div>
          <div class="electric-overlay-2"></div>
          <div class="electric-bg-glow"></div>
          
          <div class="electric-content">
            <div class="text-5xl mb-4">🎵</div>
            <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Weihnachtsmusik</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Visualisierte Musik
            </p>
          </div>
        </router-link>
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
<style scoped>
/* Electric Card Base Styles */
.electric-card {
  padding: 2px;
  border-radius: 1.5rem;
  position: relative;
  transform: scale(1);
  transition: transform 0.3s ease;
  background: linear-gradient(
    -30deg,
    rgba(255, 255, 255, 0.1),
    transparent,
    rgba(255, 255, 255, 0.1)
  );
}

.electric-card:hover {
  transform: scale(1.05);
}

/* Inner Container */
.electric-inner {
  position: relative;
}

/* Border Outer Layer */
.electric-border-outer {
  border-radius: 1.5rem;
  padding-right: 4px;
  padding-bottom: 4px;
}

/* Main Border with Animation */
.electric-main-border {
  width: 100%;
  min-height: 280px;
  border-radius: 1.5rem;
  border: 2px solid;
  margin-top: -4px;
  margin-left: -4px;
  filter: url(#electric-displace);
  background: white;
}

.dark .electric-main-border {
  background: rgb(31, 41, 55);
}

/* Glow Layers */
.electric-glow-1,
.electric-glow-2 {
  border: 2px solid;
  border-radius: 1.5rem;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.electric-glow-1 {
  filter: blur(1px);
  opacity: 0.6;
}

.electric-glow-2 {
  filter: blur(4px);
  opacity: 0.8;
}

/* Overlay Effects */
.electric-overlay-1,
.electric-overlay-2 {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 1.5rem;
  mix-blend-mode: overlay;
  transform: scale(1.1);
  filter: blur(16px);
  background: linear-gradient(
    -30deg,
    white,
    transparent 30%,
    transparent 70%,
    white
  );
  pointer-events: none;
}

.electric-overlay-1 {
  opacity: 1;
}

.electric-overlay-2 {
  opacity: 0.5;
}

/* Background Glow */
.electric-bg-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 1.5rem;
  filter: blur(32px);
  transform: scale(1.1);
  opacity: 0.3;
  z-index: -1;
  pointer-events: none;
}

/* Content Container */
.electric-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  pointer-events: none;
}

/* Red Christmas Theme */
.electric-red .electric-border-outer {
  border: 2px solid rgba(220, 38, 38, 0.5);
}

.electric-red .electric-main-border {
  border-color: rgb(220, 38, 38);
}

.electric-red .electric-glow-1 {
  border-color: rgba(220, 38, 38, 0.6);
}

.electric-red .electric-glow-2 {
  border-color: rgb(252, 165, 165);
}

.electric-red .electric-bg-glow {
  background: linear-gradient(
    -30deg,
    rgb(252, 165, 165),
    transparent,
    rgb(220, 38, 38)
  );
}

/* Gold Christmas Theme */
.electric-gold .electric-border-outer {
  border: 2px solid rgba(234, 179, 8, 0.5);
}

.electric-gold .electric-main-border {
  border-color: rgb(234, 179, 8);
}

.electric-gold .electric-glow-1 {
  border-color: rgba(234, 179, 8, 0.6);
}

.electric-gold .electric-glow-2 {
  border-color: rgb(253, 224, 71);
}

.electric-gold .electric-bg-glow {
  background: linear-gradient(
    -30deg,
    rgb(253, 224, 71),
    transparent,
    rgb(234, 179, 8)
  );
}

/* Green Christmas Theme */
.electric-green .electric-border-outer {
  border: 2px solid rgba(22, 163, 74, 0.5);
}

.electric-green .electric-main-border {
  border-color: rgb(22, 163, 74);
}

.electric-green .electric-glow-1 {
  border-color: rgba(22, 163, 74, 0.6);
}

.electric-green .electric-glow-2 {
  border-color: rgb(134, 239, 172);
}

.electric-green .electric-bg-glow {
  background: linear-gradient(
    -30deg,
    rgb(134, 239, 172),
    transparent,
    rgb(22, 163, 74)
  );
}
</style>
