<template>
  <div
    :class="[
      'border-l-4 p-4 rounded-sm',
      mine
        ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-400 dark:border-blue-500'
        : 'bg-yellow-50 dark:bg-yellow-900/40 border-yellow-400 dark:border-yellow-500'
    ]"
  >
    <p :class="['text-sm font-medium mb-2', mine ? 'text-blue-800 dark:text-blue-300' : 'text-yellow-800 dark:text-yellow-300']">
      {{ title }}
    </p>
    <MarkdownRenderer v-if="content" :content="content" />
    <p v-else class="text-sm text-gray-500 dark:text-gray-400 italic">Keine Wunschliste angegeben</p>
  </div>
</template>

<script setup>
import MarkdownRenderer from './MarkdownRenderer.vue'

defineProps({
  title: { type: String, required: true },
  content: { type: String, default: null },
  // Your own wish list is blue, someone else's yellow
  mine: { type: Boolean, default: false }
})
</script>
