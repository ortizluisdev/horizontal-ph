import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'

export async function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore()
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

  if (publicRoutes.includes(to.path)) {
    if (auth.isAuthenticated) return next('/')
    return next()
  }

  if (!auth.isAuthenticated) return next('/login')

  if (!auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      return next('/login')
    }
  }

  next()
}