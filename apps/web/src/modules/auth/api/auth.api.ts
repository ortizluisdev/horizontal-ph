import http from '@/shared/lib/http'
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RefreshResponse,
  User,
  ChangePasswordPayload,
} from '../types/auth.types'

const BASE = '/auth'

export const authApi = {
  /**
   * POST /auth/login
   * Retorna token JWT, refresh token y datos del usuario
   */
  login(payload: LoginPayload): Promise<LoginResponse> {
    return http.post<LoginResponse>(`${BASE}/login`, payload).then((r) => r.data)
  },

  /**
   * POST /auth/register
   * Crea un nuevo usuario en el tenant indicado
   */
  register(payload: RegisterPayload): Promise<User> {
    return http.post<User>(`${BASE}/register`, payload).then((r) => r.data)
  },

  /**
   * GET /auth/me
   * Devuelve el perfil del usuario autenticado (requiere Bearer)
   */
  me(): Promise<User> {
    return http.get<User>(`${BASE}/me`).then((r) => r.data)
  },

  /**
   * POST /auth/refresh
   * Rota el refresh token y devuelve nuevos tokens
   */
  refresh(refreshToken: string): Promise<RefreshResponse> {
    return http
      .post<RefreshResponse>(`${BASE}/refresh`, { refreshToken })
      .then((r) => r.data)
  },

  /**
   * POST /auth/logout
   * Revoca el refresh token en el servidor
   */
  logout(refreshToken?: string): Promise<void> {
    return http.post(`${BASE}/logout`, { refreshToken }).then(() => undefined)
  },

  /**
   * PATCH /auth/password
   * Cambia la contraseña del usuario autenticado
   */
  changePassword(payload: ChangePasswordPayload): Promise<void> {
    return http.patch(`${BASE}/password`, payload).then(() => undefined)
  },
}
