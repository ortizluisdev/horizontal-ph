import type { RouteRecordRaw } from 'vue-router'

const asambleasRoutes: RouteRecordRaw[] = [
  {
    path: 'asambleas',
    name: 'asambleas',
    component: () => import('./views/AsambleasListView.vue'),
    meta: { title: 'Asambleas', requiresAuth: true },
  },
  {
    path: 'asambleas/nueva',
    name: 'asambleas-nueva',
    component: () => import('./views/AsambleaFormView.vue'),
    meta: { title: 'Nueva asamblea', requiresAuth: true },
  },
  {
    path: 'asambleas/:id',
    name: 'asambleas-detalle',
    component: () => import('./views/AsambleaDetailView.vue'),
    meta: { title: 'Detalle asamblea', requiresAuth: true },
  },
  {
    path: 'asambleas/:id/editar',
    name: 'asambleas-editar',
    component: () => import('./views/AsambleaFormView.vue'),
    meta: { title: 'Editar asamblea', requiresAuth: true },
  },
  {
    path: 'asambleas/:id/votacion',
    name: 'asambleas-votacion',
    component: () => import('./views/VotacionView.vue'),
    meta: { title: 'Votación', requiresAuth: true },
  },
]

export default asambleasRoutes