import { useConjuntosStore } from '../store/conjuntos.store'
import { ref } from 'vue'
import type { ConjuntoCreateInput, ConjuntoUpdateInput, ConjuntoQuery } from '../types/conjuntos.types'

export function useConjuntos() {
  const store = useConjuntosStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function cargarLista(params?: ConjuntoQuery) {
    loading.value = true
    error.value = null
    try {
      await store.fetchList(params)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar conjuntos'
    } finally {
      loading.value = false
    }
  }

  async function cargarPorId(id: string) {
    loading.value = true
    error.value = null
    try {
      await store.fetchById(id)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar conjunto'
    } finally {
      loading.value = false
    }
  }

  async function crear(input: ConjuntoCreateInput) {
    loading.value = true
    error.value = null
    try {
      return await store.create(input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al crear conjunto'
    } finally {
      loading.value = false
    }
  }

  async function actualizar(id: string, input: ConjuntoUpdateInput) {
    loading.value = true
    error.value = null
    try {
      return await store.update(id, input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al actualizar conjunto'
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
      error.value = e.response?.data?.message ?? 'Error al eliminar conjunto'
    } finally {
      loading.value = false
    }
  }

  return {
    list: store.list,
    current: store.current,
    total: store.total,
    page: store.page,
    loading,
    error,
    cargarLista,
    cargarPorId,
    crear,
    actualizar,
    eliminar,
  }
}