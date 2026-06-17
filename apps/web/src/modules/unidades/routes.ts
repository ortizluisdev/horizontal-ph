import type { RouteRecordRaw } from 'vue-router'

// ─── Rutas nombradas ──────────────────────────────────────────────────────────

export const UNIDADES_ROUTES = {
  list:   '/unidades',
  nuevo:  '/unidades/nuevo',
  detail: (id: string) => `/unidades/${id}`,
  edit:   (id: string) => `/unidades/${id}/editar`,
} as const

// ─── Definición de rutas para vue-router ──────────────────────────────────────
// IMPORTANTE: 'nuevo' debe estar ANTES de ':id' para que el router no
// intente parsear la palabra "nuevo" como un UUID y el backend devuelva
// 400 "params/id must match format uuid".

export const unidadesRoutes: RouteRecordRaw[] = [
  {
    path: '/unidades',
    name: 'unidades-list',
    component: () => import('./views/UnidadesListView.vue'),
  },
  {
    // ⚠️ Debe ir ANTES de /unidades/:id
    path: '/unidades/nuevo',
    name: 'unidades-nuevo',
    component: () => import('./views/UnidadFormView.vue'),
  },
  {
    path: '/unidades/:id',
    name: 'unidades-detail',
    component: () => import('./views/UnidadDetailView.vue'),
    beforeEnter: (to) => {
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!UUID_RE.test(to.params.id as string)) {
        return { name: 'unidades-list' }
      }
    },
  },
  {
    path: '/unidades/:id/editar',
    name: 'unidades-editar',
    component: () => import('./views/UnidadFormView.vue'),
    beforeEnter: (to) => {
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!UUID_RE.test(to.params.id as string)) {
        return { name: 'unidades-list' }
      }
    },
  },
]