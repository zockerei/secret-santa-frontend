<template>
  <div class="markdown-editor">
    <!-- Tab buttons -->
    <div class="flex border-b border-gray-300 dark:border-gray-600 mb-3">
      <button
        type="button"
        @click="activeTab = 'edit'"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'edit'
            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        ✏️ Edit
      </button>
      <button
        type="button"
        @click="activeTab = 'preview'"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'preview'
            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        👁️ Preview
      </button>
    </div>

    <!-- Edit tab -->
    <div v-show="activeTab === 'edit'">
      <textarea
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :rows="rows"
        :required="required"
        :placeholder="placeholder"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
      ></textarea>
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p class="font-medium mb-1">💡 Markdown Formatting:</p>
        <div class="grid grid-cols-2 gap-1">
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">**bold**</code> → <strong>bold</strong></span>
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">*italic*</code> → <em>italic</em></span>
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded"># Heading</code> → Large text</span>
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">- List item</code> → Bullet list</span>
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">[link](url)</code> → Clickable link</span>
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">`code`</code> → Inline code</span>
        </div>
      </div>
    </div>

    <!-- Preview tab -->
    <div v-show="activeTab === 'preview'">
      <div
        v-if="modelValue && modelValue.trim()"
        class="markdown-preview prose prose-sm dark:prose-invert max-w-none min-h-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-md"
        v-html="renderedMarkdown"
      ></div>
      <div
        v-else
        class="min-h-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500 italic"
      >
        No content to preview
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 15
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const activeTab = ref('edit')

// Configure marked options
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true // GitHub Flavored Markdown
})

const renderedMarkdown = computed(() => {
  if (!props.modelValue) return ''
  // Render markdown and sanitize HTML to prevent XSS
  const html = marked.parse(props.modelValue)
  return DOMPurify.sanitize(html)
})
</script>

<style scoped lang="postcss">
/* Add some basic styling for the markdown preview */
.markdown-preview :deep(h1) {
  @apply text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white;
}

.markdown-preview :deep(h2) {
  @apply text-xl font-bold mt-3 mb-2 text-gray-900 dark:text-white;
}

.markdown-preview :deep(h3) {
  @apply text-lg font-bold mt-2 mb-1 text-gray-900 dark:text-white;
}

.markdown-preview :deep(p) {
  @apply mb-2 text-gray-700 dark:text-gray-200;
}

.markdown-preview :deep(ul) {
  @apply list-disc list-inside mb-2 text-gray-700 dark:text-gray-200;
}

.markdown-preview :deep(ol) {
  @apply list-decimal list-inside mb-2 text-gray-700 dark:text-gray-200;
}

.markdown-preview :deep(li) {
  @apply mb-1;
}

.markdown-preview :deep(strong) {
  @apply font-bold text-gray-900 dark:text-white;
}

.markdown-preview :deep(em) {
  @apply italic;
}

.markdown-preview :deep(code) {
  @apply bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono;
}

.markdown-preview :deep(pre) {
  @apply bg-gray-200 dark:bg-gray-700 p-3 rounded mb-2 overflow-x-auto;
}

.markdown-preview :deep(pre code) {
  @apply bg-transparent p-0;
}

.markdown-preview :deep(a) {
  @apply text-blue-600 dark:text-blue-400 hover:underline;
}

.markdown-preview :deep(blockquote) {
  @apply border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-2;
}

.markdown-preview :deep(hr) {
  @apply border-gray-300 dark:border-gray-600 my-4;
}
</style>

