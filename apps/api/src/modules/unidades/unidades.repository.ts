import type { UnidadInput } from "./unidades.schema";

export class UnidadRepository {
  async list() {
    return [] as Array<{ id: string; nombre: string; descripcion?: string }>;
  }

  async create(data: UnidadInput) {
    return {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now().toString(),
      ...data,
    };
  }
}
