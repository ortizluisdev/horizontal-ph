import { pool } from "../../core/database/pg.client.js";
import type { ConjuntoInput, Conjunto } from "@horizontal-ph/types";

export class ConjuntoRepository {
	async list(): Promise<Conjunto[]> {
		const res = await pool.query(`SELECT id, nombre, direccion, ciudad, activo, created_at FROM conjuntos ORDER BY created_at DESC LIMIT 100`);
		return res.rows;
	}

	async findById(id: string): Promise<Conjunto | null> {
		const res = await pool.query(`SELECT * FROM conjuntos WHERE id = $1 LIMIT 1`, [id]);
		return res.rows[0] ?? null;
	}

	async create(data: ConjuntoInput): Promise<Conjunto | null> {
		const insert = await pool.query(
			`INSERT INTO conjuntos (tenant_id, nombre, direccion, ciudad, tipo_conjunto) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
			[data.tenantId ?? null, data.nombre, data.direccion, data.ciudad ?? null, data.tipo_conjunto ?? null]
		);
		const id = insert.rows[0].id as string;
		return this.findById(id);
	}
}
