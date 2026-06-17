import { z } from 'zod';

// ─── Enums (alineados con migración 004) ──────────────────────────────────────

export const estadoCobranzaEnum = z.enum([
  'pendiente',
  'pagado',
  'parcial',
  'vencido',
  'cancelado',
]);

export const metodoPagoEnum = z.enum([
  'efectivo',
  'transferencia',
  'tarjeta',
  'cheque',
  'otro',
]);

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const cobranzaCreateSchema = z.object({
  unidadId: z
    .string({ required_error: 'unidadId es obligatorio' })
    .uuid('unidadId debe ser un UUID válido'),
  conjuntoId: z
    .string({ required_error: 'conjuntoId es obligatorio' })
    .uuid('conjuntoId debe ser un UUID válido'),
  numero_recibo: z
    .string({ required_error: 'El número de recibo es obligatorio' })
    .min(1, 'El número de recibo no puede estar vacío')
    .max(50)
    .trim(),
  concepto: z
    .string({ required_error: 'El concepto es obligatorio' })
    .min(1, 'El concepto no puede estar vacío')
    .max(300)
    .trim(),
  descripcion: z.string().max(500).trim().optional(),
  valor_base: z
    .number({ required_error: 'El valor base es obligatorio' })
    .positive('El valor base debe ser mayor a cero'),
  valor_impuesto: z.number().min(0).default(0),
  valor_total: z
    .number({ required_error: 'El valor total es obligatorio' })
    .positive('El valor total debe ser mayor a cero'),
  mes_facturacion: z.number().int().min(1).max(12).optional(),
  anio_facturacion: z.number().int().min(2000).max(2100).optional(),
  fecha_emision: z
    .string()
    .date('La fecha de emisión debe tener formato YYYY-MM-DD')
    .optional(),
  fecha_vencimiento: z
    .string({ required_error: 'La fecha de vencimiento es obligatoria' })
    .date('La fecha de vencimiento debe tener formato YYYY-MM-DD'),
});

export const cobranzaUpdateSchema = z.object({
  concepto:          z.string().min(1).max(300).trim().optional(),
  descripcion:       z.string().max(500).trim().optional(),
  valor_base:        z.number().positive().optional(),
  valor_impuesto:    z.number().min(0).optional(),
  valor_total:       z.number().positive('El valor total debe ser mayor a cero').optional(),
  valor_pagado:      z.number().min(0).optional(),
  fecha_vencimiento: z.string().date('Formato inválido, use YYYY-MM-DD').optional(),
  fecha_pago:        z.string().date('Formato inválido, use YYYY-MM-DD').optional(),
  metodo_pago:       metodoPagoEnum.optional(),
  referencia_pago:   z.string().max(200).trim().optional(),
  observaciones:     z.string().max(500).trim().optional(),
  estado:            estadoCobranzaEnum.optional(),
});

export const cobranzaParamsSchema = z.object({
  id: z.string().uuid('El id debe ser un UUID válido'),
});

export const cobranzaQuerySchema = z.object({
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
  conjuntoId:  z.string().uuid().optional(),
  unidadId:    z.string().uuid().optional(),
  estado:      estadoCobranzaEnum.optional(),
  fechaDesde:  z.string().date('Formato inválido, use YYYY-MM-DD').optional(),
  fechaHasta:  z.string().date('Formato inválido, use YYYY-MM-DD').optional(),
  search:      z.string().trim().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type CobranzaCreateInput = z.infer<typeof cobranzaCreateSchema>;
export type CobranzaUpdateInput = z.infer<typeof cobranzaUpdateSchema>;
export type CobranzaParams      = z.infer<typeof cobranzaParamsSchema>;
export type CobranzaQuery       = z.infer<typeof cobranzaQuerySchema>;