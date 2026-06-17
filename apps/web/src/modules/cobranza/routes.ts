import type { RouteRecordRaw } from 'vue-router'

const cobranzaRoutes: RouteRecordRaw[] = [
  {
    path: '/cobranza',
    name: 'cobranza',
    component: () => import('./views/FacturasView.vue'),
    meta: { title: 'Cobranza', requiresAuth: true },
  },
  {
    path: '/cobranza/pagos',
    name: 'cobranza-pagos',
    component: () => import('./views/PagosView.vue'),
    meta: { title: 'Pagos', requiresAuth: true },
  },
  {
    path: '/cobranza/estado-cuenta',
    name: 'cobranza-estado',
    component: () => import('./views/EstadoCuentaView.vue'),
    meta: { title: 'Estado de cuenta', requiresAuth: true },
  },
  {
    path: '/cobranza/nuevo',
    name: 'cobranza-nuevo',
    component: () => import('./views/CobranzaFormView.vue'),
    meta: { title: 'Nueva cobranza', requiresAuth: true },
  },
  {
    path: '/cobranza/:id',
    name: 'cobranza-detalle',
    component: () => import('./views/CobranzaDetailView.vue'),
    meta: { title: 'Detalle cobranza', requiresAuth: true },
  },
]

export default cobranzaRoutes