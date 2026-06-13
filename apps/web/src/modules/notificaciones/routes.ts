import type { RouteRecordRaw } from 'vue-router'

const notificacionesRoutes: RouteRecordRaw[] = [
  {
    path: 'notificaciones',
    name: 'notificaciones',
    component: () => import('./views/NotificacionesView.vue'),
    meta: { title: 'Notificaciones', requiresAuth: true },
  },
  {
    path: 'notificaciones/:id',
    name: 'notificacion-detalle',
    component: () => import('./views/NotificacionDetailView.vue'),
    meta: { title: 'Detalle notificación', requiresAuth: true },
  },
]

export default notificacionesRoutes