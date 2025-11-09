<template>
  <div class="christmas-cannon-container" :class="{ 'game-active': isGameActive }">
    <div id="canvas-container"></div>
    <div id="loading" v-if="isLoading">Loading</div>
    
    <!-- Hidden UI elements required by cannon.js -->
    <div id="ui" style="display: none;">
      <img id="steve" src="" alt="" style="display: none;" />
      <div id="bubble" class="speech-bubble" style="display: none;">
        <p id="text"></p>
        <p id="text-highlight"></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChristmasCannon',
  data() {
    return {
      isLoading: true,
      isGameActive: false
    }
  },
  mounted() {
    this.initializeGame()
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    initializeGame() {
      try {
        // Load the script dynamically since it uses CDN imports
        const script = document.createElement('script')
        script.type = 'module'
        script.src = '/cannon.js'
        script.onload = () => {
          setTimeout(() => {
            this.isLoading = false
          }, 1000)
        }
        script.onerror = (error) => {
          console.error('Failed to load Christmas Cannon:', error)
          console.error('Attempted to load from:', script.src)
          this.isLoading = false
        }
        document.head.appendChild(script)
      } catch (error) {
        console.error('Failed to load Christmas Cannon:', error)
        this.isLoading = false
      }
    },
    cleanup() {
      // Call the global cleanup function from cannon.js
      if (window.cleanupChristmasCannon) {
        window.cleanupChristmasCannon()
      }

      // Cleanup Three.js and physics resources
      const canvasContainer = document.getElementById('canvas-container')
      if (canvasContainer) {
        canvasContainer.innerHTML = ''
      }

      // Remove any event listeners that were added
      document.removeEventListener('keypress', this.handleClick)
      document.removeEventListener('click', this.handleClick)
      document.removeEventListener('mousemove', this.handleMouseMove)
    },
    handleClick() {
      this.isGameActive = true
    },
    handleMouseMove() {
      this.isGameActive = true
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');

* {
  font-family: 'Fredoka One', sans-serif;
}

.christmas-cannon-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Fredoka One', sans-serif;
  background: linear-gradient(to left, #ddd, #eee);
}

#canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}

#loading {
  position: absolute;
  background-color: #3A3F69;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-family: 'Fredoka One', cursive;
}

/* Game cursor when active */
.game-active {
  cursor: url(https://assets.codepen.io/557388/crosshair.svg) 41 41, auto;
}

/* Deep selector for dynamically created elements */
:deep(.game) {
  cursor: url(https://assets.codepen.io/557388/crosshair.svg) 41 41, auto;
}

/* Hide Steve and speech bubble UI elements */
:deep(#ui),
:deep(#steve),
:deep(#bubble),
:deep(.speech-bubble) {
  display: none !important;
  visibility: hidden !important;
}
</style>

