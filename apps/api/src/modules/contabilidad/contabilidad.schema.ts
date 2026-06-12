import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tipoMovimientoEnum = z.enum([
  "ingreso",
  "egreso",
  "ajuste",
  "traslado",
  "apertura",
  "cierre",
]);

export const categoriaMovimientoEnum = z.enum([
  "cuota_administracion",
  "cuota_extraordinaria",
  "mantenimiento",
  "servicios_publicos",
  "nomina",
  "seguros",
  "impuestos",
  "reparaciones",
  "arrendamiento",
  "intereses",
  "multas",
  "reservas",
  "otro",
]);

export const estadoMovimientoEnum = z.enum([
  "activo",
  "anulado",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Un movimiento debe tener valor_debit > 0 XOR valor_credit > 0.
 * Ambos en cero o ambos con valor se rechazan (partida doble simplificada).
 */
const debitCreditRule = z
  .object({
    valor_debit:  z.number().min(0).default(0),
    valor_credit: z.number().min(0).default(0),
  })
  .refine(
    (d) => (d.valor_debit > 0) !== (d.valor_credit > 0),
    {
      message:
        "Debe ingresar valor_debit O valor_credit, pero no ambos ni ninguno",
      path: ["valor_debit"],
    }
  );

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const movimientoCreateSchema = z
  .object({
    conjuntoId: z
      .string({ required_error: "conjuntoId es obligatorio" })
      .uuid("conjuntoId debe ser un UUID válido"),
    numero_asiento: z
      .string({ required_error: "El número de asiento es obligatorio" })
      .min(1)
      .max(50)
      .trim(),
    tipo_movimiento: tipoMovimientoEnum,
    categoria:       categoriaMovimientoEnum,
    valor_debit:     z.number().min(0).default(0),
    valor_credit:    z.number().min(0).default(0),
    descripcion: z
      .string()
      .min(5, "La descripción debe tener al menos 5 caracteres")
      .max(500)
      .trim()
      .optional(),
    fecha_movimiento: z
      .string({ required_error: "La fecha de movimiento es obligatoria" })
      .date("Formato de fecha inválido, use YYYY-MM-DD"),
    referencia_externa: z.string().max(100).trim().optional(),
    unidad_id:  z.string().uuid().optional(),
    cobranza_id: z.string().uuid().optional(),
  })
  .refine(
    (d) => (d.valor_debit > 0) !== (d.valor_credit > 0),
    {
      message:
        "Debe ingresar valor_debit O valor_credit, pero no ambos ni ninguno",
      path: ["valor_debit"],
    }
  );

export const movimientoUpdateSchema = z.object({
  descripcion:        z.string().min(5).max(500).trim().optional(),
  referencia_externa: z.string().max(100).trim().optional(),
  // El estado solo se actualiza via /anular — no directamente
});

export const movimientoAnularSchema = z.object({
  motivo_anulacion: z
    .string({ required_error: "El motivo de anulación es obligatorio" })
    .min(10, "El motivo debe tener al menos 10 caracteres")
    .max(500)
    .trim(),
});

export const movimientoParamsSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const movimientoQuerySchema = z.object({
  page:            z.coerce.number().int().min(1).default(1),
  limit:           z.coerce.number().int().min(1).max(100).default(20),
  conjuntoId:      z.string().uuid().optional(),
  tipo_movimiento: tipoMovimientoEnum.optional(),
  categoria:       categoriaMovimientoEnum.optional(),
  estado:          estadoMovimientoEnum.optional(),
  fechaDesde:      z.string().date("Formato de fecha inválido, use YYYY-MM-DD").optional(),
  fechaHasta:      z.string().date("Formato de fecha inválido, use YYYY-MM-DD").optional(),
  unidad_id:       z.string().uuid().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type MovimientoCreateInput = z.infer<typeof movimientoCreateSchema>;
export type MovimientoUpdateInput = z.infer<typeof movimientoUpdateSchema>;
export type MovimientoAnularInput = z.infer<typeof movimientoAnularSchema>;
export type MovimientoParams      = z.infer<typeof movimientoParamsSchema>;
export type MovimientoQuery       = z.infer<typeof movimientoQuerySchema>;