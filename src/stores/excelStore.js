import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { parseExcelFile, getActiveSheets, extractKPIs } from '@/services/excelParser.js'

export const useExcelStore = defineStore('excel', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const fileName    = ref(null)
  const sheets      = ref([])
  const activeSheet = ref(null)
  const loading     = ref(false)
  const error       = ref(null)
  const kpis        = ref({ totalIngreso: 0, totalEgreso: 0, saldoFinal: 0, totalRegistros: 0, totalErrores: 0 })

  // ─── Computed ─────────────────────────────────────────────────────────────
  const hasData       = computed(() => sheets.value.length > 0)
  const activeSheets  = computed(() => getActiveSheets(sheets.value))

  const currentSheet  = computed(() =>
    sheets.value.find(s => s.name === activeSheet.value) || null
  )

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function loadExcel(file) {
    loading.value = true
    error.value   = null
    try {
      const result    = await parseExcelFile(file)
      sheets.value    = result.sheets
      fileName.value  = result.fileName
      kpis.value      = extractKPIs(result.sheets)

      // Activar la primera hoja con datos
      const first = getActiveSheets(result.sheets)[0]
      activeSheet.value = first?.name || result.sheets[0]?.name || null
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function setActiveSheet(name) {
    activeSheet.value = name
  }

  function reset() {
    fileName.value    = null
    sheets.value      = []
    activeSheet.value = null
    error.value       = null
    kpis.value        = { totalIngreso: 0, totalEgreso: 0, saldoFinal: 0, totalRegistros: 0, totalErrores: 0 }
  }

  return { fileName, sheets, activeSheet, loading, error, kpis, hasData, activeSheets, currentSheet, loadExcel, setActiveSheet, reset }
})
