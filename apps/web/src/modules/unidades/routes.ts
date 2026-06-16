import type { RouteRecordRaw } from 'vue-router'

export const UNIDADES_ROUTES = {
  list:   '/unidades',
  nuevo:  '/unidades/nuevo',
  detail: (id: string) => `/unidades/${id}`,
  edit:   (id: string) => `/unidades/${id}/editar`,
} as const

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const unidadesRoutes: RouteRecordRaw[] = [
  {
    path: '/unidades',
    name: 'unidades-list',
    component: () => import('./views/UnidadesListView.vue'),
  },
  {
    path: '/unidades/nuevo',  // ⚠️ DEBE ir ANTES de :id
    name: 'unidades-nuevo',
    component: () => import('./views/UnidadFormView.vue'),
  },
  {
    path: '/unidades/:id',
    name: 'unidades-detail',
    component: () => import('./views/UnidadDetailView.vue'),
    beforeEnter: (to) => {
      if (!UUID_RE.test(to.params.id as string)) return { name: 'unidades-list' }
    },
  },
  {
    path: '/unidades/:id/editar',
    name: 'unidades-editar',
    component: () => import('./views/UnidadFormView.vue'),
    beforeEnter: (to) => {
      if (!UUID_RE.test(to.params.id as string)) return { name: 'unidades-list' }
    },
  },
]