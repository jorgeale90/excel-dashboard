import { useStorage } from '@vueuse/core'

export function usePreferences() {
  // Table preferences
  const tablePageSize = useStorage('tablePageSize', 50)
  const tableSort = useStorage('tableSort', { column: null, direction: 'asc' })
  const tableFilters = useStorage('tableFilters', {})
  
  // UI preferences
  const sidebarCollapsed = useStorage('sidebarCollapsed', false)
  const recentFiles = useStorage('recentFiles', [])
  
  // Dashboard preferences
  const dashboardDateRange = useStorage('dashboardDateRange', {
    start: null,
    end: null
  })
  
  // Viewer preferences
  const viewerActiveSheet = useStorage('viewerActiveSheet', null)
  const viewerScrollPosition = useStorage('viewerScrollPosition', { x: 0, y: 0 })
  
  // Save recent file
  const addRecentFile = (file) => {
    const recent = {
      name: file.name,
      size: file.size,
      lastOpened: new Date().toISOString()
    }
    
    // Remove if already exists
    recentFiles.value = recentFiles.value.filter(f => f.name !== file.name)
    
    // Add to beginning
    recentFiles.value.unshift(recent)
    
    // Keep only last 10
    recentFiles.value = recentFiles.value.slice(0, 10)
  }
  
  // Clear all preferences
  const clearAll = () => {
    tablePageSize.value = 50
    tableSort.value = { column: null, direction: 'asc' }
    tableFilters.value = {}
    sidebarCollapsed.value = false
    recentFiles.value = []
    dashboardDateRange.value = { start: null, end: null }
    viewerActiveSheet.value = null
    viewerScrollPosition.value = { x: 0, y: 0 }
  }
  
  return {
    // Table
    tablePageSize,
    tableSort,
    tableFilters,
    
    // UI
    sidebarCollapsed,
    recentFiles,
    addRecentFile,
    
    // Dashboard
    dashboardDateRange,
    
    // Viewer
    viewerActiveSheet,
    viewerScrollPosition,
    
    // Actions
    clearAll
  }
}
