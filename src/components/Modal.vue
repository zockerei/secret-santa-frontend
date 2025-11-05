<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div
        :class="[
          'relative inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle w-full',
          size === 'large' ? 'sm:max-w-4xl' : 'sm:max-w-lg'
        ]"
      >
        <div class="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4">
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              <slot name="title"></slot>
            </h3>
            <button
              @click="$emit('close')"
              class="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="mt-2">
            <slot name="content"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'large'].includes(value)
  }
})

defineEmits(['close'])
</script>

