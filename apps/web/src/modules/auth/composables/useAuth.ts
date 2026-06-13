import { useAuthStore } from '../store/auth.store'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import type { LoginInput, RegisterInput } from '../types/auth.types'

export function useAuth() {
  const auth = useAuthStore()
  const router = useRouter()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function login(credentials: LoginInput) {
    loading.value = true
    error.value = null
    try {
      await auth.login(credentials)
      await router.push('/')
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al iniciar sesión'
    } finally {
      loading.value = false
    }
  }

  async function register(input: RegisterInput) {
    loading.value = true
    error.value = null
    try {
      await auth.register(input)
      await router.push('/login')
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al registrarse'
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await auth.logout()
    await router.push('/login')
  }

  return { login, register, logout, loading, error, user: auth.user, isAuthenticated: auth.isAuthenticated }
}