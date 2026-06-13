import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth.api'
import type { AuthUser, LoginInput, RegisterInput } from '../types/auth.types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role_name === 'administrador')

  async function login(credentials: LoginInput) {
    const { data } = await authApi.login(credentials)
    token.value = data.token
    refreshToken.value = data.refresh.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('refresh', data.refresh.token)
  }

  async function register(input: RegisterInput) {
    const { data } = await authApi.register(input)
    return data
  }

  async function fetchMe() {
    const { data } = await authApi.me()
    user.value = data
  }

  async function logout() {
    try {
      await authApi.logout(refreshToken.value ?? undefined)
    } finally {
      user.value = null
      token.value = null
      refreshToken.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('refresh')
    }
  }

  return { user, token, isAuthenticated, isAdmin, login, register, fetchMe, logout }
})