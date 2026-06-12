import type { RouteRecordRaw } from 'vue-router'

export const asambleasRoutes: RouteRecordRaw[] = [
  {
    path: '/asambleas',
    name: 'asambleas-list',
    component: () => import('./views/AsambleasListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/asambleas/nueva',
    name: 'asambleas-create',
    component: () => import('./views/AsambleaFormView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/asambleas/:id',
    name: 'asambleas-detail',
    component: () => import('./views/AsambleaDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/asambleas/:id/editar',
    name: 'asambleas-edit',
    component: () => import('./views/AsambleaFormView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/asambleas/:id/votacion',
    name: 'asambleas-votacion',
    component: () => import('./views/VotacionView.vue'),
    meta: { requiresAuth: true },
  },
]
