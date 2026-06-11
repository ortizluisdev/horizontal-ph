export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "Horizontal PH API",
    version: "1.0.0",
    description: "API para gestión de comunidades, cobranza, contabilidad, PQRS y notificaciones.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "auth", description: "Autenticación y tokens" },
    { name: "usuarios", description: "Gestión de usuarios" },
    { name: "unidades", description: "Gestión de unidades" },
    { name: "conjuntos", description: "Gestión de conjuntos" },
    { name: "asambleas", description: "Gestión de asambleas" },
    { name: "cobranza", description: "Gestión de cobranza" },
    { name: "contabilidad", description: "Gestión de contabilidad" },
    { name: "pqrs", description: "Gestión de PQRS" },
    { name: "notificaciones", description: "Gestión de notificaciones" },
    { name: "normativa", description: "Gestión de normativa" },
  ],
};

export default swaggerConfig;
