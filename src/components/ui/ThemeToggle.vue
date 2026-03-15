<template>
  <div class="relative">
    <button
      @click="toggleTheme"
      class="btn-ghost p-2 rounded-lg"
      :title="`Tema actual: ${themeLabel}. Click para cambiar`"
    >
      <!-- Sun Icon -->
      <svg v-if="theme === 'light'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      
      <!-- Moon Icon -->
      <svg v-else-if="theme === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      
      <!-- Computer Icon -->
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </button>
    
    <!-- Tooltip -->
    <div class="absolute top-full right-0 mt-2 px-2 py-1 rounded text-xs opacity-0 pointer-events-none transition-opacity duration-200 hover:opacity-100"
         :class="isDark ? 'bg-surface-card border border-surface-border text-gray-400' : 'bg-surface-light-card border border-surface-light-border text-gray-600'">
      {{ themeLabel }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme.js'

const { theme, toggleTheme, isDark } = useTheme()

const themeLabel = computed(() => {
  if (theme.value === 'light') return 'Modo claro'
  if (theme.value === 'dark') return 'Modo oscuro'
  return 'Sistema'
})
</script>
