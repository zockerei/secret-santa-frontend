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
        ✏️ Schreiben
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
        👁️ Vorschau
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
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-sm"
      ></textarea>
      <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p class="font-medium mb-1">💡 Formatierung:</p>
        <div class="grid grid-cols-2 gap-1">
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded-sm">**fett**</code> → <strong>fett</strong></span>
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded-sm">*kursiv*</code> → <em>kursiv</em></span>
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded-sm"># Überschrift</code> → Große Schrift</span>
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded-sm">- Punkt</code> → Aufzählung</span>
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded-sm">[Link](url)</code> → Klickbarer Link</span>
          <span><code class="bg-gray-100 dark:bg-gray-800 px-1 rounded-sm">`Code`</code> → Code</span>
        </div>
      </div>
    </div>

    <!-- Preview tab -->
    <div v-show="activeTab === 'preview'">
      <div
        v-if="modelValue && modelValue.trim()"
        class="markdown-content min-h-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-md"
        v-html="renderedMarkdown"
      ></div>
      <div
        v-else
        class="min-h-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500 italic"
      >
        Noch nichts geschrieben
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { renderMarkdown } from '../markdown'

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

const renderedMarkdown = computed(() => renderMarkdown(props.modelValue))
</script>
