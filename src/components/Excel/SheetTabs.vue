<template>
  <div class="flex items-center gap-1 overflow-x-auto pb-px scrollbar-none">
    <button
      v-for="sheet in sheets"
      :key="sheet.name"
      class="shrink-0 flex items-center gap-2 px-3.5 py-2 text-xs font-mono border-b-2 border-transparent text-gray-500 hover:text-gray-300 transition-colors duration-150 whitespace-nowrap"
      :class="{ 'tab-active': sheet.name === active }"
      @click="$emit('change', sheet.name)"
    >
      {{ sheet.name }}
      <span
        class="text-[10px] px-1.5 py-0.5 rounded-full font-mono leading-none"
        :class="sheet.name === active ? 'bg-accent-blue/20 text-accent-blue' : 'bg-surface-hover text-gray-600'"
      >
        {{ sheet.meta?.totalRows ?? sheet.rows?.length ?? 0 }}
      </span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  sheets: { type: Array, required: true },
  active: { type: String, default: null }
})
defineEmits(['change'])
</script>
