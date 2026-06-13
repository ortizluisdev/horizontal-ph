export const UNIDADES_ROUTES = {
  list:   '/unidades',
  nuevo:  '/unidades/nuevo',
  detail: (id: string) => `/unidades/${id}`,
  edit:   (id: string) => `/unidades/${id}/editar`,
} as const