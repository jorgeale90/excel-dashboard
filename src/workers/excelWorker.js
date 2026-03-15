// Web Worker for Excel processing
importScripts('https://cdn.sheetjs.com/xlsx-0.18.5/package/dist/xlsx.full.min.js')

let processing = false

self.onmessage = function(e) {
  if (processing) {
    self.postMessage({ error: 'Already processing a file' })
    return
  }

  processing = true
  const { file, fileName } = e.data

  try {
    const reader = new FileReader()
    
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const result = {
          fileName,
          sheets: []
        }

        // Process each sheet
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: null 
          })
          
          if (jsonData.length > 0) {
            const headers = jsonData[0] || []
            const rows = jsonData.slice(1).filter(row => row && row.some(cell => cell !== null))
            
            result.sheets.push({
              name: sheetName,
              headers,
              rows,
              meta: {
                totalRows: rows.length,
                totalCols: headers.length
              }
            })
          }
        })

        self.postMessage({ success: true, data: result })
      } catch (error) {
        self.postMessage({ error: error.message })
      } finally {
        processing = false
      }
    }

    reader.onerror = function() {
      self.postMessage({ error: 'Failed to read file' })
      processing = false
    }

    reader.readAsArrayBuffer(file)
  } catch (error) {
    self.postMessage({ error: error.message })
    processing = false
  }
}
