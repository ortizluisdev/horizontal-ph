export type Role = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
};

export type User = {
  id: string;
  nombre: string;
  email: string;
  role_id?: string | null;
  role_name?: string | null;
  unidad_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type NewUserInput = {
  nombre: string;
  email: string;
  password: string;
  roleName?: string; // opcional: buscar role por nombre
  unidadId?: string | null;
};

export type JwtPayload = {
  sub: string; // user id
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
};

export type RefreshToken = {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  revoked?: boolean;
  created_at?: string;
};
