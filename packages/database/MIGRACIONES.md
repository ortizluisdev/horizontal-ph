# 📋 Migraciones de Base de Datos - Horizontal PH

**Descripción:** Sistema profesional de gestión de conjuntos residenciales con soporte multi-tenancy, facturación, asambleas, PQRS, auditoría completa y agentes IA.

---

## 📑 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Estructura de Migraciones](#estructura-de-migraciones)
3. [Módulos y Funcionalidades](#módulos-y-funcionalidades)
4. [Relaciones Entre Tablas](#relaciones-entre-tablas)
5. [Consideraciones Técnicas](#consideraciones-técnicas)
6. [Cómo Ejecutar](#cómo-ejecutar)

---

## 🎯 Descripción General

Las migraciones crean un esquema de base de datos robusto y escalable para un sistema de gestión integral de propiedades residenciales. Incluye:

- ✅ **Multi-tenancy**: Múltiples organizaciones independientes
- ✅ **Autenticación & Seguridad**: Roles, permisos, auditoría completa
- ✅ **Gestión Financiera**: Cobranza, contabilidad, convenios de pago
- ✅ **Comunicación**: Notificaciones, circulares, boletines
- ✅ **Operativa**: Asambleas, PQRS, mantenimiento, vigilancia
- ✅ **IA**: Logs de agentes inteligentes con RAG

---

## 📊 Estructura de Migraciones

### Fase 1: Infraestructura Base (001-005)

| # | Migración | Tablas Principales | Propósito |
|---|-----------|-------------------|----------|
| 001 | `create_tenants` | `tenants` | Multi-tenancy: Organizaciones separadas |
| 002 | `create_conjuntos` | `conjuntos` | Propiedades residenciales |
| 003 | `create_unidades` | `unidades` | Apartamentos/locales dentro de conjuntos |
| 004 | `create_cobranza` | `cobranza` | Facturación, pagos, deudas |
| 005 | `create_contabilidad` | `contabilidad`, `contabilidad_categorias` | Asientos contables, movimientos |

### Fase 2: Operativa (006-008)

| # | Migración | Tablas Principales | Propósito |
|---|-----------|-------------------|----------|
| 006 | `create_asambleas` | `asambleas`, `acuerdos`, `votaciones` | Reuniones, decisiones, compromisos |
| 007 | `create_pqrs` | `pqrs`, `pqrs_seguimiento` | Solicitudes, quejas, reclamos |
| 008 | `create_ai_logs` | `ai_logs`, `ai_rag_documents`, `ai_conversations` | Logs de agentes IA con RAG |

### Fase 3: Autenticación (009-010)

| # | Migración | Tablas Principales | Propósito |
|---|-----------|-------------------|----------|
| 009 | `create_auth` | `users`, `auth_roles`, `auth_permisos`, `user_sessions`, `user_audit_log` | Sistema completo de auth |
| 010 | `create_refresh_tokens` | `refresh_tokens`, `refresh_token_audit`, `token_blacklist` | Seguridad de sesiones |

### Fase 4: Dominio (011-014)

| # | Migración | Tablas Principales | Propósito |
|---|-----------|-------------------|----------|
| 011 | `create_propietarios_inquilinos` | `propietarios`, `inquilinos`, `convenios_pago` | Residentes y arrendatarios |
| 012 | `create_servicios_infraestructura` | `servicios_contratados`, `areas_comunes`, `mantenimiento` | Infraestructura y servicios |
| 013 | `create_seguridad_acceso` | `control_acceso`, `camaras_vigilancia`, `eventos_seguridad` | Control de acceso y vigilancia |
| 014 | `create_notificaciones_comunicacion` | `notificaciones`, `boletines`, `circulares`, `encuestas` | Sistema de comunicaciones |

---

## 🏗️ Módulos y Funcionalidades

### 1️⃣ **Tenants (001)**
```sql
tenants
├── Razón Social (única)
├── Plan de suscripción (basic/professional/enterprise)
├── Contacto y ubicación
└── Auditoría (created_by, updated_by)
```

### 2️⃣ **Conjuntos (002)**
```sql
conjuntos
├── Referencia a tenant (multi-tenancy)
├── Tipo (edificio, casa, ciudadela, condominio)
├── Información catastral
├── Datos de administrador
└── Áreas (total y común)
```

### 3️⃣ **Unidades (003)**
```sql
unidades
├── Referencia a conjunto
├── Número, torre, piso
├── Tipo (apartamento, casa, local, garaje)
├── Medidores (agua, gas, energía)
├── Estado de ocupación
└── Datos de propiedad (matrícula)
```

### 4️⃣ **Cobranza (004)**
```sql
cobranza
├── Referencia a unidad
├── Concepto (cuota, servicios, mantenimiento)
├── Valores (base, impuesto, total)
├── Pago (monto, fecha, método)
├── Estado (pendiente, pagado, vencido)
└── Trazabilidad (cobrador, envío)
```

### 5️⃣ **Contabilidad (005)**
```sql
contabilidad
├── Referencia a conjunto
├── Asiento contable (único)
├── Movimiento (ingreso/egreso/transferencia)
├── Categoría de gastos
├── Valores (débito/crédito)
├── Aprobación y auditoría
└── Categorías contables

contabilidad_categorias
├── Código contable
├── Tipo (ingreso/egreso/activo/pasivo/patrimonio)
└── Descripción
```

### 6️⃣ **Asambleas (006)**
```sql
asambleas
├── Tipo (ordinaria/extraordinaria)
├── Fecha y lugar
├── Quórum y asistencia
└── Acta

asamblea_acuerdos
├── Número del acuerdo
├── Responsable y vencimiento
└── Estado de cumplimiento

asamblea_votaciones
├── Votación
├── Resultados (favor/contra/abstenciones)
└── Resultado final
```

### 7️⃣ **PQRS (007)**
```sql
pqrs
├── Número de radicado (único)
├── Tipo (petición/queja/reclamo/sugerencia)
├── Prioridad y categoría
├── Solicitante y responsable
├── Tiempos de resolución
├── Satisfacción del usuario
└── Seguimiento

pqrs_seguimiento
├── Histórico de cambios
├── Acciones realizadas
└── Auditoría de cambios
```

### 8️⃣ **IA Logs (008)**
```sql
ai_logs
├── Tenant y usuario
├── Tipo de agente (financial/collections/legal/reports)
├── Request y response (tokens)
├── Modelo y parámetros de IA
├── Status de ejecución
├── Costos estimados
├── Acciones realizadas
├── Evaluación de usuario
└── Metadatos

ai_rag_documents
├── Documentos recuperados
├── Scores de similitud
└── Fuente

ai_conversations
├── Conversaciones multi-turno
├── Estado (activa/archivada)
└── Costo total

ai_conversation_messages
├── Mensajes en conversación
├── Rol (user/assistant/system)
└── Tokens
```

### 9️⃣ **Autenticación (009)**
```sql
auth_roles
├── Nombre (único)
├── Nivel de acceso
└── Descripción

auth_permisos
├── Nombre (único)
├── Módulo y acción
└── Descripción

auth_roles_permisos
└── Asociación many-to-many

users
├── Tenant y unidad
├── Email (único por tenant)
├── Contraseña (hash + salt)
├── Tipo de usuario (propietario/inquilino/admin/etc)
├── Verificación y bloqueo
├── Último login y intentos fallidos
├── Auditoría completa
└── Soft delete

user_sessions
├── IP, dispositivo, navegador
├── Fechas de sesión
└── Estado

user_audit_log
├── Acciones (login/logout/cambio password)
├── Cambios de datos
├── IP y user agent
└── Usuario que realizó cambio
```

### 🔟 **Refresh Tokens (010)**
```sql
refresh_tokens
├── User ID
├── Token hash (nunca almacenar en texto plano)
├── Token family (para detectar reuse)
├── Vencimiento y revocación
├── IP y dispositivo
└── Auditoría

refresh_token_audit
├── Acciones (created/used/revoked)
├── IP y user agent
└── Historial

token_blacklist
├── Tokens comprometidos
├── Razón de blacklist
└── Vencimiento automático
```

### 1️⃣1️⃣ **Propietarios e Inquilinos (011)**
```sql
propietarios
├── Usuario asociado
├── Documento de identificación
├── Datos personales
├── Porcentaje de propiedad
└── Auditoría

propietario_unidades
├── Tipo de tenencia (propia/arrendada/usufructo)
├── Porcentaje de participación
└── Fechas de tenencia

inquilinos
├── Usuario asociado
├── Documento de identificación
├── Datos de arrendamiento
├── Depósito de caución
└── Contrato

codeudores
├── Avalistas
├── Información de contacto
└── Relación con inquilino

convenios_pago
├── Deuda original
├── Número de cuotas
├── Tasa de interés
└── Estado de cumplimiento
```

### 1️⃣2️⃣ **Servicios e Infraestructura (012)**
```sql
servicios_contratados
├── Tipo (agua/gas/energía/basuras/seguridad)
├── Proveedor
├── Valor mensual
└── Contrato

areas_comunes
├── Tipo (piscina/gimnasio/parque/salón/cancha)
├── Ubicación y capacidad
├── Horario de acceso
├── Valor de mantenimiento
└── Reserva requerida

reservas_areas_comunes
├── Área a reservar
├── Usuario y fecha
├── Número de personas
├── Propósito
└── Cancelación

mantenimiento_reparaciones
├── Número de orden (único)
├── Tipo (preventivo/correctivo/emergencia)
├── Prioridad
├── Contratista
├── Presupuesto y costo final
├── Fotos antes/después
└── Aprobación

inspecciones_tecnicas
├── Número de inspección
├── Tipo (estructural/eléctrica/hidráulica)
├── Hallazgos y recomendaciones
├── Prioridad de reparaciones
└── Reporte

infraestructura_documentos
├── Tipo (planos/licencias/certificados/manuales)
├── Vencimiento
└── Almacenamiento
```

### 1️⃣3️⃣ **Seguridad y Acceso (013)**
```sql
control_acceso
├── Registro de entrada/salida
├── Tipo (residente/visitante/proveedor)
├── Vigilantes de entrada/salida
├── Duración y propósito
└── Observaciones

pases_ingreso
├── Código único
├── Tipo (residente/temporal/proveedor)
├── Estado (activo/inactivo/perdido)
├── Reposiciones
└── Depósito

eventos_seguridad
├── Tipo (acceso no autorizado/intento robo/vandalismo)
├── Severity (leve/normal/grave/crítica)
├── Personas y bienes afectados
├── Autoridades notificadas
├── Fotos y videos
├── Resolución
└── Costos de reparación

bitacora_vigilancia
├── Vigilante y turno
├── Novedades del turno
├── Cantidad de eventos
├── Revisión por supervisor
└── Observaciones

camaras_vigilancia
├── Código y ubicación
├── Tipo y especificaciones
├── Conectividad
├── NVR y canal
├── Retención de video
└── Mantenimiento

botones_panico
├── Ubicación
├── Tipo (residente/área común)
├── Estado
├── Contacto de emergencia
└── Pruebas periódicas

activaciones_panico
├── Fecha de activación
├── Usuario
├── Razón
├── Respuesta recibida
├── Tiempo de respuesta
└── Tiempo de incidente
```

### 1️⃣4️⃣ **Notificaciones y Comunicación (014)**
```sql
canales_comunicacion
├── Tipo (email/SMS/push/WhatsApp)
├── Proveedor
├── Configuración
└── Estado

templates_notificacion
├── Nombre (único por conjunto)
├── Tipo de evento
├── Asunto y contenido
├── Variables disponibles
├── Canales por defecto
└── Activo

notificaciones
├── Usuario destino
├── Template asociado
├── Estado (pendiente/enviada/entregada/leída)
├── Canal de envío
├── Programación
├── Reintentos
├── Confirmación requerida
├── Importancia/urgencia
└── Auditoría

boletines
├── Número único
├── Título y contenido
├── Editor y revisor
├── Estado (borrador/revisión/aprobado/publicado)
├── PDF y imagen
├── Distribución
└── Auditoría

circulares
├── Número único
├── Título y contenido
├── Remitente
├── Fecha de emision y efectividad
├── Dirigida a (propietarios/residentes/empleados/todos)
├── Acuse de recibo
└── Estado

acuse_recibo_circulares
├── Circular
├── Usuario que recepta
└── Fecha de recepción

tablero_anuncios
├── Título y contenido
├── Categoría
├── Autor
├── Período de validez
├── Destacado
├── Visualizaciones
└── Lectura por usuario

encuestas_satisfaccion
├── Título
├── Fecha de vigencia
├── Tipo
├── Publicación de resultados
└── Preguntas

preguntas_encuesta
├── Número
├── Contenido
├── Tipo de respuesta (sí/no/escala/múltiple/abierta)
├── Opciones
└── Requerida

respuestas_encuesta
├── Pregunta
├── Usuario respondedor
├── Respuesta
└── Fecha
```

---

## 🔗 Relaciones Entre Tablas

### Jerarquía Principal
```
tenants (1)
└── conjuntos (many)
    ├── unidades (many)
    │   ├── cobranza (many)
    │   ├── propietario_unidades (many)
    │   ├── inquilinos (many)
    │   │   └── codeudores (many)
    │   ├── reservas_areas_comunes (many)
    │   └── propietarios (many)
    │       └── propietario_unidades (many)
    ├── asambleas (many)
    │   ├── asamblea_acuerdos (many)
    │   └── asamblea_votaciones (many)
    ├── contabilidad (many)
    │   └── contabilidad_categorias (many)
    ├── areas_comunes (many)
    │   └── reservas_areas_comunes (many)
    ├── pqrs (many)
    │   └── pqrs_seguimiento (many)
    └── servicios_contratados (many)
```

### Relaciones de Seguridad y Acceso
```
users (1)
├── auth_roles (many to many via auth_roles_permisos)
│   └── auth_permisos (many)
├── unidades (optional)
├── conjuntos (optional)
├── refresh_tokens (many)
├── user_sessions (many)
└── user_audit_log (many)
```

### Relaciones de IA
```
ai_conversations (1)
├── ai_conversation_messages (many)
└── ai_logs (many)
    └── ai_rag_documents (many)
```

---

## ⚙️ Consideraciones Técnicas

### 1. **Identifiers**
- Todo usa **UUID** con `gen_random_uuid()` (PostgreSQL)
- Compatible con portabilidad a otras bases de datos

### 2. **Timestamps**
- Todos con `TIMESTAMP WITH TIME ZONE DEFAULT now()`
- Zona horaria explícita para consistencia global
- Auditoría: `created_at`, `updated_at`, `deleted_at`

### 3. **Integridad Referencial**
- **ON DELETE CASCADE**: Para datos dependientes (cobranzas de unidades)
- **ON DELETE SET NULL**: Para referencias opcionales (roles de usuarios)
- **UNIQUE constraints**: Donde hay números únicos (recibos, radicados, etc.)

### 4. **Indexación**
- Índices en columnas de búsqueda frecuente
- Índices compuestos para búsquedas multi-campo
- Índices parciales (`WHERE`) para subconjuntos frecuentes

### 5. **Soft Deletes**
- `deleted_at TIMESTAMP` para históricos (no implementado explícitamente, usar trigger)
- `activo BOOLEAN` para lógica de negocio

### 6. **Datos Flexibles**
- **JSONB** para datos complejos y variables:
  - `tags` en ai_logs
  - `metadata` en ai_logs
  - `opciones_respuesta` en preguntas_encuesta
  - `cambios_anteriores`/`cambios_nuevos` en audit_log

### 7. **Auditoría**
- `created_by`, `updated_by` en tablas críticas
- `user_audit_log` para historial completo
- `refresh_token_audit` para seguridad
- `pqrs_seguimiento` para historial de cambios

### 8. **Seguridad**
- Passwords con **hash + salt** (implementar en aplicación)
- Tokens con **hash** (nunca en texto plano)
- **Token blacklist** para revocaciones
- Bloqueo de usuarios tras intentos fallidos
- IP y user agent registrados

### 9. **Multi-tenancy**
- `tenant_id` en todas las tablas de datos
- Políticas de aislamiento en aplicación (o RLS en PostgreSQL)
- Cada tenant con datos completamente separados

### 10. **Mejora de Performance**
```sql
-- Índices para búsquedas frecuentes
CREATE INDEX idx_cobranza_deuda ON cobranza (unidad_id, estado) 
  WHERE estado IN ('pendiente', 'vencido', 'parcial');

-- Índices para reportes
CREATE INDEX idx_contabilidad_balance ON contabilidad 
  (conjunto_id, fecha_movimiento, tipo_movimiento);

-- Índices para notificaciones pendientes
CREATE INDEX idx_notificaciones_pendientes ON notificaciones 
  (estado, fecha_programada) WHERE estado IN ('pendiente', 'fallida');
```

---

## 🚀 Cómo Ejecutar

### Opción 1: Usar Herramienta de Migraciones
```bash
# Con Flyway
flyway info
flyway migrate

# Con Liquibase
liquibase status
liquibase update
```

### Opción 2: Ejecutar Manualmente en PostgreSQL
```sql
-- Conectarse a la base de datos
psql -h localhost -U postgres -d horizontal_ph

-- Ejecutar migraciones en orden
\i migrations/001_create_tenants.sql
\i migrations/002_create_conjuntos.sql
-- ... (todas las migraciones)
```

### Opción 3: Script de Bash
```bash
#!/bin/bash
for migration in migrations/*.sql; do
  echo "Ejecutando $migration..."
  psql -h localhost -U postgres -d horizontal_ph -f "$migration"
done
```

---

## 📝 Notas Finales

- ✅ Todas las migraciones son **idempotentes** (seguras de ejecutar múltiples veces)
- ✅ Uso de `IF NOT EXISTS` en todas las tablas
- ✅ Documentación completa con COMMENT
- ✅ Preparado para PostgreSQL 12+
- ✅ Compatible con máquinas de migraciones modernas
- ⚠️ **Importante**: Agregar triggers para auditoría automática en producción
- ⚠️ **Importante**: Implementar Row Level Security (RLS) para multi-tenancy en BD

---

**Última actualización:** 2025-06-11  
**Versión:** 1.0  
**Estado:** ✅ Completo y Profesional
