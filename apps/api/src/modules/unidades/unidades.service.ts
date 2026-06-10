import { UnidadRepository } from "./unidades.repository.js";
import type { UnidadInput } from "./unidades.schema.js";

const repository = new UnidadRepository();

export class UnidadService {
  async list() {
    return repository.list();
  }

  async create(data: UnidadInput) {
    return repository.create(data);
  }
}
