import { defineStore } from 'pinia'
import { ref } from 'vue'
import { contabilidadApi } from '../api/contabilidad.api'
import type {
  Movimiento,
  MovimientoCreateInput,
  MovimientoUpdateInput,
  MovimientoAnularInput,
  MovimientoQuery,
  Balance,
  BalanceQuery,
} from '../types/contabilidad.types'

export const useContabilidadStore = defineStore('contabilidad', () => {
  const list           = ref<Movimiento[]>([])
  const current        = ref<Movimiento | null>(null)
  const balance        = ref<Balance | null>(null)
  const total          = ref(0)
  const page           = ref(1)
  const total_debitos  = ref(0)
  const total_creditos = ref(0)
  const loading        = ref(false)
  const error          = ref<string | null>(null)

  async function fetchList(params?: MovimientoQuery) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await contabilidadApi.list(params)
      list.value           = data.data
      total.value          = data.total
      page.value           = data.page
      total_debitos.value  = data.total_debitos
      total_creditos.value = data.total_creditos
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar movimientos'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await contabilidadApi.getById(id)
      current.value = data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar movimiento'
    } finally {
      loading.value = false
    }
  }

  async function fetchBalance(params: BalanceQuery) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await contabilidadApi.getBalance(params)
      balance.value = data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al obtener balance'
    } finally {
      loading.value = false
    }
  }

  async function create(input: MovimientoCreateInput) {
    const { data } = await contabilidadApi.create(input)
    list.value.unshift(data)
    return data
  }

  async function update(id: string, input: MovimientoUpdateInput) {
    const { data } = await contabilidadApi.update(id, input)
    const idx = list.value.findIndex((m) => m.id === id)
    if (idx !== -1) list.value[idx] = data
    if (current.value?.id === id) current.value = data
    return data
  }

  async function anular(id: string, input: MovimientoAnularInput) {
    const { data } = await contabilidadApi.anular(id, input)
    const idx = list.value.findIndex((m) => m.id === id)
    if (idx !== -1) list.value[idx] = data
    if (current.value?.id === id) current.value = data
    return data
  }

  function reset() {
    list.value           = []
    current.value        = null
    balance.value        = null
    total.value          = 0
    page.value           = 1
    total_debitos.value  = 0
    total_creditos.value = 0
    error.value          = null
  }

  return {
    list, current, balance, total, page, total_debitos, total_creditos, loading, error,
    fetchList, fetchById, fetchBalance, create, update, anular, reset,
  }
})