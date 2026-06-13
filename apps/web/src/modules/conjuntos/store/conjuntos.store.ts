import { defineStore } from 'pinia'
import { ref } from 'vue'
import { conjuntosApi } from '../api/conjuntos.api'
import type { Conjunto, ConjuntoCreateInput, ConjuntoUpdateInput, ConjuntoQuery } from '../types/conjuntos.types'

export const useConjuntosStore = defineStore('conjuntos', () => {
  const list = ref<Conjunto[]>([])
  const current = ref<Conjunto | null>(null)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchList(params?: ConjuntoQuery) {
    loading.value = true
    error.value = null
    try {
      const { data } = await conjuntosApi.list(params)
      list.value = data.data
      total.value = data.total
      page.value = data.page
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar conjuntos'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    try {
      const { data } = await conjuntosApi.getById(id)
      current.value = data
    } finally {
      loading.value = false
    }
  }

  async function create(input: ConjuntoCreateInput) {
    const { data } = await conjuntosApi.create(input)
    list.value.unshift(data)
    return data
  }

  async function update(id: string, input: ConjuntoUpdateInput) {
    const { data } = await conjuntosApi.update(id, input)
    const idx = list.value.findIndex((c) => c.id === id)
    if (idx !== -1) list.value[idx] = data
    if (current.value?.id === id) current.value = data
    return data
  }

  async function remove(id: string) {
    await conjuntosApi.remove(id)
    list.value = list.value.filter((c) => c.id !== id)
  }

  return { list, current, total, page, limit, loading, error, fetchList, fetchById, create, update, remove }
})