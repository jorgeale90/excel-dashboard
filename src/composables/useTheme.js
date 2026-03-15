import { ref, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'

const theme = useStorage('theme', 'dark')
const systemTheme = ref('dark')

// Detect system theme
if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemTheme.value = mediaQuery.matches ? 'dark' : 'light'
  mediaQuery.addEventListener('change', (e) => {
    systemTheme.value = e.matches ? 'dark' : 'light'
  })
}

export function useTheme() {
  const isDark = computed(() => {
    if (theme.value === 'system') {
      return systemTheme.value === 'dark'
    }
    return theme.value === 'dark'
  })

  const setTheme = (newTheme) => {
    theme.value = newTheme
    updateDocumentClass()
  }

  const toggleTheme = () => {
    if (theme.value === 'dark') {
      setTheme('light')
    } else if (theme.value === 'light') {
      setTheme('system')
    } else {
      setTheme('dark')
    }
  }

  const updateDocumentClass = () => {
    const root = document.documentElement
    
    // Add no-transition class to prevent flicker
    root.classList.add('no-transition')
    
    root.classList.remove('dark', 'light')
    
    if (theme.value === 'system') {
      root.classList.add(systemTheme.value)
    } else {
      root.classList.add(theme.value)
    }
    
    // Force reflow
    root.offsetHeight
    
    // Remove no-transition class after a frame
    requestAnimationFrame(() => {
      root.classList.remove('no-transition')
    })
  }

  // Initialize on first load
  updateDocumentClass()

  // Watch for system theme changes when using 'system' theme
  watch([theme, systemTheme], updateDocumentClass)

  return {
    theme: computed(() => theme.value),
    isDark,
    setTheme,
    toggleTheme
  }
}
