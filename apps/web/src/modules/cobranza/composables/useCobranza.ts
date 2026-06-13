import { useCobranzaStore } from '../store/cobranza.store'
import { ref } from 'vue'
import type { CobranzaCreateInput, CobranzaUpdateInput, CobranzaQuery } from '../types/cobranza.types'

export function useCobranza() {
  const store = useCobranzaStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function cargarLista(params?: CobranzaQuery) {
    loading.value = true
    error.value = null
    try {
      await store.fetchList(params)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar cobranzas'
    } finally {
      loading.value = false
    }
  }

  async function crear(input: CobranzaCreateInput) {
    loading.value = true
    error.value = null
    try {
      return await store.create(input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al crear cobranza'
    } finally {
      loading.value = false
    }
  }

  async function marcarPagado(id: string, fecha_pago?: string) {
    loading.value = true
    error.value = null
    try {
      return await store.update(id, {
        estado: 'pagado',
        fecha_pago: fecha_pago ?? new Date().toISOString().split('T')[0],
      })
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al registrar pago'
    } finally {
      loading.value = false
    }
  }

  async function actualizar(id: string, input: CobranzaUpdateInput) {
    loading.value = true
    error.value = null
    try {
      return await store.update(id, input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al actualizar cobranza'
    } finally {
      loading.value = false
    }
  }

  async function eliminar(id: string) {
    loading.value = true
    error.value = null
    try {
      await store.remove(id)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al eliminar cobranza'
    } finally {
      loading.value = false
    }
  }

  return {
    list: store.list,
    current: store.current,
    total: store.total,
    totalPendiente: store.totalPendiente,
    totalPagado: store.totalPagado,
    loading,
    error,
    cargarLista,
    crear,
    marcarPagado,
    actualizar,
    eliminar,
  }
}