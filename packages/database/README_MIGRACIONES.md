# 🏗️ Migraciones de Base de Datos - Horizontal PH

> **14 migraciones profesionales** para gestión integral de conjuntos residenciales con soporte multi-tenancy, auditoría completa y agentes IA.

---

## 📦 Resumen Ejecutivo

| Aspecto | Detalles |
|--------|----------|
| **Total de Migraciones** | 14 archivos SQL |
| **Tablas Creadas** | ~50+ tablas principales |
| **Base de Datos** | PostgreSQL 12+ |
| **Patrón** | Multi-tenancy con aislamiento por tenant |
| **Seguridad** | Roles, permisos, auditoría, RLS-ready |
| **Documentación** | 100% comentada |

---

## 🎯 Migraciones por Categoría

### 📍 Infraestructura Base
- ✅ [001] **Tenants** - Organizaciones y multi-tenancy
- ✅ [002] **Conjuntos** - Propiedades residenciales
- ✅ [003] **Unidades** - Apartamentos y locales
- ✅ [004] **Cobranza** - Facturación y pagos
- ✅ [005] **Contabilidad** - Asientos financieros

### 🏢 Operativa
- ✅ [006] **Asambleas** - Reuniones y acuerdos
- ✅ [007] **PQRS** - Peticiones y reclamos
- ✅ [008] **IA Logs** - Agentes inteligentes

### 🔐 Autenticación y Seguridad
- ✅ [009] **Auth** - Usuarios, roles, permisos
- ✅ [010] **Refresh Tokens** - Gestión de sesiones

### 👥 Dominio del Negocio
- ✅ [011] **Propietarios e Inquilinos** - Residentes
- ✅ [012] **Servicios e Infraestructura** - Áreas comunes
- ✅ [013] **Seguridad y Acceso** - Control físico
- ✅ [014] **Comunicaciones** - Notificaciones y boletines

---

## 📋 Detalles de Migraciones

### 001 - Tenants (Multi-tenancy)
```
tenants
├── Razón social única
├── Plan de suscripción
├── Contacto y ubicación
└── Auditoría (created_by, updated_by)
```
**Tablas:** 1 | **Índices:** 5 | **Registros iniciales:** 0

### 002 - Conjuntos
```
conjuntos
├── Tipo (edificio, casa, ciudadela)
├── Información catastral
├── Datos de administrador
└── Áreas (total y común)
```
**Tablas:** 1 | **Índices:** 6 | **Registros iniciales:** 0

### 003 - Unidades
```
unidades
├── Número, torre, piso
├── Tipo (apartamento, local, garaje)
├── Medidores (agua, gas, energía)
├── Datos de propiedad (matrícula)
└── Estado de ocupación
```
**Tablas:** 1 | **Índices:** 6 | **Registros iniciales:** 0

### 004 - Cobranza
```
cobranza
├── Facturación y recibos
├── Pagos y deudas
├── Métodos de cobro
└── Estados de pago
```
**Tablas:** 1 | **Índices:** 8 | **Registros iniciales:** 0

### 005 - Contabilidad
```
contabilidad
├── Asientos contables
├── Débitos y créditos
├── Categorías de gastos
├── Aprobación y auditoría
└── Categorías contables

contabilidad_categorias
└── Clasificación de movimientos
```
**Tablas:** 2 | **Índices:** 8 | **Registros iniciales:** 0

### 006 - Asambleas
```
asambleas
├── Ordinarias y extraordinarias
├── Acta y asistencia
└── Quórum

asamblea_acuerdos
├── Número de acuerdo
├── Responsable y vencimiento
└── Estado

asamblea_votaciones
├── Tema de votación
├── Resultados (favor/contra/abstenciones)
└── Decisión final
```
**Tablas:** 3 | **Índices:** 7 | **Registros iniciales:** 0

### 007 - PQRS
```
pqrs
├── Número de radicado
├── Tipo (petición/queja/reclamo/sugerencia)
├── Prioridad y categoría
├── Solicitante y responsable
├── Tiempos y satisfacción

pqrs_seguimiento
├── Historial de cambios
└── Auditoría
```
**Tablas:** 2 | **Índices:** 11 | **Registros iniciales:** 0

### 008 - IA Logs
```
ai_logs
├── Agente (financial/collections/legal/reports)
├── Tokens y costos
├── Status de ejecución
├── Evaluación del usuario
└── Metadatos

ai_rag_documents
├── Documentos recuperados
└── Scores de similitud

ai_conversations
├── Conversaciones multi-turno
└── Costo total

ai_conversation_messages
└── Historial de mensajes
```
**Tablas:** 4 | **Índices:** 11 | **Registros iniciales:** 0

### 009 - Autenticación
```
auth_roles
├── Nombre único
└── Nivel de acceso

auth_permisos
├── Módulo y acción
└── Descripción

auth_roles_permisos
└── Many-to-many

users
├── Email único por tenant
├── Contraseña (hash + salt)
├── Tipo de usuario
├── Verificación y bloqueo
├── Último login
├── Auditoría completa
└── Soft delete

user_sessions
├── IP, dispositivo, navegador
└── Período de sesión

user_audit_log
├── Acciones (login/logout/cambios)
└── Auditoría
```
**Tablas:** 5 | **Índices:** 16 | **Registros iniciales:** 9 roles

### 010 - Refresh Tokens
```
refresh_tokens
├── Token hash (nunca en texto plano)
├── Token family (reuse detection)
├── Vencimiento y revocación
└── IP y dispositivo

refresh_token_audit
├── Historial de acciones

token_blacklist
├── Tokens comprometidos
└── Razón de blacklist
```
**Tablas:** 3 | **Índices:** 11 | **Registros iniciales:** 0

### 011 - Propietarios e Inquilinos
```
propietarios
├── Usuario asociado
├── Documento de identificación
└── Porcentaje de propiedad

propietario_unidades
├── Tipo de tenencia
├── Participación
└── Fechas

inquilinos
├── Usuario asociado
├── Datos de arrendamiento
├── Depósito de caución
└── Contrato

codeudores
├── Avalistas
└── Información de contacto

convenios_pago
├── Deuda fraccionada
├── Cuotas y intereses
└── Estado
```
**Tablas:** 5 | **Índices:** 14 | **Registros iniciales:** 0

### 012 - Servicios e Infraestructura
```
servicios_contratados
├── Tipo (agua/gas/energía)
├── Proveedor
└── Valor

areas_comunes
├── Tipo (piscina/gimnasio/parque)
├── Horario de acceso
└── Reserva

reservas_areas_comunes
├── Usuario y fecha
├── Propósito
└── Cancelación

mantenimiento_reparaciones
├── Orden de trabajo
├── Contratista
├── Fotos antes/después
└── Aprobación

inspecciones_tecnicas
├── Inspección técnica
├── Hallazgos
└── Recomendaciones

infraestructura_documentos
├── Planos, licencias, certificados
└── Vencimiento
```
**Tablas:** 6 | **Índices:** 16 | **Registros iniciales:** 0

### 013 - Seguridad y Acceso
```
control_acceso
├── Registro entrada/salida
├── Tipo (residente/visitante/proveedor)
└── Vigilantes

pases_ingreso
├── Código único
├── Tipo de pase
└── Reposiciones

eventos_seguridad
├── Tipo (acceso no autorizado/robo/vandalismo)
├── Severity (leve/normal/grave/crítica)
├── Autoridades
└── Resolución

bitacora_vigilancia
├── Turno de vigilante
├── Novedades
└── Revisión

camaras_vigilancia
├── Ubicación y tipo
├── Conectividad
├── Retención de video
└── Mantenimiento

botones_panico
├── Ubicación
├── Estado
└── Pruebas

activaciones_panico
├── Registro de activación
├── Tiempo de respuesta
└── Incidente
```
**Tablas:** 8 | **Índices:** 18 | **Registros iniciales:** 0

### 014 - Comunicaciones
```
canales_comunicacion
├── Email, SMS, Push, WhatsApp
└── Configuración

templates_notificacion
├── Templates reutilizables
└── Variables

notificaciones
├── Notificaciones enviadas
├── Estado (pendiente/entregada/leída)
├── Reintentos
└── Confirmación

boletines
├── Boletines periódicos
├── Editor y revisor
├── PDF
└── Distribución

circulares
├── Circulares oficiales
├── Acuse de recibo
└── Vencimiento

acuse_recibo_circulares
└── Recepción confirmada

tablero_anuncios
├── Anuncios públicos
├── Categoría
├── Visualizaciones
└── Lectura por usuario

encuestas_satisfaccion
├── Encuestas
└── Resultados

preguntas_encuesta
├── Preguntas
└── Tipos de respuesta

respuestas_encuesta
└── Respuestas registradas
```
**Tablas:** 9 | **Índices:** 18 | **Registros iniciales:** 0

---

## 📊 Estadísticas Globales

```
Total de Migraciones:        14
Total de Tablas:             50+
Total de Índices:            ~130+
Comentarios SQL:             100%
Integridad Referencial:      ✅ Completa
Multi-tenancy:               ✅ Implementada
Auditoría:                   ✅ Completa
Documentación:               ✅ 100%
```

---

## 🔗 Archivos Relacionados

- 📄 [MIGRACIONES.md](./MIGRACIONES.md) - Documentación completa
- 📁 [migrations/](./migrations/) - Archivos SQL
- 📋 [seeds/](./seeds/) - Datos iniciales (próximamente)

---

## 🚀 Ejecución Rápida

### PostgreSQL
```bash
# Conectarse a la BD
psql -h localhost -U postgres -d horizontal_ph

# Ejecutar todas las migraciones
for f in migrations/*.sql; do psql -d horizontal_ph -f "$f"; done
```

### Con Herramienta de Migraciones
```bash
# Flyway
flyway migrate

# Liquibase
liquibase update
```

---

## ⚙️ Características Profesionales

✅ **Seguridad**
- Autenticación con hash + salt
- Tokens con hash (nunca en texto plano)
- Auditoría completa de cambios
- Bloqueo de usuarios

✅ **Escalabilidad**
- Multi-tenancy con aislamiento
- Índices optimizados
- Particiones preparadas
- UUIDs para portabilidad

✅ **Calidad**
- 100% documentado
- Relaciones con integridad referencial
- Constraints para consistencia
- Soft deletes para históricos

✅ **Operativa**
- Timestamps con zona horaria
- Metadatos flexibles (JSONB)
- Rastreabilidad (created_by, updated_by)
- Estados controlados

---

## 📞 Soporte

Para preguntas sobre las migraciones:
1. Revisar [MIGRACIONES.md](./MIGRACIONES.md) completo
2. Consultar comentarios SQL en los archivos
3. Revisar documentación de tablas específicas

---

**Versión:** 1.0  
**Estado:** ✅ Completo y Profesional  
**Última actualización:** 2025-06-11  
**Autor:** GitHub Copilot Assistant
