<template>
  <div class="p-6 space-y-6">

    <!-- ── Upload state ── -->
    <div v-if="!store.hasData" class="flex flex-col items-center justify-center min-h-[70vh]">
      <div class="w-full max-w-lg">
        <div class="mb-8 text-center">
          <h2 class="font-display text-3xl font-bold text-white">Bienvenido</h2>
          <p class="text-gray-500 font-body mt-2">Sube tu archivo Excel para comenzar a visualizar los datos</p>
        </div>
        <ExcelUploader />
      </div>
    </div>

    <!-- ── Dashboard content ── -->
    <template v-else>

      <!-- Header info -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-display text-xl font-bold text-white">Resumen General</h2>
          <p class="text-xs text-gray-500 font-mono mt-0.5">{{ store.fileName }}</p>
        </div>
        <button class="btn-ghost flex items-center gap-2" @click="store.reset()">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Cargar otro
        </button>
      </div>

      <!-- ── KPI Cards ── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Ingreso"
          :value="store.kpis.totalIngreso"
          color="green"
          subtitle="Flujo EFVO acumulado"
        >
          <template #icon>
            <svg class="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 19V5m0 0l-7 7m7-7l7 7"/>
            </svg>
          </template>
        </KpiCard>

        <KpiCard
          label="Total Egreso"
          :value="store.kpis.totalEgreso"
          color="red"
          subtitle="Flujo EFVO acumulado"
        >
          <template #icon>
            <svg class="w-4 h-4 text-accent-red" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 5v14m0 0l-7-7m7 7l7-7"/>
            </svg>
          </template>
        </KpiCard>

        <KpiCard
          label="Saldo Final"
          :value="store.kpis.saldoFinal"
          :color="store.kpis.saldoFinal >= 0 ? 'blue' : 'red'"
          subtitle="Efectivo disponible"
        >
          <template #icon>
            <svg class="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M3 10h18M7 15h1m4 0h1M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </template>
        </KpiCard>

        <KpiCard
          label="Errores Plataforma"
          :value="store.kpis.totalErrores"
          color="amber"
          format="number"
          subtitle="Transacciones con error"
        >
          <template #icon>
            <svg class="w-4 h-4 text-accent-amber" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </template>
        </KpiCard>
      </div>

      <!-- ── Charts row ── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Balance diario chart -->
        <div class="card lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="font-display font-bold text-white">Balance Diario</p>
              <p class="text-xs text-gray-500 font-mono mt-0.5">Ingreso vs Out por fecha</p>
            </div>
            <div class="flex items-center gap-3 text-xs font-mono">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-accent-green inline-block"></span>Ingreso</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-accent-red inline-block"></span>Out</span>
            </div>
          </div>
          <BalanceChart :data="balanceChartData" />
        </div>

        <!-- Sheets summary -->
        <div class="card">
          <p class="font-display font-bold text-white mb-1">Hojas Activas</p>
          <p class="text-xs text-gray-500 font-mono mb-4">{{ store.activeSheets.length }} hojas con datos</p>
          <div class="space-y-2">
            <div
              v-for="s in store.activeSheets"
              :key="s.name"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-hover border border-surface-border hover:border-gray-600 transition-colors cursor-pointer"
              @click="goToViewer(s.name)"
            >
              <div class="min-w-0 flex-1">
                <p class="text-xs font-body text-gray-300 truncate">{{ s.name }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0 ml-2">
                <span class="text-xs font-mono text-accent-blue font-bold">{{ s.meta?.totalRows }}</span>
                <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Flujo EFVO últimas transacciones ── -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="font-display font-bold text-white">Últimas Transacciones</p>
            <p class="text-xs text-gray-500 font-mono mt-0.5">Flujo de Efectivo — 20 más recientes</p>
          </div>
          <button class="btn-ghost text-xs" @click="goToViewer('FLUJO EFVO LOS MOCHIS 2')">
            Ver todo →
          </button>
        </div>
        <DataTable
          v-if="flujoRows.length"
          :columns="flujoColumns"
          :rows="flujoRows.slice(0, 20)"
          :mini="true"
        />
        <p v-else class="text-gray-600 text-sm font-mono">Sin datos de flujo disponibles</p>
      </div>

      <!-- ── Errores recientes ── -->
      <div v-if="errorRows.length" class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="font-display font-bold text-white">Errores de Plataforma</p>
            <p class="text-xs text-gray-500 font-mono mt-0.5">Transacciones no enlazadas</p>
          </div>
          <span class="badge-amber">{{ errorRows.length }} registros</span>
        </div>
        <div class="overflow-auto rounded-lg border border-surface-border max-h-64">
          <table class="data-table w-full text-xs font-mono min-w-max">
            <thead class="sticky top-0 bg-surface-card">
              <tr class="border-b border-surface-border">
                <th class="px-3 py-2.5 text-left text-gray-400 font-body font-semibold">Fecha</th>
                <th class="px-3 py-2.5 text-left text-gray-400 font-body font-semibold">Correo</th>
                <th class="px-3 py-2.5 text-left text-gray-400 font-body font-semibold">Monto</th>
                <th class="px-3 py-2.5 text-left text-gray-400 font-body font-semibold">Tipo</th>
                <th class="px-3 py-2.5 text-left text-gray-400 font-body font-semibold">Autorizado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in errorRows"
                :key="i"
                class="border-b border-surface-border/40 hover:bg-surface-hover"
              >
                <td class="px-3 py-2 text-gray-400">{{ row['Fecha y hora de la transacción en Maya'] ?? '—' }}</td>
                <td class="px-3 py-2 text-gray-300">{{ row['Correo del cliente'] ?? '—' }}</td>
                <td class="px-3 py-2 text-accent-amber font-bold">{{ formatMXN(row['Monto']) }}</td>
                <td class="px-3 py-2">
                  <span class="badge-amber">{{ row['Tipo'] ?? '—' }}</span>
                </td>
                <td class="px-3 py-2 text-gray-400">{{ row['Autorizado por:'] ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExcelStore } from '@/stores/excelStore.js'
import ExcelUploader from '@/components/Excel/ExcelUploader.vue'
import KpiCard from '@/components/Dashboard/KpiCard.vue'
import DataTable from '@/components/Tables/DataTable.vue'
import BalanceChart from '@/components/Dashboard/BalanceChart.vue'

const store  = useExcelStore()
const router = useRouter()

function goToViewer(sheetName) {
  store.setActiveSheet(sheetName)
  router.push('/viewer')
}

function formatMXN(val) {
  const n = Number(val)
  if (isNaN(n)) return val ?? '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

// ── Flujo EFVO ────────────────────────────────────────────────────────────────
const flujoSheet = computed(() => store.sheets.find(s => s.name === 'FLUJO EFVO LOS MOCHIS 2'))
const flujoColumns = computed(() => flujoSheet.value?.columns?.filter(c =>
  ['Fecha','Concepto','Origen','Destino','Ingreso','Egreso','Saldo'].includes(c)
) ?? [])
const flujoRows = computed(() => flujoSheet.value?.rows ?? [])

// ── Balance Diario ─────────────────────────────────────────────────────────────
const balanceSheet = computed(() => store.sheets.find(s => s.name === 'BALANCE DIARIO MOCHIS 2'))
const balanceChartData = computed(() => {
  const rows = balanceSheet.value?.rows ?? []
  return rows.slice(0, 60).map(r => ({
    fecha:   r['Fecha Liq'] ? String(r['Fecha Liq']).split(' ')[0] : '—',
    ingreso: Number(r['Ingreso']) || 0,
    out:     Number(r['Out'])     || 0,
    balance: Number(r['Balance']) || 0
  }))
})

// ── Errores Plataforma ─────────────────────────────────────────────────────────
const errorSheet = computed(() => store.sheets.find(s => s.name === 'ERROR PLATAFORMA LOS MOCHIS 2'))
const errorRows  = computed(() => errorSheet.value?.rows ?? [])
</script>
