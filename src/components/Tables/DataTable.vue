<template>
  <div class="flex flex-col gap-3">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <!-- Search -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar..."
          class="pl-8 pr-3 py-1.5 bg-surface-hover border border-surface-border rounded-lg text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-accent-blue/50 w-52"
        />
      </div>

      <div class="flex items-center gap-2 text-xs text-gray-500 font-mono">
        <span>{{ filteredRows.length }} de {{ rows.length }} filas</span>
        <select
          v-model="pageSize"
          class="bg-surface-hover border border-surface-border text-white rounded-lg px-2 py-1 text-xs font-mono focus:outline-none"
        >
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Table container -->
    <div class="overflow-auto rounded-xl border border-surface-border max-h-[60vh]">
      <table class="data-table w-full text-xs font-mono border-collapse min-w-max">
        <!-- Head -->
        <thead class="sticky top-0 z-10">
          <tr class="bg-surface-card border-b border-surface-border">
            <th
              v-for="col in columns"
              :key="col"
              class="px-3 py-2.5 text-left text-gray-400 font-body font-semibold tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-white transition-colors"
              @click="toggleSort(col)"
            >
              <span class="flex items-center gap-1.5">
                {{ col }}
                <span class="text-gray-600">
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
            <td :colspan="columns.length" class="text-center py-12 text-gray-600">
              Sin resultados
            </td>
          </tr>
          <tr
            v-for="(row, i) in paginatedRows"
            :key="i"
            class="border-b border-surface-border/40 transition-colors duration-100"
          >
            <td
              v-for="col in columns"
              :key="col"
              class="px-3 py-2 text-gray-300 whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis"
              :class="cellClass(col, row[col])"
            >
              <template v-if="row[col] === null || row[col] === undefined || row[col] === ''">
                <span class="text-gray-700">—</span>
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
    <div class="flex items-center justify-between text-xs font-mono text-gray-500">
      <button
        class="btn-ghost py-1 px-2 disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="page <= 1"
        @click="page--"
      >← Anterior</button>

      <span>Pág {{ page }} / {{ totalPages }}</span>

      <button
        class="btn-ghost py-1 px-2 disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="page >= totalPages"
        @click="page++"
      >Siguiente →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows:    { type: Array, required: true }
})

const search   = ref('')
const sortCol  = ref(null)
const sortDir  = ref('asc')
const page     = ref(1)
const pageSize = ref(50)

// Reset page when search changes
watch(search, () => { page.value = 1 })

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
  const num = Number(val)
  if (isLikelyDate(col) && typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) {
    return val.split('T')[0].split(' ')[0]
  }
  if (isLikelyCurrency(col) && !isNaN(num) && val !== '') {
    return new Intl.NumberFormat('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num)
  }
  return val
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
