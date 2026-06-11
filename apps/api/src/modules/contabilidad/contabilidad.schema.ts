import { z } from "zod";

export const movimientoSchema = z.object({
	conjuntoId: z.string().uuid(),
	numero_asiento: z.string().min(1),
	tipo_movimiento: z.string().min(1),
	categoria: z.string().min(1),
	valor_debit: z.number().optional(),
	valor_credit: z.number().optional(),
});

export type MovimientoInput = z.infer<typeof movimientoSchema>;
