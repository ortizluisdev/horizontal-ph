import http from '@/shared/lib/http'
import type {
  Movimiento,
  MovimientoCreateInput,
  MovimientoUpdateInput,
  MovimientoAnularInput,
  MovimientoQuery,
  MovimientosPaginados,
  Balance,
  BalanceQuery,
} from '../types/contabilidad.types'

export const contabilidadApi = {
  list(params?: MovimientoQuery) {
    return http.get<MovimientosPaginados>('/contabilidad', { params })
  },

  getById(id: string) {
    return http.get<Movimiento>(`/contabilidad/${id}`)
  },

  getBalance(params: BalanceQuery) {
    return http.get<Balance>('/contabilidad/balance', { params })
  },

  create(body: MovimientoCreateInput) {
    return http.post<Movimiento>('/contabilidad', body)
  },

  update(id: string, body: MovimientoUpdateInput) {
    return http.patch<Movimiento>(`/contabilidad/${id}`, body)
  },

  anular(id: string, body: MovimientoAnularInput) {
    return http.patch<Movimiento>(`/contabilidad/${id}/anular`, body)
  },
}