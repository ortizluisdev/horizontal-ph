// packages/types/src/index.ts
export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at?: Date;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  role_id?: string | null;
  role_name?: string | null;
  unidad_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface NewUserInput {
  nombre: string;
  email: string;
  password: string;
  roleName?: string;
  unidadId?: string | null;
}

export type TipoConjunto = 'edificio' | 'casa' | 'ciudadela' | 'condominio' | 'otro';

export interface Conjunto {
  id: string;
  tenant_id: string;
  nombre: string;
  direccion: string;
  ciudad?: string | null;
  departamento?: string | null;
  pais?: string | null;
  codigo_catastral?: string | null;
  tipo_conjunto: TipoConjunto;
  numero_torres?: number | null;
  numero_unidades?: number | null;
  anio_construccion?: number | null;
  area_total_m2?: number | null;
  area_comun_m2?: number | null;
  administrador_nombre?: string | null;
  administrador_email?: string | null;
  administrador_telefono?: string | null;
  telefono_emergencia?: string | null;
  email_contacto?: string | null;
  logo_url?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConjuntoInput {
  tenantId: string;
  nombre: string;
  direccion: string;
  ciudad?: string | null;
  departamento?: string | null;
  pais?: string | null;
  codigo_catastral?: string | null;
  tipo_conjunto: TipoConjunto;
  numero_torres?: number | null;
  numero_unidades?: number | null;
  anio_construccion?: number | null;
  area_total_m2?: number | null;
  area_comun_m2?: number | null;
  administrador_nombre?: string | null;
  administrador_email?: string | null;
  administrador_telefono?: string | null;
  telefono_emergencia?: string | null;
  email_contacto?: string | null;
  logo_url?: string | null;
}

// ─── Asambleas ────────────────────────────────────────────────────────────────

export type TipoAsamblea   = 'ordinaria' | 'extraordinaria' | 'de_propietarios' | 'de_consejo' | 'otra';
export type EstadoAsamblea = 'programada' | 'en_curso' | 'realizada' | 'cancelada' | 'pospuesta';

export interface Asamblea {
  id: string;
  conjunto_id: string;
  numero_acta: string;
  tipo: TipoAsamblea;
  asunto: string;
  descripcion?: string | null;
  fecha_programada: string;
  fecha_realizada?: string | null;
  lugar?: string | null;
  presidente_nombre?: string | null;
  secretario_nombre?: string | null;
  quorum_requerido?: number | null;
  asistentes_presente?: number | null;
  asistentes_ausentes?: number | null;
  representantes?: number | null;
  votacion_requerida?: boolean;
  estado: EstadoAsamblea;
  documento_acta_url?: string | null;
  adjunto_url?: string | null;
  observaciones?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface AsambleaInput {
  conjuntoId: string;
  numero_acta: string;
  tipo: TipoAsamblea;
  asunto: string;
  descripcion?: string;
  fecha_programada: string;
  lugar?: string;
  presidente_nombre?: string;
  secretario_nombre?: string;
  quorum_requerido?: number;
  votacion_requerida?: boolean;
  observaciones?: string;
}

export interface AsambleaVotacion {
  id: string;
  asamblea_id: string;
  numero_votacion: number;
  tema: string;
  descripcion?: string | null;
  votos_a_favor: number;
  votos_en_contra: number;
  abstenciones: number;
  resultado?: 'aprobado' | 'rechazado' | 'aplazado' | null;
  observaciones?: string | null;
  created_at: string;
}

export interface AsambleaAcuerdo {
  id: string;
  asamblea_id: string;
  numero_acuerdo: number;
  descripcion: string;
  responsable_nombre?: string | null;
  responsable_id?: string | null;
  fecha_vencimiento?: string | null;
  estado: 'pendiente' | 'en progreso' | 'cumplido' | 'no cumplido';
  observaciones?: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Cobranza ─────────────────────────────────────────────────────────────────

export interface Cobranza {
  id: string;
  unidad_id: string;
  conjunto_id: string;
  numero_recibo: string;
  concepto: string;
  valor_total: number;
}

export interface CobranzaInput {
  unidadId: string;
  conjuntoId: string;
  numero_recibo: string;
  concepto: string;
  valor_total: number;
  fecha_vencimiento: string;
}

export interface MovimientoContable {
  id: string;
  conjunto_id: string;
  numero_asiento: string;
  tipo_movimiento: string;
  categoria: string;
  valor_debit?: number;
  valor_credit?: number;
}

export interface MovimientoInput {
  conjuntoId: string;
  numero_asiento: string;
  tipo_movimiento: string;
  categoria: string;
  valor_debit?: number;
  valor_credit?: number;
}

// ─── PQRS ─────────────────────────────────────────────────────────────────────

export type TipoPqrs      = 'peticion' | 'queja' | 'reclamo' | 'sugerencia';
export type EstadoPqrs    = 'abierta' | 'en proceso' | 'resuelta' | 'cerrada' | 'archivada';
export type PrioridadPqrs = 'baja' | 'normal' | 'alta' | 'urgente';
export type CategoriaPqrs = 'infraestructura' | 'servicios' | 'seguridad' | 'convivencia' | 'otro';

export interface Pqrs {
  id: string;
  conjunto_id: string;
  unidad_id: string;
  usuario_id?: string | null;
  numero_radicado: string;
  tipo: TipoPqrs;
  asunto: string;
  descripcion: string;
  categoria?: CategoriaPqrs | null;
  prioridad: PrioridadPqrs;
  estado: EstadoPqrs;
  fecha_radicacion: string;
  fecha_respuesta?: string | null;
  fecha_cierre?: string | null;
  tiempo_resolucion_dias?: number | null;
  nombre_solicitante?: string | null;
  email_solicitante?: string | null;
  telefono_solicitante?: string | null;
  responsable_asignado_id?: string | null;
  responsable_asignado_nombre?: string | null;
  respuesta_descripcion?: string | null;
  documentos_adjuntos?: unknown | null;
  evidencia_foto_url?: string | null;
  ubicacion_afectada?: string | null;
  requiere_seguimiento?: boolean;
  fecha_proximo_seguimiento?: string | null;
  calificacion_satisfaccion?: number | null;
  comentario_satisfaccion?: string | null;
  observaciones_internas?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface PqrsInput {
  conjuntoId: string;
  unidadId: string;
  tipo: TipoPqrs;
  asunto: string;
  descripcion: string;
  categoria?: CategoriaPqrs;
  prioridad?: PrioridadPqrs;
  nombre_solicitante?: string;
  email_solicitante?: string;
  telefono_solicitante?: string;
  ubicacion_afectada?: string;
  requiere_seguimiento?: boolean;
  fecha_proximo_seguimiento?: string;
}

// ─── Notificaciones ───────────────────────────────────────────────────────────

export interface Notificacion {
  id: string;
  tipo?: string | null;
  asunto?: string | null;
  estado?: string | null;
}

export interface NotificacionInput {
  conjuntoId?: string | null;
  usuarioId?: string | null;
  tipo?: string | null;
  asunto?: string | null;
  cuerpo?: string | null;
  fecha_programada?: string | null;
}

// ─── Normativa ────────────────────────────────────────────────────────────────

export type TipoNormativa =
  | 'reglamento_ph' | 'manual_convivencia' | 'acta_asamblea' | 'resolucion'
  | 'circular' | 'politica_interna' | 'contrato' | 'ley_decreto' | 'otro';

export type EstadoNormativa = 'borrador' | 'en_revision' | 'vigente' | 'derogado' | 'archivado';

export type AlcanceNormativa =
  | 'todos_propietarios' | 'consejo_administracion' | 'administracion'
  | 'comite_convivencia' | 'interno';

export type CategoriaLegalNormativa =
  | 'ley_675_2001' | 'decreto_reglamentario' | 'codigo_civil' | 'nsr_10'
  | 'norma_tecnica' | 'reglamento_interno' | 'decision_asamblea' | 'otra';

export interface Normativa {
  id: string;
  conjunto_id: string;
  titulo: string;
  tipo: TipoNormativa;
  categoria_legal?: CategoriaLegalNormativa | null;
  estado: EstadoNormativa;
  alcance: AlcanceNormativa;
  numero_documento?: string | null;
  version?: string | null;
  descripcion?: string | null;
  contenido?: string | null;
  archivo_url?: string | null;
  archivo_nombre?: string | null;
  archivo_tamano?: number | null;
  fecha_emision?: string | null;
  fecha_vigencia_desde?: string | null;
  fecha_vigencia_hasta?: string | null;
  asamblea_id?: string | null;
  aprobado_por?: string | null;
  tags: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface NormativaInput {
  conjuntoId: string;
  titulo: string;
  tipo: TipoNormativa;
  categoria_legal?: CategoriaLegalNormativa;
  estado?: EstadoNormativa;
  alcance?: AlcanceNormativa;
  numero_documento?: string;
  version?: string;
  descripcion?: string;
  contenido?: string;
  archivo_url?: string;
  archivo_nombre?: string;
  archivo_tamano?: number;
  fecha_emision?: string;
  fecha_vigencia_desde?: string;
  fecha_vigencia_hasta?: string;
  aprobado_por?: string;
  tags?: string[];
}

// ─── Unidades ─────────────────────────────────────────────────────────────────

export interface Unidad {
  id: string;
  conjunto_id: string;
  nombre: string;
  numero_unidad: string;
  torre?: string | null;
  piso?: number | null;
  tipo: string;
  area_m2?: number | null;
  area_privada_m2?: number | null;
  area_comun_m2?: number | null;
  numero_habitaciones?: number | null;
  numero_banos?: number | null;
  tiene_parqueadero?: boolean;
  numero_parqueaderos?: number;
  tiene_bodega?: boolean;
  matricula_inmobiliaria?: string | null;
  chip_agua?: string | null;
  chip_gas?: string | null;
  chip_energia?: string | null;
  uso?: string | null;
  estado?: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UnidadInput {
  conjunto_id: string;
  nombre: string;
  numero_unidad: string;
  torre?: string | null;
  piso?: number | null;
  tipo: string;
  area_m2?: number | null;
  area_privada_m2?: number | null;
  area_comun_m2?: number | null;
  numero_habitaciones?: number | null;
  numero_banos?: number | null;
  tiene_parqueadero?: boolean;
  numero_parqueaderos?: number;
  tiene_bodega?: boolean;
  uso?: string | null;
  estado?: string;
  activo?: boolean;
}
