import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Notificacion, NotificacionFilters, PaginatedNotificaciones,
} from '../types/notificaciones.types'
import http from '@/shared/lib/http'

const BASE = '/notificaciones'

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const items     = ref<Notificacion[]>([])
  const total     = ref(0)
  const noLeidas  = ref(0)
  const page      = ref(1)
  const pages     = ref(1)
  const limit     = ref(20)
  const loading   = ref(false)
  const saving    = ref(false)
  const error     = ref<string | null>(null)
  const filters   = ref<NotificacionFilters>({ page: 1, limit: 20, archivada: false })

  const hayNoLeidas     = computed(() => noLeidas.value > 0)
  const contadorBadge   = computed(() => noLeidas.value > 99 ? '99+' : String(noLeidas.value))
  const recientes       = computed(() =>
    [...items.value]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  )
  const urgentes = computed(() =>
    items.value.filter((n) => n.prioridad === 'urgente' && !n.leida)
  )

  async function fetchList(f: NotificacionFilters = {}) {
    loading.value = true; error.value = null
    try {
      filters.value = { ...filters.value, ...f, page: f.page ?? 1 }
      const params: Record<string, string | number | boolean> = {}
      if (filters.value.page)      params.page      = filters.value.page
      if (filters.value.limit)     params.limit     = filters.value.limit
      if (filters.value.tipo)      params.tipo      = filters.value.tipo
      if (filters.value.prioridad) params.prioridad = filters.value.prioridad
      if (filters.value.archivada !== undefined) params.archivada = filters.value.archivada
      if (filters.value.leida     !== undefined && filters.value.leida !== '')
        params.leida = filters.value.leida

      const res: PaginatedNotificaciones = await http.get<PaginatedNotificaciones>(BASE, { params }).then(r => r.data)
      items.value    = res.data
      total.value    = res.total
      noLeidas.value = res.no_leidas
      page.value     = res.page
      pages.value    = res.pages
      limit.value    = res.limit
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al cargar notificaciones'
    } finally { loading.value = false }
  }

  async function fetchNoLeidas() {
    try {
      const res = await http.get<{ count: number }>(`${BASE}/no-leidas/count`).then(r => r.data)
      noLeidas.value = res.count
    } catch { /* silencioso — sólo actualiza badge */ }
  }

  async function marcarLeida(id: string) {
    try {
      await http.patch(`${BASE}/${id}/leer`)
      const n = items.value.find(n => n.id === id)
      if (n && !n.leida) { n.leida = true; n.leida_at = new Date().toISOString(); noLeidas.value = Math.max(0, noLeidas.value - 1) }
    } catch (e: any) { error.value = e?.response?.data?.message ?? 'Error al marcar como leída' }
  }

  async function marcarTodasLeidas() {
    saving.value = true
    try {
      await http.patch(`${BASE}/leer-todas`)
      items.value.forEach(n => { if (!n.leida) { n.leida = true; n.leida_at = new Date().toISOString() } })
      noLeidas.value = 0
    } catch (e: any) { error.value = e?.response?.data?.message ?? 'Error al marcar todas como leídas'
    } finally { saving.value = false }
  }

  async function archivar(id: string) {
    try {
      await http.patch(`${BASE}/${id}/archivar`)
      items.value = items.value.filter(n => n.id !== id)
      total.value = Math.max(0, total.value - 1)
    } catch (e: any) { error.value = e?.response?.data?.message ?? 'Error al archivar' }
  }

  async function eliminar(id: string) {
    saving.value = true
    try {
      await http.delete(`${BASE}/${id}`)
      const n = items.value.find(n => n.id === id)
      if (n && !n.leida) noLeidas.value = Math.max(0, noLeidas.value - 1)
      items.value = items.value.filter(n => n.id !== id)
      total.value = Math.max(0, total.value - 1)
    } catch (e: any) { error.value = e?.response?.data?.message ?? 'Error al eliminar'
    } finally { saving.value = false }
  }

  function changePage(p: number) { fetchList({ ...filters.value, page: p }) }
  function applyFilters(f: NotificacionFilters) { fetchList({ ...f, page: 1 }) }
  function clearError() { error.value = null }

  return {
    items, total, noLeidas, page, pages, limit, loading, saving, error, filters,
    hayNoLeidas, contadorBadge, recientes, urgentes,
    fetchList, fetchNoLeidas, marcarLeida, marcarTodasLeidas, archivar, eliminar,
    changePage, applyFilters, clearError,
  }
})