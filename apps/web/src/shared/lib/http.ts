import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ─── Request: adjunta Bearer ──────────────────────────────────────────────────
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response: refresh automático en 401 ─────────────────────────────────────
let isRefreshing = false
let queue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

function flushQueue(error: unknown, token: string | null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  queue = []
}

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const isAuthCall = original?.url?.includes('/auth/')

    if (error.response?.status !== 401 || original?._retry || isAuthCall) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (t) => { original.headers.Authorization = `Bearer ${t}`; resolve(http(original)) },
          reject,
        })
      })
    }

    original._retry = true
    isRefreshing = true
    const refreshToken = localStorage.getItem('refresh')

    if (!refreshToken) {
      isRefreshing = false
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'}/auth/refresh`,
        { refreshToken }
      )
      localStorage.setItem('token', data.token)
      localStorage.setItem('refresh', data.refresh.token)
      http.defaults.headers.common.Authorization = `Bearer ${data.token}`
      original.headers.Authorization = `Bearer ${data.token}`
      flushQueue(null, data.token)
      return http(original)
    } catch (e) {
      flushQueue(e, null)
      localStorage.removeItem('token')
      localStorage.removeItem('refresh')
      window.location.href = '/login'
      return Promise.reject(e)
    } finally {
      isRefreshing = false
    }
  }
)

export default http