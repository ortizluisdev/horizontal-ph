import type { UnidadInput, Unidad } from "@horizontal-ph/types";

export class UnidadRepository {
  async list(): Promise<Unidad[]> {
    return [] as Unidad[];
  }

  async create(data: UnidadInput): Promise<Unidad> {
    return {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now().toString(),
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
    } as Unidad;
  }
}
