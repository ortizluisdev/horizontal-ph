-- 004_create_cobranza.sql
-- Tabla de Cobranza (facturación y pagos de cuotas de administración y servicios)
-- Gestiona los cobros, pagos y deuda de los propietarios

CREATE TABLE IF NOT EXISTS cobranza (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  conjunto_id UUID NOT NULL REFERENCES conjuntos(id) ON DELETE CASCADE,
  numero_recibo TEXT UNIQUE NOT NULL,
  concepto TEXT NOT NULL, -- cuota administración, servicios, mantenimiento, otro
  descripcion TEXT,
  valor_base DECIMAL(12, 2) NOT NULL,
  valor_impuesto DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2) NOT NULL,
  valor_pagado DECIMAL(12, 2) DEFAULT 0,
  valor_deuda DECIMAL(12, 2),
  mes_facturacion INTEGER,
  anio_facturacion INTEGER,
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE NOT NULL,
  fecha_pago DATE,
  metodo_pago TEXT, -- efectivo, transferencia, tarjeta, cheque, otro
  estado TEXT DEFAULT 'pendiente', -- pendiente, pagado, parcial, vencido, cancelado
  referencia_pago TEXT,
  observaciones TEXT,
  enviado_cobrador BOOLEAN DEFAULT false,
  fecha_envio_cobrador DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_cobranza_unidad_id ON cobranza (unidad_id);
CREATE INDEX IF NOT EXISTS idx_cobranza_conjunto_id ON cobranza (conjunto_id);
CREATE INDEX IF NOT EXISTS idx_cobranza_estado ON cobranza (estado);
CREATE INDEX IF NOT EXISTS idx_cobranza_fecha_vencimiento ON cobranza (fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_cobranza_mes_anio ON cobranza (mes_facturacion, anio_facturacion);
CREATE INDEX IF NOT EXISTS idx_cobranza_numero_recibo ON cobranza (numero_recibo);
CREATE INDEX IF NOT EXISTS idx_cobranza_created_at ON cobranza (created_at);

-- Índice para búsquedas de deuda
CREATE INDEX IF NOT EXISTS idx_cobranza_deuda ON cobranza (unidad_id, estado) WHERE estado IN ('pendiente', 'vencido', 'parcial');

-- Comentarios de la tabla
COMMENT ON TABLE cobranza IS 'Registro de cobranzas, facturación y pagos de cuotas de administración';
COMMENT ON COLUMN cobranza.unidad_id IS 'Referencia a la unidad cobradora';
COMMENT ON COLUMN cobranza.numero_recibo IS 'Número único del recibo de cobranza';
COMMENT ON COLUMN cobranza.concepto IS 'Concepto de pago: cuota administración, servicios, mantenimiento, etc.';
COMMENT ON COLUMN cobranza.estado IS 'Estado del pago: pendiente, pagado, parcial, vencido, cancelado';
