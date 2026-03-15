<template>
  <div class="flex h-screen overflow-hidden font-body transition-colors duration-300" :class="isDark ? 'bg-surface' : 'bg-surface-light'">
    <!-- Mobile overlay -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 bg-black/50 z-20 md:hidden" 
      @click="sidebarOpen = false"
    />
    
    <!-- Sidebar -->
    <aside
      class="fixed md:relative flex flex-col h-full z-30 shrink-0 border-r transition-all duration-300 md:transition-none"
      :class="[
        isDark ? 'border-surface-border bg-surface-card' : 'border-surface-light-border bg-surface-light-card',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        sidebarCollapsed ? 'md:w-16' : 'md:w-60'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5 border-b transition-colors duration-300" :class="isDark ? 'border-surface-border' : 'border-surface-light-border'">
        <div class="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
          </svg>
        </div>
        <div class="min-w-0 flex-1 transition-opacity duration-300" :class="sidebarCollapsed ? 'md:hidden' : 'md:block'">
          <p class="font-display text-sm font-bold leading-none truncate" :class="isDark ? 'text-white' : 'text-gray-900'">ExcelDash</p>

        </div>
        <!-- Collapse toggle -->
        <button 
          class="hidden md:block p-1.5 rounded-lg transition-colors duration-150 ml-auto"
          :class="isDark ? 'hover:bg-surface-hover text-gray-400' : 'hover:bg-surface-light-hover text-gray-600'"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <svg class="w-4 h-4 transition-transform duration-300" :class="sidebarCollapsed ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
          :class="[
            route.path === item.to 
              ? 'bg-accent-blue/15 text-accent-blue' 
              : isDark 
                ? 'text-gray-400 hover:text-white hover:bg-surface-hover' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-surface-light-hover'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span class="transition-opacity duration-300" :class="sidebarCollapsed ? 'md:hidden' : 'md:block'">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- File info -->
      <div v-if="store.fileName" class="mx-3 mb-4 px-3 py-3 rounded-lg border transition-colors duration-300" :class="isDark ? 'bg-surface-hover border-surface-border' : 'bg-surface-light-hover border-surface-light-border'">
        <p class="text-xs mb-1" :class="[sidebarCollapsed ? 'md:hidden' : '', isDark ? 'text-gray-500' : 'text-gray-600']">Archivo cargado</p>
        <p class="text-xs font-mono truncate text-accent-green" :class="sidebarCollapsed ? 'md:hidden' : ''">{{ store.fileName }}</p>
        <p class="text-xs mt-1" :class="[sidebarCollapsed ? 'md:hidden' : '', isDark ? 'text-gray-600' : 'text-gray-500']">{{ store.activeSheets.length }} hojas activas</p>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <!-- Topbar -->
      <header class="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b shrink-0 transition-colors duration-300" :class="isDark ? 'border-surface-border bg-surface-card' : 'border-surface-light-border bg-surface-light-card'">
        <div class="flex items-center gap-3">
          <button
            class="md:hidden p-1.5 rounded-lg transition-colors duration-150"
            :class="isDark ? 'hover:bg-surface-hover text-gray-400' : 'hover:bg-surface-light-hover text-gray-600'"
            @click="sidebarOpen = !sidebarOpen"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <h1 class="font-display text-lg font-bold truncate" :class="isDark ? 'text-white' : 'text-gray-900'">{{ currentPageTitle }}</h1>
        </div>
        <div class="flex items-center gap-2">
          <p class="hidden sm:block text-xs font-mono" :class="isDark ? 'text-gray-500' : 'text-gray-600'">{{ currentDate }}</p>
          <ThemeToggle />
          <span v-if="store.loading" class="badge-blue">
            <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 12a8 8 0 018-8v8H4z"/></svg>
            Procesando...
          </span>
          <button
            v-if="store.hasData"
            class="btn-ghost text-xs"
            @click="store.reset()"
          >
            Limpiar
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useExcelStore } from '@/stores/excelStore.js'
import { useTheme } from '@/composables/useTheme.js'
import { usePreferences } from '@/composables/usePreferences.js'
import IconGrid from '@/components/icons/IconGrid.vue'
import IconTable from '@/components/icons/IconTable.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const store = useExcelStore()
const route = useRoute()
const sidebarOpen = ref(false)
const { isDark } = useTheme()
const { sidebarCollapsed } = usePreferences()

const navItems = [
  { to: '/',       label: 'Dashboard',    icon: IconGrid  },
  { to: '/viewer', label: 'Visor Excel',  icon: IconTable }
]

const currentPageTitle = computed(() => navItems.find(n => n.to === route.path)?.label || 'Dashboard')

const currentDate = computed(() =>
  new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)
</script>
