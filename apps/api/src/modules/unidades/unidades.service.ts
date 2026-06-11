import { UnidadRepository } from "./unidades.repository.js";
import type { UnidadInput, Unidad } from "@horizontal-ph/types";

const repository = new UnidadRepository();

export class UnidadService {
  async list(): Promise<Unidad[]> {
    return repository.list();
  }

  async create(data: UnidadInput): Promise<Unidad> {
    return repository.create(data);
  }
}
