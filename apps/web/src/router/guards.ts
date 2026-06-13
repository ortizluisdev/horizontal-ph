import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

export async function authGuard(to: RouteLocationNormalized) {
  const auth = useAuthStore()

  if (publicRoutes.includes(to.path)) {
    if (auth.isAuthenticated) return '/'
    return true
  }

  if (!auth.isAuthenticated) return '/login'

  if (!auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      return '/login'
    }
  }

  return true
}