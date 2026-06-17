import { ref, computed } from 'vue'
import { useNormativaStore } from '../store/normativa.store'
import type {
  TipoDocumento, EstadoDocumento, AlcanceDocumento, CategoriaLegal,
  NormativaCreatePayload,
} from '../types/normativa.types'

// ─── Catálogos ────────────────────────────────────────────────────────────────

export const TIPOS_DOCUMENTO: { value: TipoDocumento; label: string; icon: string }[] = [
  { value: 'reglamento_ph',      label: 'Reglamento PH',        icon: '📜' },
  { value: 'manual_convivencia', label: 'Manual convivencia',    icon: '🤝' },
  { value: 'acta_asamblea',      label: 'Acta de asamblea',     icon: '📋' },
  { value: 'resolucion',         label: 'Resolución',           icon: '⚖️' },
  { value: 'circular',           label: 'Circular',             icon: '📢' },
  { value: 'politica_interna',   label: 'Política interna',     icon: '📌' },
  { value: 'contrato',           label: 'Contrato',             icon: '✍️' },
  { value: 'ley_decreto',        label: 'Ley / Decreto',        icon: '🏛️' },
  { value: 'otro',               label: 'Otro',                 icon: '📄' },
]

export const ESTADOS_DOCUMENTO: { value: EstadoDocumento | ''; label: string }[] = [
  { value: '',            label: 'Todos los estados' },
  { value: 'vigente',     label: 'Vigente'           },
  { value: 'en_revision', label: 'En revisión'       },
  { value: 'borrador',    label: 'Borrador'          },
  { value: 'derogado',    label: 'Derogado'          },
  { value: 'archivado',   label: 'Archivado'         },
]

export const CATEGORIAS_LEGALES: { value: CategoriaLegal | ''; label: string }[] = [
  { value: '',                      label: 'Todas las categorías'    },
  { value: 'ley_675_2001',          label: 'Ley 675 de 2001'         },
  { value: 'decreto_reglamentario', label: 'Decreto reglamentario'   },
  { value: 'codigo_civil',          label: 'Código Civil'            },
  { value: 'nsr_10',                label: 'NSR-10'                  },
  { value: 'norma_tecnica',         label: 'Norma técnica'           },
  { value: 'reglamento_interno',    label: 'Reglamento interno'      },
  { value: 'decision_asamblea',     label: 'Decisión de asamblea'    },
  { value: 'otra',                  label: 'Otra'                    },
]

export const ALCANCES_DOCUMENTO: { value: AlcanceDocumento | ''; label: string }[] = [
  { value: '',                       label: 'Todos los alcances'        },
  { value: 'todos_propietarios',     label: 'Todos los propietarios'    },
  { value: 'consejo_administracion', label: 'Consejo de administración' },
  { value: 'administracion',         label: 'Administración'            },
  { value: 'comite_convivencia',     label: 'Comité de convivencia'     },
  { value: 'interno',                label: 'Uso interno'               },
]

// ─── Helpers de estilo ────────────────────────────────────────────────────────

export function estadoBadgeClass(estado: EstadoDocumento): string {
  const map: Record<EstadoDocumento, string> = {
    vigente:     'bg-green-100  text-green-800  ring-green-200',
    en_revision: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    borrador:    'bg-blue-100   text-blue-800   ring-blue-200',
    derogado:    'bg-red-100    text-red-700    ring-red-200',
    archivado:   'bg-gray-100   text-gray-600   ring-gray-200',
  }
  return map[estado] ?? 'bg-gray-100 text-gray-600 ring-gray-200'
}

export function estadoDotClass(estado: EstadoDocumento): string {
  const map: Record<EstadoDocumento, string> = {
    vigente:     'bg-green-500',
    en_revision: 'bg-yellow-500',
    borrador:    'bg-blue-500',
    derogado:    'bg-red-500',
    archivado:   'bg-gray-400',
  }
  return map[estado] ?? 'bg-gray-400'
}

export function estadoStripClass(estado: EstadoDocumento): string {
  const map: Record<EstadoDocumento, string> = {
    vigente:     'bg-green-500',
    en_revision: 'bg-yellow-400',
    borrador:    'bg-blue-400',
    derogado:    'bg-red-400',
    archivado:   'bg-gray-300',
  }
  return map[estado] ?? 'bg-gray-200'
}

// ─── Helpers de label ─────────────────────────────────────────────────────────

export function tipoLabel(tipo: TipoDocumento): string {
  return TIPOS_DOCUMENTO.find((t) => t.value === tipo)?.label ?? tipo
}

export function tipoIcon(tipo: TipoDocumento): string {
  return TIPOS_DOCUMENTO.find((t) => t.value === tipo)?.icon ?? '📄'
}

export function estadoLabel(estado: EstadoDocumento): string {
  return ESTADOS_DOCUMENTO.find((e) => e.value === estado)?.label ?? estado
}

export function categoriaLabel(cat?: CategoriaLegal | null): string {
  if (!cat) return '-'
  return CATEGORIAS_LEGALES.find((c) => c.value === cat)?.label ?? cat
}

export function alcanceLabel(alcance: AlcanceDocumento): string {
  return ALCANCES_DOCUMENTO.find((a) => a.value === alcance)?.label ?? alcance
}

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

export function formatDate(dt?: string | null): string {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function formatDateShort(dt?: string | null): string {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateInput(dt?: string | null): string {
  if (!dt) return ''
  return new Date(dt).toISOString().split('T')[0]
}

export function formatTamano(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024)           return `${bytes} B`
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function diasParaVencer(fechaHasta?: string | null): number | null {
  if (!fechaHasta) return null
  return Math.ceil((new Date(fechaHasta).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

// ─── Composable de formulario ─────────────────────────────────────────────────

export function useNormativaForm() {
  const store = useNormativaStore()

  const form = ref<NormativaCreatePayload>({
    conjuntoId:           '',
    titulo:               '',
    tipo:                 'reglamento_ph',
    categoria_legal:      'reglamento_interno',
    estado:               'borrador',
    alcance:              'todos_propietarios',
    numero_documento:     '',
    version:              '1.0',
    descripcion:          '',
    contenido:            '',
    archivo_url:          '',
    fecha_emision:        '',
    fecha_vigencia_desde: '',
    fecha_vigencia_hasta: '',
    aprobado_por:         '',
    tags:                 [],
  })

  const errors   = ref<Record<string, string>>({})
  const tagInput = ref('')

  function validate(): boolean {
    errors.value = {}
    if (!form.value.conjuntoId)
      errors.value.conjuntoId = 'El conjunto es obligatorio'
    if (!form.value.titulo?.trim() || form.value.titulo.length < 5)
      errors.value.titulo = 'El título debe tener al menos 5 caracteres'
    if (!form.value.tipo)
      errors.value.tipo = 'El tipo es obligatorio'
    if (
      form.value.fecha_vigencia_hasta &&
      form.value.fecha_vigencia_desde &&
      form.value.fecha_vigencia_hasta < form.value.fecha_vigencia_desde
    ) {
      errors.value.fecha_vigencia_hasta = 'La fecha fin no puede ser anterior a la de inicio'
    }
    return Object.keys(errors.value).length === 0
  }

  function addTag() {
    const t = tagInput.value.trim().toLowerCase()
    if (t && !form.value.tags?.includes(t)) form.value.tags = [...(form.value.tags ?? []), t]
    tagInput.value = ''
  }

  function removeTag(tag: string) {
    form.value.tags = (form.value.tags ?? []).filter((t) => t !== tag)
  }

  function loadFromNormativa(n: any) {
    form.value = {
      conjuntoId:           n.conjunto_id              ?? '',
      titulo:               n.titulo                   ?? '',
      tipo:                 n.tipo                     ?? 'reglamento_ph',
      categoria_legal:      n.categoria_legal          ?? 'reglamento_interno',
      estado:               n.estado                   ?? 'borrador',
      alcance:              n.alcance                  ?? 'todos_propietarios',
      numero_documento:     n.numero_documento         ?? '',
      version:              n.version                  ?? '1.0',
      descripcion:          n.descripcion              ?? '',
      contenido:            n.contenido                ?? '',
      archivo_url:          n.archivo_url              ?? '',
      fecha_emision:        formatDateInput(n.fecha_emision),
      fecha_vigencia_desde: formatDateInput(n.fecha_vigencia_desde),
      fecha_vigencia_hasta: formatDateInput(n.fecha_vigencia_hasta),
      aprobado_por:         n.aprobado_por             ?? '',
      tags:                 n.tags                     ?? [],
    }
  }

  function buildPayload() {
    const p: NormativaCreatePayload = {
      conjuntoId: form.value.conjuntoId,
      titulo:     form.value.titulo,
      tipo:       form.value.tipo,
    }
    if (form.value.categoria_legal)      p.categoria_legal      = form.value.categoria_legal
    if (form.value.estado)               p.estado               = form.value.estado
    if (form.value.alcance)              p.alcance              = form.value.alcance
    if (form.value.numero_documento)     p.numero_documento     = form.value.numero_documento
    if (form.value.version)              p.version              = form.value.version
    if (form.value.descripcion)          p.descripcion          = form.value.descripcion
    if (form.value.contenido)            p.contenido            = form.value.contenido
    if (form.value.archivo_url)          p.archivo_url          = form.value.archivo_url
    if (form.value.fecha_emision)        p.fecha_emision        = form.value.fecha_emision
    if (form.value.fecha_vigencia_desde) p.fecha_vigencia_desde = form.value.fecha_vigencia_desde
    if (form.value.fecha_vigencia_hasta) p.fecha_vigencia_hasta = form.value.fecha_vigencia_hasta
    if (form.value.aprobado_por)         p.aprobado_por         = form.value.aprobado_por
    if (form.value.tags?.length)         p.tags                 = form.value.tags
    return p
  }

  async function submit(): Promise<{ id: string } | null> {
    if (!validate()) return null
    try { return await store.create(buildPayload()) }
    catch { return null }
  }

  async function submitUpdate(id: string): Promise<boolean> {
    if (!validate()) return false
    try {
      const { conjuntoId, ...rest } = buildPayload()
      await store.update(id, rest)
      return true
    } catch { return false }
  }

  function reset() {
    form.value = {
      conjuntoId: '', titulo: '', tipo: 'reglamento_ph',
      categoria_legal: 'reglamento_interno', estado: 'borrador',
      alcance: 'todos_propietarios', numero_documento: '', version: '1.0',
      descripcion: '', contenido: '', archivo_url: '',
      fecha_emision: '', fecha_vigencia_desde: '', fecha_vigencia_hasta: '',
      aprobado_por: '', tags: [],
    }
    errors.value   = {}
    tagInput.value = ''
    store.clearError()
  }

  return {
    form, errors, tagInput,
    saving:      computed(() => store.saving),
    serverError: computed(() => store.error),
    validate, addTag, removeTag, loadFromNormativa, buildPayload, submit, submitUpdate, reset,
  }
}
