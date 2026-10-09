<template>
  <Modal @close="$emit('close')">
    <template #title>{{ title }}</template>
    <template #content>
      <div class="space-y-4">
        <p class="text-gray-700 dark:text-gray-300">{{ message }}</p>
        <ErrorMessage :message="error" />
        <div class="flex justify-end gap-2">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Abbrechen</button>
          <button type="button" class="btn btn-primary" :disabled="busy" @click="confirm">
            {{ busy ? 'Moment...' : confirmLabel }}
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'
import ErrorMessage from './ErrorMessage.vue'

// Runs `action` when confirmed. Closes on success, shows the error otherwise.
const props = defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'OK' },
  action: { type: Function, required: true }
})

const emit = defineEmits(['close'])

const busy = ref(false)
const error = ref('')

async function confirm() {
  busy.value = true
  error.value = ''
  try {
    await props.action()
    emit('close')
  } catch (err) {
    error.value = err.message
  } finally {
    busy.value = false
  }
}
</script>
