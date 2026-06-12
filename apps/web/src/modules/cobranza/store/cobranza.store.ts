import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cobranzaApi } from '../api/cobranza.api'
import type {
  Cobranza,
  CobranzaCreatePayload,
  CobranzaUpdatePayload,
  CobranzaFilters,
  PaginatedCobranzas,
} from '../types/cobranza.types'

export const useCobranzaStore = defineStore('cobranza', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const items      = ref<Cobranza[]>([])
  const current    = ref<Cobranza | null>(null)
  const total      = ref(0)
  const page       = ref(1)
  const pages      = ref(1)
  const limit      = ref(20)
  const loading    = ref(false)
  const saving     = ref(false)
  const error      = ref<string | null>(null)
  const filters    = ref<CobranzaFilters>({ page: 1, limit: 20 })

  // ─── Getters ──────────────────────────────────────────────────────────────
  const totalPendiente = computed(() =>
    items.value
      .filter((c) => c.estado === 'pendiente')
      .reduce((sum, c) => sum + (c.valor_total ?? 0), 0)
  )

  const totalVencido = computed(() =>
    items.value
      .filter((c) => c.estado === 'vencida' || c.estado === 'en_mora')
      .reduce((sum, c) => sum + (c.valor_total ?? 0), 0)
  )

  const cantidadPendientes = computed(
    () => items.value.filter((c) => ['pendiente', 'vencida', 'en_mora'].includes(c.estado)).length
  )

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function fetchList(f: CobranzaFilters = {}) {
    loading.value = true
    error.value = null
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
    error.value = null
    try {
      current.value = await cobranzaApi.getById(id)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Cobranza no encontrada'
      current.value = null
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CobranzaCreatePayload): Promise<Cobranza> {
    saving.value = true
    error.value = null
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
    error.value = null
    try {
      const updated = await cobranzaApi.update(id, payload)
      const idx = items.value.findIndex((c) => c.id === id)
      if (idx !== -1) items.value[idx] = updated
      if (current.value?.id === id) current.value = updated
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al actualizar cobranza'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    saving.value = true
    error.value = null
    try {
      await cobranzaApi.remove(id)
      items.value = items.value.filter((c) => c.id !== id)
      total.value = Math.max(0, total.value - 1)
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

  function clearError() {
    error.value = null
  }

  function clearCurrent() {
    current.value = null
  }

  return {
    // state
    items, current, total, page, pages, limit, loading, saving, error, filters,
    // getters
    totalPendiente, totalVencido, cantidadPendientes,
    // actions
    fetchList, fetchOne, create, update, remove,
    changePage, applyFilters, clearError, clearCurrent,
  }
})