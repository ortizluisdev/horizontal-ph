export interface Tenant {
  id: string;
  nombre: string;
  schema_name: string;
  plan?: string | null;
  activo?: boolean;
  created_at?: string;
}

export interface TenantInput {
  nombre: string;
  schema_name: string;
  plan?: string | null;
}