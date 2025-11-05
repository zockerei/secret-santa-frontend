import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function useToast() {
  const showToast = (message, type = 'success', duration = 3000) => {
    const id = nextId++
    const toast = {
      id,
      message,
      type
    }
    
    toasts.value.push(toast)
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
  
  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  return {
    toasts,
    showToast,
    removeToast
  }
}
