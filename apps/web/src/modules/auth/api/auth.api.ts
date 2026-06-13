import http from '@/shared/lib/http'
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  AuthUser,
  ChangePasswordInput,
} from '../types/auth.types'

export const authApi = {
  login(body: LoginInput) {
    return http.post<LoginResponse>('/auth/login', body)
  },

  register(body: RegisterInput) {
    return http.post<AuthUser>('/auth/register', body)
  },

  me() {
    return http.get<AuthUser>('/auth/me')
  },

  logout(refreshToken?: string) {
    return http.post<{ ok: boolean }>('/auth/logout', { refreshToken })
  },

  refresh(refreshToken: string) {
    return http.post<{ token: string; refresh: { token: string; expiresAt: string } }>(
      '/auth/refresh',
      { refreshToken }
    )
  },

  changePassword(body: ChangePasswordInput) {
    return http.patch<{ ok: boolean }>('/auth/password', body)
  },
}