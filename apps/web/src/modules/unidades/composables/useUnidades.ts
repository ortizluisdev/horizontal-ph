import { useUnidadesStore } from '../store/unidades.store'
import { ref } from 'vue'
import type { UnidadCreateInput, UnidadUpdateInput, UnidadQuery } from '../types/unidades.types'

export function useUnidades() {
  const store = useUnidadesStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function cargarLista(params?: UnidadQuery) {
    loading.value = true
    error.value = null
    try {
      await store.fetchList(params)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar unidades'
    } finally {
      loading.value = false
    }
  }

  async function cargarPorConjunto(conjuntoId: string, params?: UnidadQuery) {
    loading.value = true
    error.value = null
    try {
      await store.fetchByConjunto(conjuntoId, params)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error'
    } finally {
      loading.value = false
    }
  }

  async function crear(input: UnidadCreateInput) {
    loading.value = true
    error.value = null
    try {
      return await store.create(input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al crear unidad'
    } finally {
      loading.value = false
    }
  }

  async function actualizar(id: string, input: UnidadUpdateInput) {
    loading.value = true
    error.value = null
    try {
      return await store.update(id, input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al actualizar unidad'
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
      error.value = e.response?.data?.message ?? 'Error al eliminar unidad'
    } finally {
      loading.value = false
    }
  }

  return {
    list: store.list,
    current: store.current,
    total: store.total,
    loading,
    error,
    cargarLista,
    cargarPorConjunto,
    crear,
    actualizar,
    eliminar,
  }
}