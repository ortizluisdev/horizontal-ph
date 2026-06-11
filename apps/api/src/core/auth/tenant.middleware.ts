import type { FastifyReply, FastifyRequest } from "fastify";

export default async function tenantMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const tenantId =
    (req.headers["x-tenant-id"] as string) ||
    (req.hostname?.split(".")[0] ?? null);

  if (!tenantId) {
    return reply.code(400).send({ message: "Tenant no identificado" });
  }

  (req as any).tenantId = tenantId;
}