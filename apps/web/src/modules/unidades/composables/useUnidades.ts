import { ref } from 'vue'
import { useUnidadesStore } from '../store/unidades.store'
import type { UnidadCreateInput, UnidadUpdateInput, UnidadQuery } from '../types/unidades.types'

export function useUnidades() {
  const store   = useUnidadesStore()
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function cargarLista(params?: UnidadQuery) {
    loading.value = true
    error.value   = null
    try {
      await store.fetchList(params)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar unidades'
    } finally {
      loading.value = false
    }
  }

  async function cargarPorConjunto(conjuntoId: string) {
    loading.value = true
    error.value   = null
    try {
      await store.fetchByConjunto(conjuntoId)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al cargar unidades del conjunto'
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
      error.value = e.response?.data?.message ?? 'Error al cargar la unidad'
    } finally {
      loading.value = false
    }
  }

  async function crear(input: UnidadCreateInput) {
    loading.value = true
    error.value   = null
    try {
      return await store.create(input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al crear la unidad'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function actualizar(id: string, input: UnidadUpdateInput) {
    loading.value = true
    error.value   = null
    try {
      return await store.update(id, input)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al actualizar la unidad'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function desactivar(id: string) {
    loading.value = true
    error.value   = null
    try {
      return await store.deactivate(id)
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Error al desactivar la unidad'
      throw e
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
      error.value = e.response?.data?.message ?? 'Error al eliminar la unidad'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    list:    store.list,
    current: store.current,
    total:   store.total,
    pages:   store.pages,
    loading,
    error,
    cargarLista,
    cargarPorConjunto,
    cargarPorId,
    crear,
    actualizar,
    desactivar,
    eliminar,
  }
}