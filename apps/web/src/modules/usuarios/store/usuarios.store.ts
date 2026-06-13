import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usuariosApi } from '../api/usuarios.api'
import type {
  Usuario, UsuarioCreatePayload, UsuarioUpdatePayload,
  UsuarioFilters, PaginatedUsuarios,
} from '../types/usuarios.types'

export const useUsuariosStore = defineStore('usuarios', () => {
  const items   = ref<Usuario[]>([])
  const current = ref<Usuario | null>(null)
  const total   = ref(0)
  const page    = ref(1)
  const pages   = ref(1)
  const limit   = ref(20)
  const loading = ref(false)
  const saving  = ref(false)
  const error   = ref<string | null>(null)
  const filters = ref<UsuarioFilters>({ page: 1, limit: 20 })

  const activos     = computed(() => items.value.filter(u => u.estado === 'activo').length)
  const inactivos   = computed(() => items.value.filter(u => u.estado === 'inactivo').length)
  const pendientes  = computed(() => items.value.filter(u => u.estado === 'pendiente').length)
  const admins      = computed(() => items.value.filter(u =>
    u.tipo_usuario === 'super_admin' || u.tipo_usuario === 'admin_conjunto'
  ))

  async function fetchList(f: UsuarioFilters = {}) {
    loading.value = true; error.value = null
    try {
      filters.value = { ...filters.value, ...f, page: f.page ?? 1 }
      const res: PaginatedUsuarios = await usuariosApi.list(filters.value)
      items.value  = res.data
      total.value  = res.total
      page.value   = res.page
      pages.value  = res.pages
      limit.value  = res.limit
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al cargar usuarios'
    } finally { loading.value = false }
  }

  async function fetchOne(id: string) {
    loading.value = true; error.value = null
    try {
      current.value = await usuariosApi.getById(id)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Usuario no encontrado'
      current.value = null
    } finally { loading.value = false }
  }

  async function create(payload: UsuarioCreatePayload): Promise<Usuario> {
    saving.value = true; error.value = null
    try {
      const nuevo = await usuariosApi.create(payload)
      items.value.unshift(nuevo); total.value++
      return nuevo
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al crear usuario'
      throw e
    } finally { saving.value = false }
  }

  async function update(id: string, payload: UsuarioUpdatePayload): Promise<Usuario> {
    saving.value = true; error.value = null
    try {
      const updated = await usuariosApi.update(id, payload)
      const idx = items.value.findIndex(u => u.id === id)
      if (idx !== -1) items.value[idx] = updated
      if (current.value?.id === id) current.value = updated
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al actualizar usuario'
      throw e
    } finally { saving.value = false }
  }

  async function remove(id: string) {
    saving.value = true; error.value = null
    try {
      await usuariosApi.remove(id)
      items.value = items.value.filter(u => u.id !== id)
      total.value = Math.max(0, total.value - 1)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al eliminar usuario'
      throw e
    } finally { saving.value = false }
  }

  async function cambiarEstado(id: string, estado: Usuario['estado']): Promise<boolean> {
    try {
      const updated = await usuariosApi.cambiarEstado(id, estado)
      const idx = items.value.findIndex(u => u.id === id)
      if (idx !== -1) items.value[idx] = updated
      if (current.value?.id === id) current.value = updated
      return true
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al cambiar estado'
      return false
    }
  }

  async function resetPassword(id: string): Promise<string | null> {
    saving.value = true
    try {
      const res = await usuariosApi.resetPassword(id)
      return res.message
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al resetear contraseña'
      return null
    } finally { saving.value = false }
  }

  function changePage(p: number) { fetchList({ ...filters.value, page: p }) }
  function applyFilters(f: UsuarioFilters) { fetchList({ ...f, page: 1 }) }
  function clearError() { error.value = null }
  function clearCurrent() { current.value = null }

  return {
    items, current, total, page, pages, limit, loading, saving, error, filters,
    activos, inactivos, pendientes, admins,
    fetchList, fetchOne, create, update, remove,
    cambiarEstado, resetPassword, changePage, applyFilters, clearError, clearCurrent,
  }
})