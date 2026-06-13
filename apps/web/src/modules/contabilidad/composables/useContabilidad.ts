import { ref } from 'vue'
import { useContabilidadStore } from '../store/contabilidad.store'
import type {
  MovimientoCreateInput,
  MovimientoUpdateInput,
  MovimientoAnularInput,
  MovimientoQuery,
  BalanceQuery,
} from '../types/contabilidad.types'

export function useContabilidad() {
  const store   = useContabilidadStore()
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function cargarLista(params?: MovimientoQuery) {
    loading.value = true
    error.value   = null
    try {
      await store.fetchList(params)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar movimientos'
    } finally {
      loading.value = false
    }
  }

  async function cargarPorId(id: string) {
    loading.value = true
    error.value   = null
    try {
      await store.fetchById(id)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar movimiento'
    } finally {
      loading.value = false
    }
  }

  async function cargarBalance(params: BalanceQuery) {
    loading.value = true
    error.value   = null
    try {
      await store.fetchBalance(params)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al obtener balance'
    } finally {
      loading.value = false
    }
  }

  async function crear(input: MovimientoCreateInput) {
    loading.value = true
    error.value   = null
    try {
      return await store.create(input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al registrar movimiento'
    } finally {
      loading.value = false
    }
  }

  async function actualizar(id: string, input: MovimientoUpdateInput) {
    loading.value = true
    error.value   = null
    try {
      return await store.update(id, input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al actualizar movimiento'
    } finally {
      loading.value = false
    }
  }

  async function anular(id: string, input: MovimientoAnularInput) {
    loading.value = true
    error.value   = null
    try {
      return await store.anular(id, input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al anular movimiento'
    } finally {
      loading.value = false
    }
  }

  return {
    list:           store.list,
    current:        store.current,
    balance:        store.balance,
    total:          store.total,
    total_debitos:  store.total_debitos,
    total_creditos: store.total_creditos,
    loading,
    error,
    cargarLista,
    cargarPorId,
    cargarBalance,
    crear,
    actualizar,
    anular,
  }
}