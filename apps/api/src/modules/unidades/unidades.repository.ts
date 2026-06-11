import { pool } from "../../core/database/pg.client.js";
import type { UnidadInput, Unidad } from "@horizontal-ph/types";

export class UnidadRepository {
  async list(): Promise<Unidad[]> {
    const res = await pool.query(
      `SELECT id, nombre, numero_unidad, torre, piso, tipo,
              area_m2, uso, estado, activo, conjunto_id, created_at, updated_at
       FROM unidades
       ORDER BY nombre ASC
       LIMIT 100`
    );
    return res.rows;
  }

  async findById(id: string): Promise<Unidad | null> {
    const res = await pool.query(
      `SELECT * FROM unidades WHERE id = $1 LIMIT 1`,
      [id]
    );
    return res.rows[0] ?? null;
  }

  async create(data: UnidadInput): Promise<Unidad> {
    const insert = await pool.query(
      `INSERT INTO unidades (
        conjunto_id, nombre, numero_unidad, torre, piso, tipo,
        area_m2, area_privada_m2, area_comun_m2,
        numero_habitaciones, numero_banos,
        tiene_parqueadero, numero_parqueaderos,
        tiene_bodega, uso, estado, activo
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,
        $10,$11,
        $12,$13,
        $14,$15,$16,$17
      ) RETURNING id`,
      [
        data.conjunto_id,
        data.nombre,
        data.numero_unidad,
        data.torre         ?? null,
        data.piso          ?? null,
        data.tipo,
        data.area_m2       ?? null,
        data.area_privada_m2 ?? null,
        data.area_comun_m2   ?? null,
        data.numero_habitaciones ?? null,
        data.numero_banos        ?? null,
        data.tiene_parqueadero   ?? false,
        data.numero_parqueaderos ?? 0,
        data.tiene_bodega        ?? false,
        data.uso    ?? null,
        data.estado ?? "activa",
        data.activo ?? true,
      ]
    );
    const id = insert.rows[0].id as string;
    return this.findById(id) as Promise<Unidad>;
  }
}