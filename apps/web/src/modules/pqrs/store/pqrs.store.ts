import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pqrsApi } from '../api/pqrs.api'
import type {
  Pqrs,
  PqrsCreatePayload,
  PqrsUpdatePayload,
  PqrsFilters,
  PqrsSeguimiento,
} from '../types/pqrs.types'

export const usePqrsStore = defineStore('pqrs', () => {
  const items       = ref<Pqrs[]>([])
  const current     = ref<Pqrs | null>(null)
  const seguimiento = ref<PqrsSeguimiento[]>([])
  const total       = ref(0)
  const page        = ref(1)
  const pages       = ref(1)
  const limit       = ref(20)
  const loading     = ref(false)
  const saving      = ref(false)
  const error       = ref<string | null>(null)
  const filters     = ref<PqrsFilters>({ page: 1, limit: 20 })

  const abiertas  = computed(() => items.value.filter((p) => p.estado === 'abierta').length)
  const enProceso = computed(() => items.value.filter((p) => p.estado === 'en proceso').length)
  const urgentes  = computed(() => items.value.filter((p) => p.prioridad === 'urgente').length)

  async function fetchList(f: PqrsFilters = {}) {
    loading.value = true
    error.value   = null
    try {
      filters.value     = { ...filters.value, ...f, page: f.page ?? 1 }
      const { data: res } = await pqrsApi.list(filters.value)
      items.value = res.data
      total.value = res.total
      page.value  = res.page
      pages.value = res.pages
      limit.value = res.limit
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al cargar PQRS'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string) {
    loading.value = true
    error.value   = null
    try {
      const [{ data: pqrs }, { data: seg }] = await Promise.all([
        pqrsApi.getById(id),
        pqrsApi.getSeguimiento(id),
      ])
      current.value     = pqrs
      seguimiento.value = seg
    } catch (e: any) {
      error.value   = e?.response?.data?.message ?? 'PQRS no encontrada'
      current.value = null
    } finally {
      loading.value = false
    }
  }

  async function create(payload: PqrsCreatePayload): Promise<Pqrs> {
    saving.value = true
    error.value  = null
    try {
      const { data: nueva } = await pqrsApi.create(payload)
      items.value.unshift(nueva)
      total.value++
      return nueva
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al radicar PQRS'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: PqrsUpdatePayload): Promise<Pqrs> {
    saving.value = true
    error.value  = null
    try {
      const { data: updated } = await pqrsApi.update(id, payload)
      const idx = items.value.findIndex((p) => p.id === id)
      if (idx !== -1) items.value[idx] = updated
      if (current.value?.id === id) current.value = updated
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al actualizar PQRS'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    saving.value = true
    error.value  = null
    try {
      await pqrsApi.remove(id)
      items.value = items.value.filter((p) => p.id !== id)
      total.value = Math.max(0, total.value - 1)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al eliminar PQRS'
      throw e
    } finally {
      saving.value = false
    }
  }

  function changePage(p: number)      { fetchList({ ...filters.value, page: p }) }
  function applyFilters(f: PqrsFilters) { fetchList({ ...f, page: 1 }) }
  function clearError()               { error.value = null }
  function clearCurrent()             { current.value = null; seguimiento.value = [] }

  return {
    items, current, seguimiento, total, page, pages, limit,
    loading, saving, error, filters,
    abiertas, enProceso, urgentes,
    fetchList, fetchOne, create, update, remove,
    changePage, applyFilters, clearError, clearCurrent,
  }
})