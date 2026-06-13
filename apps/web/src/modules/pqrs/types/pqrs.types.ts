// ─── Enums ────────────────────────────────────────────────────────────────────

export type TipoPqrs      = 'peticion' | 'queja' | 'reclamo' | 'sugerencia'
export type EstadoPqrs    = 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada' | 'archivada'
export type PrioridadPqrs = 'baja' | 'normal' | 'alta' | 'urgente'
export type CategoriaPqrs = 'infraestructura' | 'servicios' | 'seguridad' | 'convivencia' | 'otro'

// ─── Entidad ──────────────────────────────────────────────────────────────────

export interface Pqrs {
  id: string
  conjunto_id: string
  unidad_id: string
  usuario_id?: string
  numero_radicado: string
  tipo: TipoPqrs
  asunto: string
  descripcion: string
  categoria?: CategoriaPqrs
  prioridad: PrioridadPqrs
  estado: EstadoPqrs
  fecha_radicacion: string
  fecha_respuesta?: string | null
  fecha_cierre?: string | null
  tiempo_resolucion_dias?: number | null
  nombre_solicitante?: string
  email_solicitante?: string
  responsable_asignado_nombre?: string | null
  calificacion_satisfaccion?: number | null
  requiere_seguimiento?: boolean
  fecha_proximo_seguimiento?: string | null
  ubicacion_afectada?: string | null
  activo?: boolean
  created_at: string
  updated_at: string
}

// ─── Seguimiento ──────────────────────────────────────────────────────────────

export interface PqrsSeguimiento {
  id: string
  accion: string
  descripcion: string
  estado_anterior: string
  estado_nuevo: string
  usuario_nombre: string
  fecha_cambio: string
}

// ─── Paginación ───────────────────────────────────────────────────────────────

export interface PaginatedPqrs {
  data: Pqrs[]
  total: number
  page: number
  limit: number
  pages: number
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface PqrsCreatePayload {
  conjuntoId: string
  unidadId: string
  usuarioId?: string
  tipo: TipoPqrs
  asunto: string
  descripcion: string
  categoria?: CategoriaPqrs
  prioridad?: PrioridadPqrs
  nombre_solicitante?: string
  email_solicitante?: string
  telefono_solicitante?: string
  ubicacion_afectada?: string
  requiere_seguimiento?: boolean
  fecha_proximo_seguimiento?: string
}

export interface PqrsUpdatePayload {
  estado?: EstadoPqrs
  prioridad?: PrioridadPqrs
  categoria?: CategoriaPqrs
  responsable_asignado_id?: string
  responsable_asignado_nombre?: string
  respuesta_descripcion?: string
  requiere_seguimiento?: boolean
  fecha_proximo_seguimiento?: string
  observaciones_internas?: string
  calificacion_satisfaccion?: number
  comentario_satisfaccion?: string
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

export interface PqrsFilters {
  page?: number
  limit?: number
  conjuntoId?: string
  unidadId?: string
  tipo?: TipoPqrs | ''
  estado?: EstadoPqrs | ''
  prioridad?: PrioridadPqrs | ''
  categoria?: CategoriaPqrs | ''
  numeroRadicado?: string
}