import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth.api'
import type { User, LoginPayload, RegisterPayload } from '../types/auth.types'

const TOKEN_KEY = 'token'
const REFRESH_KEY = 'refresh'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_KEY))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ─── Getters ──────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)
  const userInitials = computed(() => {
    if (!user.value) return ''
    return user.value.nombre
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  })
  const isAdmin = computed(() =>
    ['administrador', 'gerente', 'super-admin'].includes(user.value?.tipo_usuario ?? '')
  )

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function persistTokens(accessToken: string, refresh: string) {
    token.value = accessToken
    refreshToken.value = refresh
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_KEY, refresh)
  }

  function clearSession() {
    user.value = null
    token.value = null
    refreshToken.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const res = await authApi.login(payload)
      persistTokens(res.token, res.refresh.token)
      user.value = res.user
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al iniciar sesión'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null
    try {
      const newUser = await authApi.register(payload)
      return newUser
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al registrar usuario'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout(refreshToken.value ?? undefined)
    } catch {
      // silencioso: limpiar sesión local de todas formas
    } finally {
      clearSession()
    }
  }

  async function fetchMe() {
    try {
      user.value = await authApi.me()
    } catch {
      clearSession()
      throw new Error('Sesión expirada')
    }
  }

  async function refreshSession() {
    if (!refreshToken.value) {
      clearSession()
      return false
    }
    try {
      const res = await authApi.refresh(refreshToken.value)
      persistTokens(res.token, res.refresh.token)
      return true
    } catch {
      clearSession()
      return false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // state
    user,
    token,
    loading,
    error,
    // getters
    isAuthenticated,
    userInitials,
    isAdmin,
    // actions
    login,
    register,
    logout,
    fetchMe,
    refreshSession,
    clearError,
  }
})
