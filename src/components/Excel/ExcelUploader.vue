<template>
  <div class="relative group"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <div
      class="relative flex flex-col items-center justify-center gap-3 p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer"
      :class="[
        isDragging 
          ? 'border-accent-blue bg-accent-blue/5' 
          : isDark 
            ? 'border-surface-border bg-surface-hover hover:border-gray-600' 
            : 'border-surface-light-border bg-surface-light-hover hover:border-gray-400'
      ]"
      @click="$refs.fileInput.click()"
    >
      <!-- Upload icon -->
      <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors duration-300"
           :class="isDragging ? 'bg-accent-blue text-accent-blue' : isDark ? 'bg-surface-card text-gray-400' : 'bg-surface-light-card text-gray-500'">
        <svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
      </div>

      <div class="text-center">
        <p class="text-sm sm:text-base font-display font-medium mb-1" :class="isDark ? 'text-white' : 'text-gray-900'">
          {{ isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo Excel aquí' }}
        </p>
        <p class="text-xs sm:text-sm font-mono" :class="isDark ? 'text-gray-500' : 'text-gray-600'">
          o haz click para seleccionar
        </p>
        <p class="text-xs font-mono mt-2" :class="isDark ? 'text-gray-600' : 'text-gray-500'">
          Máximo 50 MB • .xlsx, .xls
        </p>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="store.loading" class="absolute inset-0 bg-surface/80 flex items-center justify-center rounded-2xl">
      <div class="flex flex-col items-center gap-3">
        <svg class="w-8 h-8 text-accent-blue animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <p class="text-sm font-mono" :class="isDark ? 'text-gray-400' : 'text-gray-600'">Procesando archivo...</p>
      </div>
    </div>

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
  
  try {
    await store.loadExcel(file)
  } catch (error) {
    localError.value = error.message || 'Error al procesar el archivo'
  }
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
