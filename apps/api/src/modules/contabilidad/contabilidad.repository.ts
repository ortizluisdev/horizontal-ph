import { pool } from "../../core/database/pg.client.js";
import type { MovimientoInput, MovimientoContable } from "@horizontal-ph/types";

export class ContabilidadRepository {
	async list(): Promise<MovimientoContable[]> {
		const res = await pool.query(`SELECT id, numero_asiento, tipo_movimiento, categoria, valor_debit, valor_credit, fecha_movimiento FROM contabilidad ORDER BY fecha_movimiento DESC LIMIT 100`);
		return res.rows as MovimientoContable[];
	}

	async findById(id: string): Promise<MovimientoContable | null> {
		const res = await pool.query(`SELECT * FROM contabilidad WHERE id = $1 LIMIT 1`, [id]);
		return (res.rows[0] as MovimientoContable) ?? null;
	}

	async create(data: MovimientoInput): Promise<MovimientoContable | null> {
		const insert = await pool.query(
			`INSERT INTO contabilidad (conjunto_id, numero_asiento, tipo_movimiento, categoria, valor_debit, valor_credit) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
			[data.conjuntoId, data.numero_asiento, data.tipo_movimiento, data.categoria, data.valor_debit ?? 0, data.valor_credit ?? 0]
		);
		const id = insert.rows[0].id as string;
		return this.findById(id);
	}
}
