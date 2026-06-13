import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth
    { path: '/login', component: () => import('@/modules/auth/views/LoginView.vue') },
    { path: '/register', component: () => import('@/modules/auth/views/RegisterView.vue') },
    { path: '/forgot-password', component: () => import('@/modules/auth/views/ForgotPasswordView.vue') },

    // App (protegidas)
    {
      path: '/',
      component: () => import('@/shared/components/layout/AppShell.vue'),
      children: [
        { path: '', component: () => import('@/modules/dashboard/views/DashboardView.vue') },
        { path: 'conjuntos', component: () => import('@/modules/conjuntos/views/ConjuntosListView.vue') },
        { path: 'conjuntos/nuevo', component: () => import('@/modules/conjuntos/views/ConjuntoFormView.vue') },
        { path: 'conjuntos/:id', component: () => import('@/modules/conjuntos/views/ConjuntoDetailView.vue') },
        { path: 'conjuntos/:id/editar', component: () => import('@/modules/conjuntos/views/ConjuntoFormView.vue') },
        { path: 'unidades', component: () => import('@/modules/unidades/views/UnidadesListView.vue') },
        { path: 'unidades/:id', component: () => import('@/modules/unidades/views/UnidadDetailView.vue') },
        { path: 'cobranza', component: () => import('@/modules/cobranza/views/FacturasView.vue') },
        { path: 'pqrs', component: () => import('@/modules/pqrs/views/PqrsListView.vue') },
        { path: 'asambleas', component: () => import('@/modules/asambleas/views/AsambleasListView.vue') },
        { path: 'contabilidad', component: () => import('@/modules/contabilidad/views/LibroMayorView.vue') },
        { path: 'normativa', component: () => import('@/modules/normativa/views/ReglamentosView.vue') },
        { path: 'notificaciones', component: () => import('@/modules/notificaciones/views/NotificacionesView.vue') },
        { path: 'usuarios', component: () => import('@/modules/usuarios/views/UsuariosListView.vue') },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(authGuard)

export default router