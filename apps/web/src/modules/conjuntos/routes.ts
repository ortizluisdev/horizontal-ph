import type { RouteRecordRaw } from 'vue-router'

export const conjuntosRoutes: RouteRecordRaw[] = [
  {
    path: '/conjuntos',
    name: 'conjuntos',
    component: () => import('./views/ConjuntosListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/conjuntos/nuevo',
    name: 'conjuntos-nuevo',
    component: () => import('./views/ConjuntoFormView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/conjuntos/:id',
    name: 'conjunto-detalle',
    component: () => import('./views/ConjuntoDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/conjuntos/:id/editar',
    name: 'conjunto-editar',
    component: () => import('./views/ConjuntoFormView.vue'),
    meta: { requiresAuth: true },
  },
]