import { UnidadRepository } from "./unidades.repository";
import type { UnidadInput } from "./unidades.schema";

const repository = new UnidadRepository();

export class UnidadService {
  async list() {
    return repository.list();
  }

  async create(data: UnidadInput) {
    return repository.create(data);
  }
}
