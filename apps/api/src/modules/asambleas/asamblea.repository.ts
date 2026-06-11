import { pool } from "../../core/database/pg.client.js";
import type { AsambleaInput, Asamblea } from "@horizontal-ph/types";

export class AsambleaRepository {
	async list(): Promise<Asamblea[]> {
		const res = await pool.query(`SELECT id, numero_acta, tipo, asunto, fecha_programada, estado FROM asambleas ORDER BY fecha_programada DESC LIMIT 100`);
		return res.rows;
	}

	async findById(id: string): Promise<Asamblea | null> {
		const res = await pool.query(`SELECT * FROM asambleas WHERE id = $1 LIMIT 1`, [id]);
		return res.rows[0] ?? null;
	}

	async create(data: AsambleaInput): Promise<Asamblea | null> {
		const insert = await pool.query(
			`INSERT INTO asambleas (conjunto_id, numero_acta, tipo, asunto, fecha_programada) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
			[data.conjuntoId, data.numero_acta, data.tipo, data.asunto, data.fecha_programada]
		);
		const id = insert.rows[0].id as string;
		return this.findById(id);
	}
}
