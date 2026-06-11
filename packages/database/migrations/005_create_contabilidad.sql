-- 005_create_contabilidad.sql
-- Tabla de Contabilidad (registro de movimientos financieros y estados contables)
-- Gestiona asientos contables, ingresos, egresos y reportes financieros

CREATE TABLE IF NOT EXISTS contabilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  numero_asiento TEXT UNIQUE NOT NULL,
  tipo_movimiento TEXT NOT NULL, -- ingreso, egreso, transferencia, ajuste
  categoria TEXT NOT NULL, -- administración, mantenimiento, servicios, otro
  descripcion TEXT,
  valor_debit DECIMAL(12, 2) DEFAULT 0,
  valor_credit DECIMAL(12, 2) DEFAULT 0,
  saldo DECIMAL(12, 2),
  fecha_movimiento DATE NOT NULL DEFAULT CURRENT_DATE,
  numero_comprobante TEXT,
  referencia_externa TEXT, -- número de factura, recibo, etc.
  beneficiario TEXT,
  cuenta_origen TEXT,
  cuenta_destino TEXT,
  estado TEXT DEFAULT 'registro', -- registro, conciliado, reversado
  documento_adjunto_url TEXT,
  aprobado BOOLEAN DEFAULT false,
  aprobado_por UUID,
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  observaciones TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_contabilidad_conjunto_id ON contabilidad (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_contabilidad_tipo_movimiento ON contabilidad (tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_contabilidad_categoria ON contabilidad (categoria);
CREATE INDEX IF NOT EXISTS idx_contabilidad_fecha_movimiento ON contabilidad (fecha_movimiento);
CREATE INDEX IF NOT EXISTS idx_contabilidad_estado ON contabilidad (estado);
CREATE INDEX IF NOT EXISTS idx_contabilidad_numero_asiento ON contabilidad (numero_asiento);
CREATE INDEX IF NOT EXISTS idx_contabilidad_aprobado ON contabilidad (aprobado);
CREATE INDEX IF NOT EXISTS idx_contabilidad_created_at ON contabilidad (created_at);

-- Índice para reportes de balance
CREATE INDEX IF NOT EXISTS idx_contabilidad_balance ON contabilidad (conjunto_id, fecha_movimiento, tipo_movimiento);

-- Tabla auxiliar para categorías contables
CREATE TABLE IF NOT EXISTS contabilidad_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL, -- ingreso, egreso, activo, pasivo, patrimonio
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conjunto_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_contabilidad_categorias_conjunto ON contabilidad_categorias (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_contabilidad_categorias_tipo ON contabilidad_categorias (tipo);

-- Comentarios de las tablas
COMMENT ON TABLE contabilidad IS 'Registro de asientos contables y movimientos financieros del conjunto';
COMMENT ON COLUMN contabilidad.numero_asiento IS 'Número único del asiento contable';
COMMENT ON COLUMN contabilidad.tipo_movimiento IS 'Tipo: ingreso, egreso, transferencia, ajuste';
COMMENT ON TABLE contabilidad_categorias IS 'Categorías contables para clasificar movimientos';
