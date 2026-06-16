import type { RouteRecordRaw } from 'vue-router'

const cobranzaRoutes: RouteRecordRaw[] = [
  {
    path: 'cobranza',
    name: 'cobranza',
    component: () => import('./views/FacturasListView.vue'),
    meta: { title: 'Cobranza', requiresAuth: true },
  },
  {
    path: 'cobranza/nueva',
    name: 'cobranza-nueva',
    component: () => import('./views/CobranzaFormView.vue'),
    meta: { title: 'Nueva cobranza', requiresAuth: true, roles: ['administrador'] },
  },
  {
    path: 'cobranza/pagos',
    name: 'cobranza-pagos',
    component: () => import('./views/PagosView.vue'),
    meta: { title: 'Pagos recibidos', requiresAuth: true },
  },
  {
    path: 'cobranza/estado-cuenta',
    name: 'cobranza-estado',
    component: () => import('./views/EstadoCuentaView.vue'),
    meta: { title: 'Estado de cuenta', requiresAuth: true },
  },
  {
    path: 'cobranza/:id',
    name: 'cobranza-detalle',
    component: () => import('./views/CobranzaDetailView.vue'),
    meta: { title: 'Detalle de cobranza', requiresAuth: true },
  },
  {
    path: 'cobranza/:id/editar',
    name: 'cobranza-editar',
    component: () => import('./views/CobranzaFormView.vue'),
    meta: { title: 'Editar cobranza', requiresAuth: true, roles: ['administrador'] },
  },
]

export default cobranzaRoutes