<template>
  <div class="flex items-center gap-1 overflow-x-auto pb-px scrollbar-none">
    <button
      v-for="sheet in sheets"
      :key="sheet.name"
      class="shrink-0 flex items-center gap-2 px-3.5 py-2 text-xs font-mono border-b-2 border-transparent transition-colors duration-150 whitespace-nowrap"
      :class="[
        sheet.name === active 
          ? 'tab-active' 
          : isDark 
            ? 'text-gray-500 hover:text-gray-300'
            : 'text-gray-600 hover:text-gray-800'
      ]"
      @click="$emit('change', sheet.name)"
    >
      {{ sheet.name }}
      <span
        class="text-[10px] px-1.5 py-0.5 rounded-full font-mono leading-none transition-colors"
        :class="sheet.name === active 
          ? 'bg-accent-blue/20 text-accent-blue' 
          : isDark 
            ? 'bg-surface-hover text-gray-600'
            : 'bg-surface-light-hover text-gray-700'
        "
      >
        {{ sheet.meta?.totalRows ?? sheet.rows?.length ?? 0 }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme.js'

const { isDark } = useTheme()

defineProps({
  sheets: { type: Array, required: true },
  active: { type: String, default: null }
})
defineEmits(['change'])
</script>
