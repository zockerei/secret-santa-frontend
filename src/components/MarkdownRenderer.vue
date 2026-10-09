<template>
  <div 
    class="markdown-content"
    v-html="renderedMarkdown"
  ></div>
</template>

<script setup>
import { computed } from 'vue'
import { renderMarkdown } from '../markdown'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const renderedMarkdown = computed(() => renderMarkdown(props.content))
</script>
