import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { normativaApi } from '../api/normativa.api'
import type {
  Normativa, NormativaCreatePayload, NormativaUpdatePayload,
  NormativaFilters, PaginatedNormativa,
} from '../types/normativa.types'

export const useNormativaStore = defineStore('normativa', () => {
  const items   = ref<Normativa[]>([])
  const current = ref<Normativa | null>(null)
  const total   = ref(0)
  const page    = ref(1)
  const pages   = ref(1)
  const limit   = ref(20)
  const loading = ref(false)
  const saving  = ref(false)
  const error   = ref<string | null>(null)
  const filters = ref<NormativaFilters>({ page: 1, limit: 20 })

  const vigentes    = computed(() => items.value.filter((n) => n.estado === 'vigente').length)
  const enRevision  = computed(() => items.value.filter((n) => n.estado === 'en_revision').length)
  const reglamentos = computed(() =>
    items.value.filter((n) => n.tipo === 'reglamento_ph' || n.tipo === 'manual_convivencia')
  )
  const recientes = computed(() =>
    [...items.value]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  )
  const proximosAVencer = computed(() => {
    const ahora = Date.now()
    const treintaDias = 30 * 24 * 60 * 60 * 1000
    return items.value.filter((n) => {
      if (!n.fecha_vigencia_hasta || n.estado !== 'vigente') return false
      const fin = new Date(n.fecha_vigencia_hasta).getTime()
      return fin > ahora && fin - ahora <= treintaDias
    })
  })

  async function fetchList(f: NormativaFilters = {}) {
    loading.value = true; error.value = null
    try {
      filters.value = { ...filters.value, ...f, page: f.page ?? 1 }
      const res: PaginatedNormativa = await normativaApi.list(filters.value)
      items.value = res.data; total.value = res.total
      page.value  = res.page; pages.value = res.pages; limit.value = res.limit
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al cargar documentos'
    } finally { loading.value = false }
  }

  async function fetchOne(id: string) {
    loading.value = true; error.value = null
    try {
      current.value = await normativaApi.getById(id)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Documento no encontrado'
      current.value = null
    } finally { loading.value = false }
  }

  async function create(payload: NormativaCreatePayload): Promise<Normativa> {
    saving.value = true; error.value = null
    try {
      const nuevo = await normativaApi.create(payload)
      items.value.unshift(nuevo); total.value++
      return nuevo
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al crear documento'
      throw e
    } finally { saving.value = false }
  }

  async function update(id: string, payload: NormativaUpdatePayload): Promise<Normativa> {
    saving.value = true; error.value = null
    try {
      const updated = await normativaApi.update(id, payload)
      const idx = items.value.findIndex((n) => n.id === id)
      if (idx !== -1) items.value[idx] = updated
      if (current.value?.id === id) current.value = updated
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al actualizar documento'
      throw e
    } finally { saving.value = false }
  }

  async function remove(id: string) {
    saving.value = true; error.value = null
    try {
      await normativaApi.remove(id)
      items.value = items.value.filter((n) => n.id !== id)
      total.value = Math.max(0, total.value - 1)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al eliminar documento'
      throw e
    } finally { saving.value = false }
  }

  async function cambiarEstado(id: string, estado: Normativa['estado']): Promise<boolean> {
    try { await update(id, { estado }); return true } catch { return false }
  }

  function changePage(p: number) { fetchList({ ...filters.value, page: p }) }
  function applyFilters(f: NormativaFilters) { fetchList({ ...f, page: 1 }) }
  function clearError() { error.value = null }
  function clearCurrent() { current.value = null }

  return {
    items, current, total, page, pages, limit, loading, saving, error, filters,
    vigentes, enRevision, reglamentos, recientes, proximosAVencer,
    fetchList, fetchOne, create, update, remove, cambiarEstado,
    changePage, applyFilters, clearError, clearCurrent,
  }
})