<template>
  <div
    class="relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-5 transition-all duration-200 cursor-pointer"
    :class="[
      isDark ? 'border-surface-border' : 'border-surface-light-border',
      { 'drop-zone-active': isDragging }
    ]"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="fileInput.click()"
  >
    <!-- Icon -->
    <div class="w-16 h-16 rounded-2xl border flex items-center justify-center transition-transform duration-200"
         :class="[
           isDark ? 'bg-surface-hover border-surface-border' : 'bg-surface-light-hover border-surface-light-border',
           { 'scale-110 border-accent-blue/50': isDragging }
         ]">
      <svg class="w-8 h-8 transition-colors duration-200" 
           :class="isDragging ? '!text-accent-blue' : (isDark ? 'text-gray-500' : 'text-gray-600')"
           fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
      </svg>
    </div>

    <div class="text-center">
      <p class="font-display font-bold text-lg" :class="isDark ? 'text-white' : 'text-gray-900'">
        {{ isDragging ? 'Suelta el archivo aquí' : 'Sube tu archivo Excel' }}
      </p>
      <p class="text-sm mt-1 font-body" :class="isDark ? 'text-gray-500' : 'text-gray-600'">Arrastra un .xlsx o haz click para seleccionar</p>
    </div>

    <!-- Supported formats -->
    <div class="flex items-center gap-3">
      <span class="badge-blue">.xlsx</span>
      <span class="badge-blue">.xls</span>
    </div>

    <!-- Error message -->
    <transition name="fade">
      <div v-if="localError" class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        {{ localError }}
      </div>
    </transition>

    <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="onFileChange" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useExcelStore } from '@/stores/excelStore.js'
import { useTheme } from '@/composables/useTheme.js'

const store = useExcelStore()
const { isDark } = useTheme()
const fileInput = ref(null)
const isDragging = ref(false)
const localError = ref(null)

const ALLOWED = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']

function validate(file) {
  if (!file) return 'No se seleccionó ningún archivo'
  if (!ALLOWED.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
    return 'Solo se aceptan archivos .xlsx o .xls'
  }
  if (file.size > 50 * 1024 * 1024) return 'El archivo no debe superar 50 MB'
  return null
}

async function processFile(file) {
  localError.value = validate(file)
  if (localError.value) return
  await store.loadExcel(file)
  if (store.error) localError.value = store.error
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) processFile(file)
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) processFile(file)
}
</script>
