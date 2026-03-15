import { ref } from 'vue'

export function useExcelWorker() {
  const loading = ref(false)
  const error = ref(null)
  const worker = ref(null)

  const initWorker = () => {
    if (worker.value) {
      worker.value.terminate()
    }
    
    worker.value = new Worker(
      new URL('../workers/excelWorker.js', import.meta.url),
      { type: 'module' }
    )

    worker.value.onmessage = (e) => {
      loading.value = false
      if (e.data.error) {
        error.value = e.data.error
      } else {
        error.value = null
        return e.data.data
      }
    }

    worker.value.onerror = (e) => {
      loading.value = false
      error.value = 'Worker error: ' + e.message
    }
  }

  const processFile = async (file) => {
    if (!file) {
      error.value = 'No file provided'
      return null
    }

    loading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      if (!worker.value) {
        initWorker()
      }

      worker.value.onmessage = (e) => {
        loading.value = false
        if (e.data.error) {
          error.value = e.data.error
          reject(new Error(e.data.error))
        } else {
          error.value = null
          resolve(e.data.data)
        }
      }

      worker.value.postMessage({
        file,
        fileName: file.name
      })
    })
  }

  const terminate = () => {
    if (worker.value) {
      worker.value.terminate()
      worker.value = null
    }
  }

  // Initialize worker on first use
  initWorker()

  return {
    loading,
    error,
    processFile,
    terminate
  }
}
