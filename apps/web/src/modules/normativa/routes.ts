import type { RouteRecordRaw } from 'vue-router'

const normativaRoutes: RouteRecordRaw[] = [
  {
    path: 'normativa',
    name: 'normativa',
    component: () => import('./views/DocumentosView.vue'),
    meta: { title: 'Normativa', requiresAuth: true },
  },
  {
    path: 'normativa/reglamentos',
    name: 'normativa-reglamentos',
    component: () => import('./views/ReglamentosView.vue'),
    meta: { title: 'Reglamentos', requiresAuth: true },
  },
  {
    path: 'normativa/nuevo',
    name: 'normativa-nuevo',
    component: () => import('./views/NormativaFormView.vue'),
    meta: { title: 'Nuevo documento', requiresAuth: true },
  },
  {
    path: 'normativa/:id',
    name: 'normativa-detalle',
    component: () => import('./views/NormativaDetailView.vue'),
    meta: { title: 'Detalle documento', requiresAuth: true },
  },
  {
    path: 'normativa/:id/editar',
    name: 'normativa-editar',
    component: () => import('./views/NormativaFormView.vue'),
    meta: { title: 'Editar documento', requiresAuth: true },
  },
]

export default normativaRoutes