import { useConjuntosStore } from '../store/conjuntos.store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import type {
  ConjuntoCreateInput,
  ConjuntoUpdateInput,
  ConjuntoQuery,
} from '../types/conjuntos.types'

export function useConjuntos() {
  const store = useConjuntosStore()
  const { list, current, total, page, pages, limit, loading: storeLoading } = storeToRefs(store)

  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function cargarLista(params?: ConjuntoQuery) {
    loading.value = true
    error.value   = null
    try {
      await store.fetchList(params)
      if (store.error) error.value = store.error
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar conjuntos'
    } finally {
      loading.value = false
    }
  }

  async function cargarPorId(id: string) {
    loading.value = true
    error.value   = null
    try {
      await store.fetchById(id)
      if (store.error) error.value = store.error
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar el conjunto'
    } finally {
      loading.value = false
    }
  }

  async function crear(input: ConjuntoCreateInput) {
    loading.value = true
    error.value   = null
    try {
      return await store.create(input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al crear el conjunto'
      return null
    } finally {
      loading.value = false
    }
  }

  async function actualizar(id: string, input: ConjuntoUpdateInput) {
    loading.value = true
    error.value   = null
    try {
      return await store.update(id, input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al actualizar el conjunto'
      return null
    } finally {
      loading.value = false
    }
  }

  async function eliminar(id: string) {
    loading.value = true
    error.value   = null
    try {
      await store.remove(id)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al eliminar el conjunto'
    } finally {
      loading.value = false
    }
  }

  return {
    list,
    current,
    total,
    page,
    pages,
    limit,
    loading,
    error,
    cargarLista,
    cargarPorId,
    crear,
    actualizar,
    eliminar,
  }
}