import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { unidadesApi } from '../api/unidades.api'
import type { Unidad, UnidadCreateInput, UnidadUpdateInput, UnidadQuery } from '../types/unidades.types'

export const useUnidadesStore = defineStore('unidades', () => {
  const list    = ref<Unidad[]>([])
  const current = ref<Unidad | null>(null)
  const total   = ref(0)
  const page    = ref(1)
  const limit   = ref(20)
  const loading = ref(false)
  const error   = ref<string | null>(null)

  const pages = computed(() => Math.max(1, Math.ceil(total.value / (limit.value || 1))))

  async function fetchList(params?: UnidadQuery) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await unidadesApi.list(params)
      list.value  = data.data
      total.value = data.total
      page.value  = data.page
      limit.value = data.limit
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar unidades'
    } finally {
      loading.value = false
    }
  }

  async function fetchByConjunto(conjuntoId: string) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await unidadesApi.listByConjunto(conjuntoId)
      list.value  = data
      total.value = data.length
      page.value  = 1
      limit.value = Math.max(data.length, 1)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar unidades del conjunto'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await unidadesApi.getById(id)
      current.value  = data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar la unidad'
    } finally {
      loading.value = false
    }
  }

  async function create(input: UnidadCreateInput) {
    const { data } = await unidadesApi.create(input)
    list.value.unshift(data)
    total.value += 1
    return data
  }

  async function update(id: string, input: UnidadUpdateInput) {
    const { data } = await unidadesApi.update(id, input)
    const idx = list.value.findIndex((u) => u.id === id)
    if (idx !== -1) list.value[idx] = data
    if (current.value?.id === id) current.value = data
    return data
  }

  async function deactivate(id: string) {
    const { data } = await unidadesApi.deactivate(id)
    const idx = list.value.findIndex((u) => u.id === id)
    if (idx !== -1) list.value[idx] = data
    if (current.value?.id === id) current.value = data
    return data
  }

  async function remove(id: string) {
    await unidadesApi.remove(id)
    list.value  = list.value.filter((u) => u.id !== id)
    total.value = Math.max(0, total.value - 1)
    if (current.value?.id === id) current.value = null
  }

  function reset() {
    list.value    = []
    current.value = null
    total.value   = 0
    page.value    = 1
    limit.value   = 20
    error.value   = null
  }

  return {
    list, current, total, page, limit, pages, loading, error,
    fetchList, fetchByConjunto, fetchById, create, update, deactivate, remove, reset,
  }
})