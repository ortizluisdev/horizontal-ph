import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cobranzaApi } from '../api/cobranza.api'
import type {
  Cobranza,
  CobranzaCreatePayload,
  CobranzaUpdatePayload,
  CobranzaFilters,
} from '../types/cobranza.types'

export const useCobranzaStore = defineStore('cobranza', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const items   = ref<Cobranza[]>([])
  const current = ref<Cobranza | null>(null)
  const total   = ref(0)
  const page    = ref(1)
  const pages   = ref(0)
  const limit   = ref(20)
  const loading = ref(false)
  const saving  = ref(false)
  const error   = ref<string | null>(null)
  const activeFilters = ref<CobranzaFilters>({ page: 1, limit: 20 })

  // ─── Getters ──────────────────────────────────────────────────────────────
  const totalPendiente = computed(() =>
    items.value
      .filter((c) => ['pendiente', 'parcial'].includes(c.estado))
      .reduce((sum, c) => sum + (c.valor_deuda ?? c.valor_total), 0)
  )

  const totalVencido = computed(() =>
    items.value
      .filter((c) => c.estado === 'vencido')
      .reduce((sum, c) => sum + (c.valor_deuda ?? c.valor_total), 0)
  )

  const cantidadPendientes = computed(
    () => items.value.filter((c) => ['pendiente', 'parcial', 'vencido'].includes(c.estado)).length
  )

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function fetchList(f: CobranzaFilters = {}) {
    loading.value = true
    error.value   = null
    try {
      activeFilters.value = { ...activeFilters.value, ...f, page: f.page ?? 1 }
      const { data } = await cobranzaApi.list(activeFilters.value)
      items.value = data.data
      total.value = data.total
      page.value  = data.page
      pages.value = data.pages
      limit.value = data.limit
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
      const { data } = await cobranzaApi.getById(id)
      current.value = data
    } catch (e: any) {
      error.value   = e?.response?.data?.message ?? 'Cobranza no encontrada'
      current.value = null
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CobranzaCreatePayload): Promise<Cobranza> {
    saving.value = true
    error.value  = null
    try {
      const { data } = await cobranzaApi.create(payload)
      items.value.unshift(data)
      total.value++
      return data
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
      const { data } = await cobranzaApi.update(id, payload)
      const idx = items.value.findIndex((c) => c.id === id)
      if (idx !== -1) items.value[idx] = data
      if (current.value?.id === id) current.value = data
      return data
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al actualizar cobranza'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string): Promise<void> {
    saving.value = true
    error.value  = null
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
    fetchList({ ...activeFilters.value, page: p })
  }

  function applyFilters(f: CobranzaFilters) {
    fetchList({ ...f, page: 1 })
  }

  function clearError()   { error.value   = null }
  function clearCurrent() { current.value = null }

  return {
    items, current, total, page, pages, limit, loading, saving, error, activeFilters,
    totalPendiente, totalVencido, cantidadPendientes,
    fetchList, fetchOne, create, update, remove,
    changePage, applyFilters, clearError, clearCurrent,
  }
})