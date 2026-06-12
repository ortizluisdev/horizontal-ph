import { defineStore } from 'pinia'
import { ref } from 'vue'
import { asambleasApi } from '../api/asambleas.api'
import type { Asamblea, AsambleaCreateInput, AsambleaUpdateInput, AsambleaQuery } from '../types/asambleas.types'

export const useAsambleasStore = defineStore('asambleas', () => {
  const asambleas = ref<Asamblea[]>([])
  const current = ref<Asamblea | null>(null)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchList(query?: AsambleaQuery) {
    loading.value = true
    error.value = null
    try {
      const { data } = await asambleasApi.list(query)
      asambleas.value = data.data
      total.value = data.total
      page.value = data.page
      limit.value = data.limit
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar asambleas'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    error.value = null
    try {
      const { data } = await asambleasApi.getById(id)
      current.value = data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Asamblea no encontrada'
    } finally {
      loading.value = false
    }
  }

  async function create(input: AsambleaCreateInput): Promise<Asamblea> {
    const { data } = await asambleasApi.create(input)
    asambleas.value.unshift(data)
    return data
  }

  async function update(id: string, input: AsambleaUpdateInput): Promise<Asamblea> {
    const { data } = await asambleasApi.update(id, input)
    const idx = asambleas.value.findIndex(a => a.id === id)
    if (idx !== -1) asambleas.value[idx] = data
    if (current.value?.id === id) current.value = data
    return data
  }

  async function remove(id: string) {
    await asambleasApi.remove(id)
    asambleas.value = asambleas.value.filter(a => a.id !== id)
  }

  return { asambleas, current, total, page, limit, loading, error, fetchList, fetchById, create, update, remove }
})
