import { defineStore } from 'pinia'
import { ref } from 'vue'
import { conjuntosApi } from '../api/conjuntos.api'
import type {
  Conjunto,
  ConjuntoCreateInput,
  ConjuntoUpdateInput,
  ConjuntoQuery,
} from '../types/conjuntos.types'

export const useConjuntosStore = defineStore('conjuntos', () => {
  const list    = ref<Conjunto[]>([])
  const current = ref<Conjunto | null>(null)
  const total   = ref(0)
  const page    = ref(1)
  const limit   = ref(20)
  const pages   = ref(0)
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function fetchList(params?: ConjuntoQuery) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await conjuntosApi.list(params)
      list.value  = data.data
      total.value = data.total
      page.value  = data.page
      limit.value = data.limit
      pages.value = data.pages
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar conjuntos'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await conjuntosApi.getById(id)
      current.value = data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar el conjunto'
    } finally {
      loading.value = false
    }
  }

  async function create(input: ConjuntoCreateInput): Promise<Conjunto> {
    const { data } = await conjuntosApi.create(input)
    list.value.unshift(data)
    total.value++
    return data
  }

  async function update(id: string, input: ConjuntoUpdateInput): Promise<Conjunto> {
    const { data } = await conjuntosApi.update(id, input)
    const idx = list.value.findIndex((c) => c.id === id)
    if (idx !== -1) list.value[idx] = data
    if (current.value?.id === id) current.value = data
    return data
  }

  async function remove(id: string): Promise<void> {
    await conjuntosApi.remove(id)
    list.value  = list.value.filter((c) => c.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  function reset() {
    list.value    = []
    current.value = null
    total.value   = 0
    page.value    = 1
    pages.value   = 0
    error.value   = null
  }

  return {
    list, current, total, page, limit, pages, loading, error,
    fetchList, fetchById, create, update, remove, reset,
  }
})