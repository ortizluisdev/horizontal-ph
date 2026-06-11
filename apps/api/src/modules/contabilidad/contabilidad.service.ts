import { ContabilidadRepository } from "./contabilidad.repository.js";
import type { MovimientoInput, MovimientoContable } from "@horizontal-ph/types";

const repo = new ContabilidadRepository();

export class ContabilidadService {
	async list(): Promise<MovimientoContable[]> {
		return repo.list();
	}

	async findById(id: string): Promise<MovimientoContable | null> {
		return repo.findById(id);
	}

	async create(data: MovimientoInput): Promise<MovimientoContable | null> {
		return repo.create(data);
	}
}
