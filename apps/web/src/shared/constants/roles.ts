export const ROLES = {
  ADMIN: 'administrador',
  PROPIETARIO: 'propietario',
  INQUILINO: 'inquilino',
  VIGILANTE: 'vigilante',
  CELADORA: 'celadora',
  ASEADORA: 'aseadora',
  OTRO: 'otro',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]