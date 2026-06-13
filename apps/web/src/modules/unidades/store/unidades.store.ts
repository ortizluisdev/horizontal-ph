import { defineStore } from 'pinia'
import { ref } from 'vue'
import { unidadesApi } from '../api/unidades.api'
import type { Unidad, UnidadCreateInput, UnidadUpdateInput, UnidadQuery } from '../types/unidades.types'

export const useUnidadesStore = defineStore('unidades', () => {
  const list = ref<Unidad[]>([])
  const current = ref<Unidad | null>(null)
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchList(params?: UnidadQuery) {
    loading.value = true
    error.value = null
    try {
      const { data } = await unidadesApi.list(params)
      list.value = data.data
      total.value = data.total
      page.value = data.page
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar unidades'
    } finally {
      loading.value = false
    }
  }

  async function fetchByConjunto(conjuntoId: string, params?: UnidadQuery) {
    loading.value = true
    error.value = null
    try {
      const { data } = await unidadesApi.listByConjunto(conjuntoId, params)
      list.value = data.data
      total.value = data.total
      page.value = data.page
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar unidades del conjunto'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    try {
      const { data } = await unidadesApi.getById(id)
      current.value = data
    } finally {
      loading.value = false
    }
  }

  async function create(input: UnidadCreateInput) {
    const { data } = await unidadesApi.create(input)
    list.value.unshift(data)
    return data
  }

  async function update(id: string, input: UnidadUpdateInput) {
    const { data } = await unidadesApi.update(id, input)
    const idx = list.value.findIndex((u) => u.id === id)
    if (idx !== -1) list.value[idx] = data
    if (current.value?.id === id) current.value = data
    return data
  }

  async function remove(id: string) {
    await unidadesApi.remove(id)
    list.value = list.value.filter((u) => u.id !== id)
  }

  return {
    list, current, total, page, loading, error,
    fetchList, fetchByConjunto, fetchById, create, update, remove,
  }
})