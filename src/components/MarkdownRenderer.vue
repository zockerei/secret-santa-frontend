<template>
  <div 
    class="markdown-content prose prose-sm dark:prose-invert max-w-none"
    v-html="renderedMarkdown"
  ></div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

// Configure marked options
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true // GitHub Flavored Markdown
})

const renderedMarkdown = computed(() => {
  if (!props.content) return ''
  // Render markdown and sanitize HTML to prevent XSS
  const html = marked.parse(props.content)
  return DOMPurify.sanitize(html)
})
</script>

<style scoped>
.markdown-content :deep(h1) {
  @apply text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white;
}

.markdown-content :deep(h2) {
  @apply text-xl font-bold mt-3 mb-2 text-gray-900 dark:text-white;
}

.markdown-content :deep(h3) {
  @apply text-lg font-bold mt-2 mb-1 text-gray-900 dark:text-white;
}

.markdown-content :deep(p) {
  @apply mb-2 text-gray-700 dark:text-gray-200;
}

.markdown-content :deep(ul) {
  @apply list-disc list-inside mb-2 text-gray-700 dark:text-gray-200;
}

.markdown-content :deep(ol) {
  @apply list-decimal list-inside mb-2 text-gray-700 dark:text-gray-200;
}

.markdown-content :deep(li) {
  @apply mb-1;
}

.markdown-content :deep(strong) {
  @apply font-bold text-gray-900 dark:text-white;
}

.markdown-content :deep(em) {
  @apply italic;
}

.markdown-content :deep(code) {
  @apply bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono;
}

.markdown-content :deep(pre) {
  @apply bg-gray-200 dark:bg-gray-700 p-3 rounded mb-2 overflow-x-auto;
}

.markdown-content :deep(pre code) {
  @apply bg-transparent p-0;
}

.markdown-content :deep(a) {
  @apply text-blue-600 dark:text-blue-400 hover:underline;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-2;
}

.markdown-content :deep(hr) {
  @apply border-gray-300 dark:border-gray-600 my-4;
}
</style>

