import { AsambleaRepository } from "./asamblea.repository.js";
import type { AsambleaInput, Asamblea } from "@horizontal-ph/types";

const repo = new AsambleaRepository();

export class AsambleaService {
	async list(): Promise<Asamblea[]> {
		return repo.list();
	}

	async findById(id: string): Promise<Asamblea | null> {
		return repo.findById(id);
	}

	async create(data: AsambleaInput): Promise<Asamblea | null> {
		return repo.create(data);
	}
}
