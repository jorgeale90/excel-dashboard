<template>
  <div class="card flex flex-col gap-3 hover:border-gray-600 transition-colors duration-200">
    <div class="flex items-start justify-between">
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center"
        :class="colorMap[color]?.bg"
      >
        <slot name="icon">
          <svg class="w-4 h-4" :class="colorMap[color]?.text" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        </slot>
      </div>
      <span v-if="badge" class="text-xs font-mono" :class="badgeClass">{{ badge }}</span>
    </div>

    <div>
      <p class="text-xs text-gray-500 font-body mb-1">{{ label }}</p>
      <p class="text-2xl font-display font-bold text-white leading-none">{{ formattedValue }}</p>
      <p v-if="subtitle" class="text-xs text-gray-600 font-mono mt-1.5">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label:    { type: String, required: true },
  value:    { type: [Number, String], default: 0 },
  color:    { type: String, default: 'blue' },   // blue | green | red | amber
  badge:    { type: String, default: null },
  subtitle: { type: String, default: null },
  format:   { type: String, default: 'currency' } // currency | number | raw
})

const colorMap = {
  blue:  { bg: 'bg-accent-blue/15',   text: 'text-accent-blue'   },
  green: { bg: 'bg-accent-green/15',  text: 'text-accent-green'  },
  red:   { bg: 'bg-accent-red/15',    text: 'text-accent-red'    },
  amber: { bg: 'bg-accent-amber/15',  text: 'text-accent-amber'  },
  purple:{ bg: 'bg-accent-purple/15', text: 'text-accent-purple' }
}

const badgeClass = computed(() => ({
  blue:  'badge-blue',
  green: 'badge-green',
  red:   'badge-red',
  amber: 'badge-amber'
}[props.color] || 'badge-blue'))

const formattedValue = computed(() => {
  const num = Number(props.value)
  if (props.format === 'raw') return props.value
  if (props.format === 'number') return num.toLocaleString('es-MX')
  if (isNaN(num)) return props.value
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num)
})
</script>
