import { z } from "zod";

export const unidadSchema = z.object({
  conjunto_id:         z.string().uuid(),
  nombre:              z.string().min(1),
  numero_unidad:       z.string().min(1),
  torre:               z.string().optional().nullable(),
  piso:                z.number().int().optional().nullable(),
  tipo:                z.enum(["apartamento", "casa", "local", "garaje", "bodega", "otro"]),
  area_m2:             z.number().optional().nullable(),
  area_privada_m2:     z.number().optional().nullable(),
  area_comun_m2:       z.number().optional().nullable(),
  numero_habitaciones: z.number().int().optional().nullable(),
  numero_banos:        z.number().int().optional().nullable(),
  tiene_parqueadero:   z.boolean().optional().default(false),
  numero_parqueaderos: z.number().int().optional().default(0),
  tiene_bodega:        z.boolean().optional().default(false),
  uso:                 z.enum(["residencial", "comercial", "otro"]).optional().nullable(),
  estado:              z.enum(["activa", "inactiva", "disponible", "mantenimiento"]).optional().default("activa"),
  activo:              z.boolean().optional().default(true),
});

export type UnidadSchemaInput = z.infer<typeof unidadSchema>;