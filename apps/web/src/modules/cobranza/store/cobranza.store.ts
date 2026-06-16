import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cobranzaApi } from '../api/cobranza.api'
import type {
  Cobranza,
  CobranzaCreatePayload,
  CobranzaUpdatePayload,
  RegistrarPagoPayload,
  CobranzaFilters,
  PaginatedCobranzas,
  ResumenCobranza,
} from '../types/cobranza.types'

export const useCobranzaStore = defineStore('cobranza', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const items    = ref<Cobranza[]>([])
  const current  = ref<Cobranza | null>(null)
  const resumen  = ref<ResumenCobranza | null>(null)
  const total    = ref(0)
  const page     = ref(1)
  const pages    = ref(1)
  const limit    = ref(20)
  const loading  = ref(false)
  const saving   = ref(false)
  const error    = ref<string | null>(null)
  const filters  = ref<CobranzaFilters>({ page: 1, limit: 20 })

  // ─── Getters ──────────────────────────────────────────────────────────────
  const totalPendiente = computed(() =>
    resumen.value?.total_pendiente ??
    items.value.filter((c) => c.estado === 'pendiente').reduce((s, c) => s + c.valor_deuda, 0)
  )

  const totalVencido = computed(() =>
    (resumen.value?.total_vencido ?? 0) + (resumen.value?.total_mora ?? 0) ||
    items.value.filter((c) => c.estado === 'vencida' || c.estado === 'en_mora').reduce((s, c) => s + c.valor_deuda, 0)
  )

  const cantidadCriticas = computed(() =>
    (resumen.value?.cantidad_vencidas ?? 0) + (resumen.value?.cantidad_mora ?? 0)
  )

  // ─── Actions ──────────────────────────────────────────────────────────────

  async function fetchList(f: CobranzaFilters = {}) {
    loading.value = true
    error.value   = null
    try {
      filters.value = { ...filters.value, ...f, page: f.page ?? 1 }
      const res: PaginatedCobranzas = await cobranzaApi.list(filters.value)
      items.value = res.data
      total.value = res.total
      page.value  = res.page
      pages.value = res.pages
      limit.value = res.limit
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al cargar cobranzas'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string) {
    loading.value = true
    error.value   = null
    try {
      current.value = await cobranzaApi.getById(id)
    } catch (e: any) {
      error.value   = e?.response?.data?.message ?? 'Cobranza no encontrada'
      current.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchResumen(conjuntoId: string, unidadId?: string) {
    try {
      resumen.value = await cobranzaApi.resumen(conjuntoId, unidadId)
    } catch {
      resumen.value = null
    }
  }

  async function create(payload: CobranzaCreatePayload): Promise<Cobranza> {
    saving.value = true
    error.value  = null
    try {
      const nueva = await cobranzaApi.create(payload)
      items.value.unshift(nueva)
      total.value++
      return nueva
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al crear cobranza'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: CobranzaUpdatePayload): Promise<Cobranza> {
    saving.value = true
    error.value  = null
    try {
      const updated = await cobranzaApi.update(id, payload)
      _replaceInList(updated)
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al actualizar cobranza'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function registrarPago(id: string, payload: RegistrarPagoPayload): Promise<Cobranza> {
    saving.value = true
    error.value  = null
    try {
      const updated = await cobranzaApi.registrarPago(id, payload)
      _replaceInList(updated)
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al registrar pago'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    saving.value = true
    error.value  = null
    try {
      await cobranzaApi.remove(id)
      items.value = items.value.filter((c) => c.id !== id)
      total.value = Math.max(0, total.value - 1)
      if (current.value?.id === id) current.value = null
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al eliminar cobranza'
      throw e
    } finally {
      saving.value = false
    }
  }

  function changePage(p: number) {
    fetchList({ ...filters.value, page: p })
  }

  function applyFilters(f: CobranzaFilters) {
    fetchList({ ...f, page: 1 })
  }

  function clearError()   { error.value   = null }
  function clearCurrent() { current.value = null }

  function _replaceInList(updated: Cobranza) {
    const idx = items.value.findIndex((c) => c.id === updated.id)
    if (idx !== -1) items.value[idx] = updated
    if (current.value?.id === updated.id) current.value = updated
  }

  return {
    // state
    items, current, resumen, total, page, pages, limit, loading, saving, error, filters,
    // getters
    totalPendiente, totalVencido, cantidadCriticas,
    // actions
    fetchList, fetchOne, fetchResumen,
    create, update, registrarPago, remove,
    changePage, applyFilters, clearError, clearCurrent,
  }
})