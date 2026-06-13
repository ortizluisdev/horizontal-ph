import type { RouteRecordRaw } from 'vue-router'

const usuariosRoutes: RouteRecordRaw[] = [
  {
    path: 'usuarios',
    name: 'usuarios',
    component: () => import('./views/UsuariosListView.vue'),
    meta: { title: 'Usuarios', requiresAuth: true },
  },
  {
    path: 'usuarios/nuevo',
    name: 'usuarios-nuevo',
    component: () => import('./views/UsuarioFormView.vue'),
    meta: { title: 'Nuevo usuario', requiresAuth: true },
  },
  {
    path: 'usuarios/:id',
    name: 'usuario-detalle',
    component: () => import('./views/UsuarioDetailView.vue'),
    meta: { title: 'Detalle usuario', requiresAuth: true },
  },
  {
    path: 'usuarios/:id/editar',
    name: 'usuario-editar',
    component: () => import('./views/UsuarioFormView.vue'),
    meta: { title: 'Editar usuario', requiresAuth: true },
  },
]

export default usuariosRoutes