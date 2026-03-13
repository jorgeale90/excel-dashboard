import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

const routes = [
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue')
      },
      {
        path: 'viewer',
        name: 'viewer',
        component: () => import('@/pages/ExcelViewer.vue')
      }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
