import { pool } from "../../core/database/pg.client.js";
import type { UnidadInput, Unidad } from "@horizontal-ph/types";

export class UnidadRepository {
  async list(): Promise<Unidad[]> {
    const res = await pool.query(
      `SELECT id, nombre, descripcion FROM unidades ORDER BY nombre ASC LIMIT 100`
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
      `INSERT INTO unidades (nombre, descripcion) VALUES ($1, $2) RETURNING id`,
      [data.nombre, data.descripcion ?? null]
    );
    const id = insert.rows[0].id as string;
    return this.findById(id) as Promise<Unidad>;
  }
}