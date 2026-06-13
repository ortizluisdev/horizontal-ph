import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cobranzaApi } from '../api/cobranza.api'
import type { Cobranza, CobranzaCreateInput, CobranzaUpdateInput, CobranzaQuery } from '../types/cobranza.types'

export const useCobranzaStore = defineStore('cobranza', () => {
  const list = ref<Cobranza[]>([])
  const current = ref<Cobranza | null>(null)
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalPendiente = computed(() =>
    list.value
      .filter((c) => c.estado === 'pendiente' || c.estado === 'vencido')
      .reduce((sum, c) => sum + c.monto, 0)
  )

  const totalPagado = computed(() =>
    list.value
      .filter((c) => c.estado === 'pagado')
      .reduce((sum, c) => sum + c.monto, 0)
  )

  async function fetchList(params?: CobranzaQuery) {
    loading.value = true
    error.value = null
    try {
      const { data } = await cobranzaApi.list(params)
      list.value = data.data
      total.value = data.total
      page.value = data.page
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar cobranzas'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    try {
      const { data } = await cobranzaApi.getById(id)
      current.value = data
    } finally {
      loading.value = false
    }
  }

  async function create(input: CobranzaCreateInput) {
    const { data } = await cobranzaApi.create(input)
    list.value.unshift(data)
    return data
  }

  async function update(id: string, input: CobranzaUpdateInput) {
    const { data } = await cobranzaApi.update(id, input)
    const idx = list.value.findIndex((c) => c.id === id)
    if (idx !== -1) list.value[idx] = data
    if (current.value?.id === id) current.value = data
    return data
  }

  async function remove(id: string) {
    await cobranzaApi.remove(id)
    list.value = list.value.filter((c) => c.id !== id)
  }

  return {
    list, current, total, page, loading, error,
    totalPendiente, totalPagado,
    fetchList, fetchById, create, update, remove,
  }
})