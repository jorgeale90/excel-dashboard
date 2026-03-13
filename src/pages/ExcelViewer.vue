<template>
  <div class="p-6 space-y-4">

    <!-- Upload state -->
    <div v-if="!store.hasData" class="flex flex-col items-center justify-center min-h-[70vh]">
      <div class="w-full max-w-lg">
        <div class="mb-8 text-center">
          <h2 class="font-display text-3xl font-bold text-white">Visor Excel</h2>
          <p class="text-gray-500 font-body mt-2">Sube tu archivo Excel para explorar las hojas</p>
        </div>
        <ExcelUploader />
      </div>
    </div>

    <template v-else>
      <!-- Sheet tabs bar -->
      <div class="card !p-0 overflow-hidden">
        <div class="px-4 pt-3 border-b border-surface-border">
          <SheetTabs
            :sheets="store.activeSheets"
            :active="store.activeSheet"
            @change="store.setActiveSheet($event)"
          />
        </div>
      </div>

      <!-- Active sheet content -->
      <transition name="fade" mode="out-in">
        <div v-if="store.currentSheet" :key="store.activeSheet" class="card space-y-4">
          <!-- Sheet header -->
          <div class="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-surface-border">
            <div>
              <h3 class="font-display font-bold text-white text-lg">{{ store.currentSheet.name }}</h3>
              <p class="text-xs font-mono text-gray-500 mt-0.5">
                {{ store.currentSheet.meta?.totalRows }} registros · {{ store.currentSheet.columns?.length }} columnas
              </p>
            </div>

            <!-- Summary badges from row 0 totals -->
            <div
              v-if="hasSummary"
              class="flex flex-wrap gap-2"
            >
              <div
                v-for="(val, key) in summaryItems"
                :key="key"
                class="px-3 py-1.5 rounded-lg bg-surface-hover border border-surface-border"
              >
                <p class="text-[10px] text-gray-500 font-mono">{{ key }}</p>
                <p class="text-sm font-bold font-mono" :class="summaryColor(val)">{{ formatSummaryVal(val) }}</p>
              </div>
            </div>
          </div>

          <!-- Data table -->
          <DataTable
            :columns="store.currentSheet.columns"
            :rows="store.currentSheet.rows"
          />
        </div>

        <div v-else class="card text-center py-16 text-gray-600 font-mono">
          Selecciona una hoja para ver los datos
        </div>
      </transition>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useExcelStore } from '@/stores/excelStore.js'
import ExcelUploader from '@/components/Excel/ExcelUploader.vue'
import SheetTabs from '@/components/Excel/SheetTabs.vue'
import DataTable from '@/components/Tables/DataTable.vue'

const store = useExcelStore()

const hasSummary = computed(() =>
  store.currentSheet?.summary && Object.keys(store.currentSheet.summary).length > 0
)

const summaryItems = computed(() => {
  const s = store.currentSheet?.summary ?? {}
  // Mostrar solo los primeros 5 valores numéricos relevantes
  return Object.fromEntries(
    Object.entries(s)
      .filter(([, v]) => v !== null && v !== undefined && !isNaN(Number(v)))
      .slice(0, 5)
  )
})

function formatSummaryVal(val) {
  const n = Number(val)
  if (isNaN(n)) return val
  return new Intl.NumberFormat('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

function summaryColor(val) {
  const n = Number(val)
  if (isNaN(n)) return 'text-white'
  return n >= 0 ? 'text-accent-green' : 'text-accent-red'
}
</script>
