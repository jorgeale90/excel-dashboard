import * as XLSX from 'xlsx'

/**
 * Configuración específica por hoja del archivo LOS MOCHIS 2.
 * headerRow: índice de la fila que contiene los encabezados (0-based)
 * summaryRow: índice de la fila con totales generales (null = no existe)
 * isCatalog: la hoja es una lista de valores, no una tabla de datos
 * skipEmptyCols: filtrar columnas cuyo encabezado sea vacío/nulo
 */
const SHEET_CONFIG = {
  'BALANCE DIARIO MOCHIS 2':        { headerRow: 3, summaryRow: 2, skipEmptyCols: true },
  'FLUJO EFVO LOS MOCHIS 2':        { headerRow: 2, summaryRow: 0, skipEmptyCols: true },
  'Hoja 3 LOS MOCHIS 2 ':           { headerRow: 1, summaryRow: null, skipEmptyCols: true },
  '10% comision ':                  { headerRow: 1, summaryRow: null, skipEmptyCols: true },
  'LISTADO DE CLIENTES LOS MOCHIS2':{ headerRow: 2, summaryRow: null, skipEmptyCols: true },
  'PAYCIP':                         { headerRow: 2, summaryRow: null, skipEmptyCols: true },
  'ERROR PLATAFORMA LOS MOCHIS 2':  { headerRow: 2, summaryRow: null, skipEmptyCols: true },
  'config':                         { headerRow: 0, summaryRow: null, skipEmptyCols: false, isCatalog: true },
  'Flujo Paycip':                   { headerRow: 3, summaryRow: null, skipEmptyCols: true },
  'Flujo solo Paycip':              { headerRow: 2, summaryRow: null, skipEmptyCols: true }
}

/** Formatea valores: fechas → string legible, null/undefined → null */
function formatValue(val) {
  if (val === null || val === undefined || val === '') return null
  if (typeof val === 'number' && val > 25569 && val < 50000) {
    // Posible fecha serial de Excel
    const date = XLSX.SSF.parse_date_code(val)
    if (date) {
      return `${date.y}-${String(date.m).padStart(2,'0')}-${String(date.d).padStart(2,'0')}`
    }
  }
  if (val instanceof Date) {
    return val.toISOString().split('T')[0]
  }
  return val
}

/** Extrae los datos de summary (totales) de una hoja raw */
function extractSummary(rawRows, headerCols) {
  if (!rawRows || rawRows.length === 0) return {}
  const summaryRow = rawRows[0]
  const summary = {}
  headerCols.forEach((col, i) => {
    if (col && summaryRow[i] !== undefined && summaryRow[i] !== null) {
      summary[col] = summaryRow[i]
    }
  })
  return summary
}

/** Parsea una hoja completa y retorna { columns, rows, summary, meta } */
function parseSheet(worksheet, config) {
  const { headerRow, summaryRow, skipEmptyCols, isCatalog } = config

  // Convertir a array de arrays (sin encabezados automáticos)
  const raw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null, raw: false })

  if (!raw || raw.length <= headerRow) {
    return { columns: [], rows: [], summary: {}, meta: { totalRows: 0 } }
  }

  // Catálogos simples (ej: config)
  if (isCatalog) {
    const rows = raw
      .map(r => ({ valor: r[0] }))
      .filter(r => r.valor !== null && r.valor !== undefined && r.valor !== '')
    return { columns: ['valor'], rows, summary: {}, meta: { totalRows: rows.length } }
  }

  // Extraer encabezados
  const headerRowData = raw[headerRow] || []
  let columns = headerRowData.map((h, i) => ({
    key: h ? String(h).trim() : `__col_${i}`,
    label: h ? String(h).trim() : '',
    index: i
  }))

  // Filtrar columnas vacías
  if (skipEmptyCols) {
    columns = columns.filter(c => c.label !== '')
  }

  // Extraer summary si existe
  let summary = {}
  if (summaryRow !== null && summaryRow !== undefined) {
    const summaryData = raw[summaryRow] || []
    columns.forEach(col => {
      const val = summaryData[col.index]
      if (val !== null && val !== undefined) {
        summary[col.key] = formatValue(val)
      }
    })
  }

  // Extraer filas de datos (después del headerRow, saltando summaryRow)
  const dataStartRow = headerRow + 1
  const skipRows = new Set()
  if (summaryRow !== null && summaryRow !== undefined && summaryRow >= dataStartRow) {
    skipRows.add(summaryRow)
  }

  const rows = []
  for (let i = dataStartRow; i < raw.length; i++) {
    if (skipRows.has(i)) continue
    const rawRow = raw[i] || []

    // Omitir filas completamente vacías
    const hasData = columns.some(col => {
      const v = rawRow[col.index]
      return v !== null && v !== undefined && v !== ''
    })
    if (!hasData) continue

    const row = {}
    columns.forEach(col => {
      row[col.key] = formatValue(rawRow[col.index])
    })
    rows.push(row)
  }

  return {
    columns: columns.map(c => c.key),
    rows,
    summary,
    meta: { totalRows: rows.length }
  }
}

/**
 * Entrada principal: recibe un File de input[type=file] y retorna
 * { sheets: [{ name, columns, rows, summary, meta }] }
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })

        const sheets = workbook.SheetNames.map(name => {
          const worksheet = workbook.Sheets[name]
          const config = SHEET_CONFIG[name] || { headerRow: 0, summaryRow: null, skipEmptyCols: true }
          const parsed = parseSheet(worksheet, config)
          return { name, ...parsed }
        })

        resolve({ sheets, fileName: file.name })
      } catch (err) {
        reject(new Error(`Error al parsear el archivo: ${err.message}`))
      }
    }

    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

/** Retorna las hojas con datos reales (> 0 filas) */
export function getActiveSheets(sheets) {
  return sheets.filter(s => s.rows.length > 0)
}

/** Extrae KPIs globales del store de hojas */
export function extractKPIs(sheets) {
  const flujo = sheets.find(s => s.name === 'FLUJO EFVO LOS MOCHIS 2')
  const balance = sheets.find(s => s.name === 'BALANCE DIARIO MOCHIS 2')
  const errores = sheets.find(s => s.name === 'ERROR PLATAFORMA LOS MOCHIS 2')

  const kpis = {
    totalIngreso: 0,
    totalEgreso: 0,
    saldoFinal: 0,
    totalRegistros: 0,
    totalErrores: 0
  }

  if (flujo?.summary) {
    kpis.totalIngreso = Number(flujo.summary['Ingreso']) || 0
    kpis.totalEgreso  = Number(flujo.summary['Egreso'])  || 0
    kpis.saldoFinal   = Number(flujo.summary['Saldo'])   || 0
  }

  if (balance) kpis.totalRegistros = balance.meta?.totalRows || 0
  if (errores) kpis.totalErrores   = errores.meta?.totalRows || 0

  return kpis
}
