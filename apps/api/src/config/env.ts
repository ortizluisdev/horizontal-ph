import { z } from "zod";

const envSchema = z.object({
  NODE_ENV:            z.enum(["development", "production", "test"]).default("development"),
  PORT:                z.coerce.number().default(3000),
  DATABASE_URL:        z.string().min(1, "DATABASE_URL es requerida"),
  REDIS_URL:           z.string().default("redis://localhost:6379"),
  JWT_SECRET:          z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  JWT_EXPIRES_IN:      z.string().default("15m"),
  REFRESH_EXPIRES_IN:  z.string().default("7d"),
  AI_PROVIDER:         z.enum(["openai", "anthropic"]).default("openai"),
  OPENAI_API_KEY:      z.string().optional(),
  ANTHROPIC_API_KEY:   z.string().optional(),
  CORS_ORIGIN:         z.string().default("*"),
});

// Parsear y fallar rápido si falta algo crítico
export const env = envSchema.parse(process.env);
export type Env  = z.infer<typeof envSchema>;

export const isProduction    = () => env.NODE_ENV === "production";
export const isDevelopment   = () => env.NODE_ENV === "development";
export const getPort         = () => env.PORT;
export const getDatabaseUrl  = () => env.DATABASE_URL;
export const getRedisUrl     = () => env.REDIS_URL;
export const getJwtSecret    = () => env.JWT_SECRET;
export const getAiProvider   = () => env.AI_PROVIDER;
export const getOpenAIKey    = () => env.OPENAI_API_KEY;
export const getAnthropicKey = () => env.ANTHROPIC_API_KEY;

export function isAiKeyConfigured() {
  return Boolean(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY);
}

export function ensureAiKeyForProvider(provider: Env["AI_PROVIDER"] = env.AI_PROVIDER) {
  if (provider === "openai" && !env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY es requerida cuando AI_PROVIDER=openai");
  }
  if (provider === "anthropic" && !env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY es requerida cuando AI_PROVIDER=anthropic");
  }
  return provider;
}