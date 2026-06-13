import { ref, computed } from 'vue'
import { useNormativaStore } from '../store/normativa.store'
import type {
  TipoDocumento, EstadoDocumento, AlcanceDocumento, CategoriaLegal,
  NormativaCreatePayload,
} from '../types/normativa.types'

export const TIPOS_DOCUMENTO: { value: TipoDocumento; label: string; icon: string }[] = [
  { value: 'reglamento_ph',      label: 'Reglamento PH',        icon: '📜' },
  { value: 'manual_convivencia', label: 'Manual de convivencia', icon: '🤝' },
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
  { value: 'reglamento_interno',    label: 'Reglamento interno'      },
  { value: 'decision_asamblea',     label: 'Decisión de asamblea'    },
  { value: 'decreto_reglamentario', label: 'Decreto reglamentario'   },
  { value: 'codigo_civil',          label: 'Código Civil'            },
  { value: 'nsr_10',                label: 'NSR-10'                  },
  { value: 'norma_tecnica',         label: 'Norma técnica'           },
  { value: 'otra',                  label: 'Otra'                    },
]

export const ALCANCES_DOCUMENTO: { value: AlcanceDocumento | ''; label: string }[] = [
  { value: '',                       label: 'Todos los alcances'       },
  { value: 'todos_propietarios',     label: 'Todos los propietarios'   },
  { value: 'consejo_administracion', label: 'Consejo de administración'},
  { value: 'administracion',         label: 'Administración'           },
  { value: 'comite_convivencia',     label: 'Comité de convivencia'    },
  { value: 'interno',                label: 'Uso interno'              },
]

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

export function tipoLabel(tipo: TipoDocumento): string {
  return TIPOS_DOCUMENTO.find((t) => t.value === tipo)?.label ?? tipo
}

export function tipoIcon(tipo: TipoDocumento): string {
  return TIPOS_DOCUMENTO.find((t) => t.value === tipo)?.icon ?? '📄'
}

export function categoriaLabel(cat: CategoriaLegal): string {
  return CATEGORIAS_LEGALES.find((c) => c.value === cat)?.label ?? cat
}

export function alcanceLabel(alcance: AlcanceDocumento): string {
  return ALCANCES_DOCUMENTO.find((a) => a.value === alcance)?.label ?? alcance
}

export function formatDate(dt: string): string {
  if (!dt) return '-'
  return new Date(dt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function formatDateShort(dt: string): string {
  if (!dt) return '-'
  return new Date(dt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateInput(dt: string): string {
  if (!dt) return ''
  return new Date(dt).toISOString().split('T')[0]
}

export function formatTamano(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function diasParaVencer(fechaHasta: string): number {
  return Math.ceil((new Date(fechaHasta).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function useNormativa() {
  const store = useNormativaStore()
  return {
    store, TIPOS_DOCUMENTO, ESTADOS_DOCUMENTO, CATEGORIAS_LEGALES, ALCANCES_DOCUMENTO,
    estadoBadgeClass, estadoDotClass, tipoLabel, tipoIcon, categoriaLabel, alcanceLabel,
    formatDate, formatDateShort, formatTamano, diasParaVencer,
  }
}

export function useNormativaForm(modo: 'crear' | 'editar' = 'crear') {
  const store = useNormativaStore()

  const form = ref<NormativaCreatePayload>({
    conjuntoId: '', titulo: '', tipo: 'reglamento_ph', categoria_legal: 'reglamento_interno',
    estado: 'borrador', alcance: 'todos_propietarios', numero_documento: '', version: '1.0',
    descripcion: '', contenido: '', fecha_emision: '', fecha_vigencia_desde: '',
    fecha_vigencia_hasta: '', aprobado_por: '', tags: [],
  })

  const errors   = ref<Record<string, string>>({})
  const tagInput = ref('')

  function validate(): boolean {
    errors.value = {}
    if (!form.value.conjuntoId)
      errors.value.conjuntoId = 'El conjunto es obligatorio'
    if (!form.value.titulo.trim() || form.value.titulo.length < 5)
      errors.value.titulo = 'El título debe tener al menos 5 caracteres'
    if (!form.value.tipo)
      errors.value.tipo = 'El tipo es obligatorio'
    if (!form.value.categoria_legal)
      errors.value.categoria = 'La categoría legal es obligatoria'
    if (!form.value.fecha_emision)
      errors.value.fecha_emision = 'La fecha de emisión es obligatoria'
    if (
      form.value.fecha_vigencia_hasta &&
      form.value.fecha_vigencia_desde &&
      form.value.fecha_vigencia_hasta < form.value.fecha_vigencia_desde
    )
      errors.value.fecha_vigencia_hasta = 'La fecha fin no puede ser anterior a la de inicio'
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

  async function submit(): Promise<{ id: string } | null> {
    if (!validate()) return null
    try {
      // FIX: fechas opcionales usan '' como fallback en lugar de undefined
      const payload: NormativaCreatePayload = {
        ...form.value,
        fecha_emision: form.value.fecha_emision
          ? new Date(form.value.fecha_emision).toISOString()
          : '',
        fecha_vigencia_desde: form.value.fecha_vigencia_desde
          ? new Date(form.value.fecha_vigencia_desde).toISOString()
          : '',
        fecha_vigencia_hasta: form.value.fecha_vigencia_hasta
          ? new Date(form.value.fecha_vigencia_hasta).toISOString()
          : '',
      }
      if (modo === 'crear') return await store.create(payload)
      return null
    } catch { return null }
  }

  async function submitUpdate(id: string): Promise<boolean> {
    if (!validate()) return false
    try {
      await store.update(id, {
        titulo:           form.value.titulo,
        tipo:             form.value.tipo,
        categoria_legal:  form.value.categoria_legal,
        estado:           form.value.estado,
        alcance:          form.value.alcance,
        numero_documento: form.value.numero_documento,
        version:          form.value.version,
        descripcion:      form.value.descripcion,
        contenido:        form.value.contenido,
        fecha_emision: form.value.fecha_emision
          ? new Date(form.value.fecha_emision).toISOString()
          : undefined,
        fecha_vigencia_desde: form.value.fecha_vigencia_desde
          ? new Date(form.value.fecha_vigencia_desde).toISOString()
          : undefined,
        fecha_vigencia_hasta: form.value.fecha_vigencia_hasta
          ? new Date(form.value.fecha_vigencia_hasta).toISOString()
          : undefined,
        aprobado_por: form.value.aprobado_por,
        tags:         form.value.tags,
      })
      return true
    } catch { return false }
  }

  function loadFromNormativa(n: any) {
    form.value = {
      conjuntoId:      n.conjunto_id       ?? '',
      titulo:          n.titulo            ?? '',
      tipo:            n.tipo              ?? 'reglamento_ph',
      categoria_legal: n.categoria_legal   ?? 'reglamento_interno',
      estado:          n.estado            ?? 'borrador',
      alcance:         n.alcance           ?? 'todos_propietarios',
      numero_documento: n.numero_documento ?? '',
      version:         n.version           ?? '1.0',
      descripcion:     n.descripcion       ?? '',
      contenido:       n.contenido         ?? '',
      fecha_emision:        formatDateInput(n.fecha_emision),
      fecha_vigencia_desde: n.fecha_vigencia_desde ? formatDateInput(n.fecha_vigencia_desde) : '',
      fecha_vigencia_hasta: n.fecha_vigencia_hasta ? formatDateInput(n.fecha_vigencia_hasta) : '',
      aprobado_por: n.aprobado_por ?? '',
      tags:         n.tags         ?? [],
    }
  }

  function reset() {
    form.value = {
      conjuntoId: '', titulo: '', tipo: 'reglamento_ph', categoria_legal: 'reglamento_interno',
      estado: 'borrador', alcance: 'todos_propietarios', numero_documento: '', version: '1.0',
      descripcion: '', contenido: '', fecha_emision: '', fecha_vigencia_desde: '',
      fecha_vigencia_hasta: '', aprobado_por: '', tags: [],
    }
    errors.value = {}
    tagInput.value = ''
    store.clearError()
  }

  return {
    form, errors, tagInput,
    saving:      computed(() => store.saving),
    serverError: computed(() => store.error),
    submit, submitUpdate, loadFromNormativa, reset, validate, addTag, removeTag,
  }
}