import http from '@/shared/lib/http'
import type { PaginatedResponse } from '@/shared/types'
import type { Asamblea, AsambleaCreateInput, AsambleaUpdateInput, AsambleaQuery } from '../types/asambleas.types'

export const asambleasApi = {
  list(params?: AsambleaQuery) {
    return http.get<PaginatedResponse<Asamblea>>('/asambleas', { params })
  },
  getById(id: string) {
    return http.get<Asamblea>(`/asambleas/${id}`)
  },
  create(body: AsambleaCreateInput) {
    return http.post<Asamblea>('/asambleas', body)
  },
  update(id: string, body: AsambleaUpdateInput) {
    return http.patch<Asamblea>(`/asambleas/${id}`, body)
  },
  remove(id: string) {
    return http.delete<void>(`/asambleas/${id}`)
  },
}
