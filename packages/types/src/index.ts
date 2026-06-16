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

export interface Asamblea {
  id: string;
  conjunto_id: string;
  numero_acta: string;
  tipo: string;
  asunto: string;
  fecha_programada?: string;
}

export interface AsambleaInput {
  conjuntoId: string;
  numero_acta: string;
  tipo: string;
  asunto: string;
  fecha_programada: string;
}

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

export interface Pqrs {
  id: string;
  conjunto_id: string;
  unidad_id: string;
  tipo: string;
  asunto: string;
}

export interface PqrsInput {
  conjuntoId: string;
  unidadId: string;
  tipo: string;
  asunto: string;
  descripcion?: string;
}

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

export interface Normativa {
  id: string;
  conjunto_id?: string | null;
  titulo?: string | null;
  tipo?: string | null;
}

export interface NormativaInput {
  conjuntoId?: string | null;
  titulo?: string | null;
  tipo?: string | null;
  descripcion?: string | null;
}

// ─── Unidad (alineada con migración 016 y API actual) ────────────────────────

export type TipoUnidad =
  | 'apartamento'
  | 'casa'
  | 'local_comercial'
  | 'oficina'
  | 'bodega'
  | 'parqueadero'
  | 'otro';

export interface Unidad {
  id: string;
  conjunto_id: string;
  conjunto_nombre?: string | null;
  nombre: string;
  descripcion?: string | null;
  tipo_unidad?: TipoUnidad | null;
  numero_unidad?: string | null;
  torre?: string | null;
  piso?: number | null;
  area_m2?: number | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnidadInput {
  conjuntoId: string;
  nombre: string;
  descripcion?: string;
  tipo_unidad?: TipoUnidad;
  numero_unidad?: string;
  torre?: string;
  piso?: number;
  area_m2?: number;
}