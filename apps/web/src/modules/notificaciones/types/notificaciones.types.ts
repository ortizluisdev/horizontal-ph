export type TipoNotificacion =
  | 'info'
  | 'exito'
  | 'advertencia'
  | 'error'
  | 'documento_vence'
  | 'estado_cambiado'
  | 'nuevo_documento'
  | 'comentario'
  | 'asamblea'
  | 'pago'

export type PrioridadNotificacion = 'baja' | 'media' | 'alta' | 'urgente'

export interface Notificacion {
  id: string
  usuario_id: string
  tipo: TipoNotificacion
  prioridad: PrioridadNotificacion
  titulo: string
  mensaje: string
  leida: boolean
  archivada: boolean
  accion_url?: string | null
  accion_label?: string | null
  entidad_tipo?: string | null   // 'normativa' | 'asamblea' | 'pago' ...
  entidad_id?: string | null
  metadata?: Record<string, any> | null
  created_at: string
  leida_at?: string | null
}

export interface PaginatedNotificaciones {
  data: Notificacion[]
  total: number
  no_leidas: number
  page: number
  limit: number
  pages: number
}

export interface NotificacionFilters {
  page?: number
  limit?: number
  leida?: boolean | ''
  tipo?: TipoNotificacion | ''
  prioridad?: PrioridadNotificacion | ''
  archivada?: boolean
}