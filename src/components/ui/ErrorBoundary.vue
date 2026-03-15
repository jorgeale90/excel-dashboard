<template>
  <div v-if="hasError" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <div class="w-16 h-16 rounded-full bg-accent-red/10 flex items-center justify-center">
      <svg class="w-8 h-8 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
    </div>
    <div class="text-center max-w-md">
      <h2 class="text-lg font-display font-bold mb-2" :class="isDark ? 'text-white' : 'text-gray-900'">
        Algo salió mal
      </h2>
      <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        {{ error?.message || 'Ha ocurrido un error inesperado' }}
      </p>
    </div>
    <button 
      @click="reset"
      class="btn-ghost px-4 py-2"
      :class="isDark ? 'bg-surface-hover text-white' : 'bg-surface-light-hover text-gray-900'"
    >
      Reintentar
    </button>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useTheme } from '@/composables/useTheme.js'

const { isDark } = useTheme()
const hasError = ref(false)
const error = ref(null)

onErrorCaptured((err) => {
  console.error('Error capturado:', err)
  error.value = err
  hasError.value = true
  return false
})

function reset() {
  hasError.value = false
  error.value = null
}
</script>
