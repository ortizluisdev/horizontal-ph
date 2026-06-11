import { z } from "zod";

export const cobranzaSchema = z.object({
	unidadId: z.string().uuid(),
	conjuntoId: z.string().uuid(),
	numero_recibo: z.string().min(1),
	concepto: z.string().min(1),
	valor_total: z.number(),
	fecha_vencimiento: z.string(),
});

export type CobranzaInput = z.infer<typeof cobranzaSchema>;
