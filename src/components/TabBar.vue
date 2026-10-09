<template>
  <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
    <nav class="-mb-px flex space-x-8 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        @click="active = tab.id"
        :class="[
          'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
          active === tab.id
            ? 'border-red-500 text-red-600 dark:text-red-400'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
        ]"
      >
        {{ tab.label }}
      </button>
    </nav>
  </div>
</template>

<script setup>
// tabs: [{ id, label }], v-model: the id of the active tab
defineProps({
  tabs: {
    type: Array,
    required: true
  }
})

const active = defineModel({ type: String, required: true })
</script>
