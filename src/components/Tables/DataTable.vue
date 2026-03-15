<template>
  <div class="flex flex-col gap-3">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <!-- Search -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" :class="isDark ? 'text-gray-500' : 'text-gray-600'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar..."
          class="pl-8 pr-3 py-1.5 border rounded-lg text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-accent-blue/50 w-full sm:w-52"
          :class="isDark ? 'bg-surface-hover border-surface-border text-white' : 'bg-surface-light-hover border-surface-light-border text-gray-900 placeholder-gray-500'"
        />
      </div>

      <div class="flex items-center gap-2 text-xs font-mono" :class="isDark ? 'text-gray-500' : 'text-gray-600'">
        <span>{{ filteredRows.length }} de {{ rows.length }} filas</span>
        <select
          v-model="pageSize"
          class="border rounded-lg px-2 py-1 text-xs font-mono focus:outline-none"
          :class="isDark ? 'bg-surface-hover border-surface-border text-white' : 'bg-surface-light-hover border-surface-light-border text-gray-900'"
        >
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Table container -->
    <div 
      class="overflow-auto rounded-xl border max-h-[50vh] sm:max-h-[60vh] transition-colors duration-300" 
      :class="isDark ? 'border-surface-border' : 'border-surface-light-border'"
      tabindex="0"
      @keydown="handleKeydown"
      role="grid"
      aria-label="Tabla de datos"
      :aria-rowcount="paginatedRows.length + 1"
      :aria-colcount="columns.length"
    >
      <table class="data-table w-full text-xs font-mono border-collapse min-w-[600px]">
        <!-- Head -->
        <thead class="sticky top-0 z-10">
          <tr class="border-b transition-colors duration-300" :class="isDark ? 'bg-surface-card border-surface-border' : 'bg-surface-light-card border-surface-light-border'" role="row">
            <th
              v-for="(col, index) in columns"
              :key="col"
              class="px-3 py-2.5 text-left font-body font-semibold tracking-wide whitespace-nowrap cursor-pointer select-none transition-colors"
              :class="isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
              @click="toggleSort(col)"
              role="columnheader"
              :aria-sort="sortCol === col ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'"
              :aria-label="`Columna ${col}, ${sortCol === col ? (sortDir === 'asc' ? 'ordenada ascendente' : 'ordenada descendente') : 'click para ordenar'}`"
            >
              <span class="flex items-center gap-1.5">
                {{ col }}
                <span class="transition-colors" :class="isDark ? 'text-gray-600' : 'text-gray-500'">
                  <svg v-if="sortCol === col && sortDir === 'asc'" class="w-3 h-3 text-accent-blue" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
                  <svg v-else-if="sortCol === col && sortDir === 'desc'" class="w-3 h-3 text-accent-blue" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                  <svg v-else class="w-3 h-3 opacity-20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 9l4-4 4 4M8 15l4 4 4-4"/></svg>
                </span>
              </span>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody>
          <tr v-if="paginatedRows.length === 0">
            <td :colspan="columns.length" class="text-center py-12" :class="isDark ? 'text-gray-600' : 'text-gray-500'">
              Sin resultados
            </td>
          </tr>
          <tr
            v-for="(row, i) in paginatedRows"
            :key="i"
            class="border-b transition-colors duration-100"
            :class="isDark ? 'border-surface-border/40' : 'border-surface-light-border/40'"
            role="row"
            :aria-rowindex="i + 2"
          >
            <td
              v-for="(col, colIndex) in columns"
              :key="col"
              class="px-2 sm:px-3 py-2 whitespace-nowrap max-w-[150px] sm:max-w-[240px] overflow-hidden text-ellipsis transition-colors"
              :class="[isDark ? 'text-gray-200' : 'text-gray-700', cellClass(col, row[col])]"
              :data-cell="`${i}-${colIndex}`"
              :tabindex="focusedCell.row === i && focusedCell.col === colIndex ? 0 : -1"
              @focus="focusedCell = { row: i, col: colIndex }"
              role="gridcell"
              :aria-colindex="colIndex + 1"
              :aria-label="`${col}: ${formatCell(col, row[col]) || 'vacío'}`"
            >
              <template v-if="row[col] === null || row[col] === undefined || row[col] === ''">
                <span :class="isDark ? 'text-gray-700' : 'text-gray-400'">—</span>
              </template>
              <template v-else>
                {{ formatCell(col, row[col]) }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-mono gap-2 sm:gap-0" :class="isDark ? 'text-gray-500' : 'text-gray-600'">
      <button
        class="btn-ghost py-1 px-2 disabled:opacity-30 disabled:cursor-not-allowed order-2 sm:order-1"
        :disabled="page <= 1"
        @click="page--"
      >← Anterior</button>

      <span class="order-1 sm:order-2">Pág {{ page }} / {{ totalPages }}</span>

      <button
        class="btn-ghost py-1 px-2 disabled:opacity-30 disabled:cursor-not-allowed order-3"
        :disabled="page >= totalPages"
        @click="page++"
      >Siguiente →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useTheme } from '@/composables/useTheme.js'
import { usePreferences } from '@/composables/usePreferences.js'

const props = defineProps({
  columns: { type: Array, required: true },
  rows:    { type: Array, required: true }
})

const { isDark } = useTheme()
const { tablePageSize, tableSort, tableFilters } = usePreferences()

// Keyboard navigation
const focusedCell = ref({ row: -1, col: -1 })
const tableContainer = ref(null)

const search   = ref('')
const sortCol  = ref(tableSort.value?.column || null)
const sortDir  = ref(tableSort.value?.direction || 'asc')
const page     = ref(1)
const pageSize = ref(tablePageSize.value || 50)

// Watch for changes and save to preferences
watch(pageSize, (newSize) => {
  tablePageSize.value = newSize
  page.value = 1
})

watch([sortCol, sortDir], () => {
  tableSort.value = { column: sortCol.value, direction: sortDir.value }
})

watch(search, () => { 
  page.value = 1 
  tableFilters.value = { ...tableFilters.value, search: search.value }
})

const CURRENCY_KEYWORDS = ['ingreso', 'egreso', 'saldo', 'balance', 'monto', 'out', 'promo', 'comision', 'retiro', 'deposito']
const DATE_KEYWORDS     = ['fecha', 'date']
const NUM_KEYWORDS      = ['semana']

function isLikelyCurrency(col) {
  return CURRENCY_KEYWORDS.some(k => col.toLowerCase().includes(k))
}
function isLikelyDate(col) {
  return DATE_KEYWORDS.some(k => col.toLowerCase().includes(k))
}

function formatCell(col, val) {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val.trim()
  if (typeof val === 'number') {
    if (isLikelyCurrency(col)) {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val)
    }
    return val.toLocaleString('es-MX')
  }
  if (val instanceof Date) {
    return val.toLocaleDateString('es-MX')
  }
  return String(val).trim()
}

function handleKeydown(e) {
  const { row, col } = focusedCell.value
  const maxRow = paginatedRows.value.length - 1
  const maxCol = props.columns.length - 1
  
  switch(e.key) {
    case 'ArrowUp':
      e.preventDefault()
      if (row > 0) {
        focusedCell.value = { row: row - 1, col }
        scrollToCell(row - 1, col)
      }
      break
    case 'ArrowDown':
      e.preventDefault()
      if (row < maxRow) {
        focusedCell.value = { row: row + 1, col }
        scrollToCell(row + 1, col)
      }
      break
    case 'ArrowLeft':
      e.preventDefault()
      if (col > 0) {
        focusedCell.value = { row, col: col - 1 }
        scrollToCell(row, col - 1)
      }
      break
    case 'ArrowRight':
      e.preventDefault()
      if (col < maxCol) {
        focusedCell.value = { row, col: col + 1 }
        scrollToCell(row, col + 1)
      }
      break
    case 'Home':
      e.preventDefault()
      focusedCell.value = { row: 0, col: 0 }
      scrollToCell(0, 0)
      break
    case 'End':
      e.preventDefault()
      focusedCell.value = { row: maxRow, col: maxCol }
      scrollToCell(maxRow, maxCol)
      break
    case 'PageUp':
      e.preventDefault()
      const newRowUp = Math.max(0, row - pageSize.value)
      focusedCell.value = { row: newRowUp, col }
      scrollToCell(newRowUp, col)
      break
    case 'PageDown':
      e.preventDefault()
      const newRowDown = Math.min(maxRow, row + pageSize.value)
      focusedCell.value = { row: newRowDown, col }
      scrollToCell(newRowDown, col)
      break
  }
}

function scrollToCell(row, col) {
  nextTick(() => {
    const cell = document.querySelector(`[data-cell="${row}-${col}"]`)
    if (cell) {
      cell.focus()
      cell.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function cellClass(col, val) {
  if (isLikelyCurrency(col)) {
    const num = Number(val)
    if (!isNaN(num) && num !== 0) {
      return num > 0 ? 'text-accent-green' : 'text-accent-red'
    }
  }
  return ''
}

const filteredRows = computed(() => {
  let list = props.rows
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(row =>
      props.columns.some(col => String(row[col] ?? '').toLowerCase().includes(q))
    )
  }
  if (sortCol.value) {
    list = [...list].sort((a, b) => {
      const va = a[sortCol.value] ?? ''
      const vb = b[sortCol.value] ?? ''
      const na = Number(va), nb = Number(vb)
      const cmp = (!isNaN(na) && !isNaN(nb)) ? na - nb : String(va).localeCompare(String(vb))
      return sortDir.value === 'asc' ? cmp : -cmp
    })
  }
  return list
})

const totalPages  = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
const paginatedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

function toggleSort(col) {
  if (sortCol.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortCol.value = col
    sortDir.value = 'asc'
  }
  page.value = 1
}
</script>
