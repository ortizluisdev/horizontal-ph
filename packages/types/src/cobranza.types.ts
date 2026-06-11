export interface Cobranza {
  id: string;
  unidad_id: string;
  conjunto_id: string;
  numero_recibo: string;
  concepto: string;
  valor_total: number;
  fecha_vencimiento?: string;
  estado?: string;
}

export interface CobranzaInput {
  unidadId: string;
  conjuntoId: string;
  numero_recibo: string;
  concepto: string;
  valor_total: number;
  fecha_vencimiento: string;
}