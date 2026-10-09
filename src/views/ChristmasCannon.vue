<template>
  <div class="fixed inset-0 overflow-hidden select-none bg-[#262a4f]">
    <div ref="canvasHost" class="absolute inset-0 cursor-crosshair"></div>

    <div class="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4">
      <Transition name="fade">
        <p
          v-if="message"
          :key="message"
          class="rounded-full bg-white/90 dark:bg-gray-800/90 px-5 py-2 text-center text-sm sm:text-base font-medium text-gray-900 dark:text-white shadow-lg"
        >
          {{ message }}
        </p>
      </Transition>
    </div>

    <div v-if="shots" class="absolute top-20 right-4 flex items-center gap-2">
      <span class="rounded-full bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm">
        🎁 {{ shots }}
      </span>
      <button class="btn btn-secondary bg-white/90 dark:bg-gray-800/90 shadow-sm" type="button" @click="clearRoom">
        Aufräumen
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { createChristmasCannon } from '../christmasCannon'

const canvasHost = ref(null)
const shots = ref(0)
const failed = ref(false)
let game = null

const message = computed(() => {
  if (failed.value) return 'Dein Browser unterstützt leider kein WebGL, das die Weihnachtskanone braucht.'
  if (shots.value === 0) return 'Klicke oder tippe, um die Weihnachtskanone abzufeuern. Gedrückt halten für Dauerfeuer!'
  if (shots.value >= 10 && shots.value < 15) return 'Ein Weihnachtsbaum! 🎄'
  if (shots.value >= 50 && shots.value < 55) return 'Ein Schneemann! ⛄'
  if (shots.value >= 100 && shots.value < 115) return 'Juhu, schon viel festlicher. Frohe Weihnachten! ✨'
  return ''
})

onMounted(() => {
  try {
    game = createChristmasCannon(canvasHost.value, { onShot: (count) => { shots.value = count } })
  } catch (error) {
    console.error('Christmas Cannon could not start:', error)
    failed.value = true
  }
})

onBeforeUnmount(() => game?.dispose())

function clearRoom() {
  game?.clear()
  shots.value = 0
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
