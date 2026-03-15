<template>
  <div class="flex items-center justify-center" :class="[containerClass, sizeClass]">
    <svg 
      class="animate-spin" 
      :class="[colorClass, sizeClass]"
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        d="M4 12a8 8 0 018-8v8H4z" 
        opacity="0.25"
      />
      <path 
        d="M4 12a8 8 0 018-8v8H4z" 
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span v-if="text" class="ml-2 text-sm font-mono" :class="textClass">
      {{ text }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme.js'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'blue'
  },
  centered: {
    type: Boolean,
    default: false
  }
})

const { isDark } = useTheme()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-4 h-4'
    case 'md': return 'w-6 h-6'
    case 'lg': return 'w-8 h-8'
    default: return 'w-6 h-6'
  }
})

const colorClass = computed(() => {
  const colors = {
    blue: 'text-accent-blue',
    green: 'text-accent-green',
    red: 'text-accent-red',
    amber: 'text-accent-amber',
    gray: isDark.value ? 'text-gray-400' : 'text-gray-600'
  }
  return colors[props.color] || colors.blue
})

const textClass = computed(() => {
  return isDark.value ? 'text-gray-400' : 'text-gray-600'
})

const containerClass = computed(() => {
  return props.centered ? 'w-full h-full' : ''
})
</script>
