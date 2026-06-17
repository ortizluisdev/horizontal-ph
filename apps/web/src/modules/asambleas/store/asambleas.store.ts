import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { asambleasApi } from '../api/asambleas.api'
import type {
  Asamblea,
  AsambleaCreatePayload,
  AsambleaUpdatePayload,
  AsambleaFilters,
  PaginatedAsambleas,
  AsambleaVotacion,
  VotacionCreatePayload,
  VotacionUpdatePayload,
  AsambleaAcuerdo,
  AcuerdoCreatePayload,
  AcuerdoUpdatePayload,
} from '../types/asambleas.types'

export const useAsambleasStore = defineStore('asambleas', () => {
  const items   = ref<Asamblea[]>([])
  const current = ref<Asamblea | null>(null)
  const total   = ref(0)
  const page    = ref(1)
  const pages   = ref(1)
  const limit   = ref(20)
  const loading = ref(false)
  const saving  = ref(false)
  const error   = ref<string | null>(null)
  const filters = ref<AsambleaFilters>({ page: 1, limit: 20 })

  const votaciones = ref<AsambleaVotacion[]>([])
  const acuerdos   = ref<AsambleaAcuerdo[]>([])

  const programadas = computed(() => items.value.filter((a) => a.estado === 'programada').length)
  const enCurso     = computed(() => items.value.filter((a) => a.estado === 'en_curso').length)
  const realizadas  = computed(() => items.value.filter((a) => a.estado === 'realizada').length)
  const proximas    = computed(() =>
    [...items.value]
      .filter((a) => a.estado === 'programada' && new Date(a.fecha_programada) > new Date())
      .sort((a, b) => new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime())
      .slice(0, 3)
  )

  async function fetchList(f: AsambleaFilters = {}) {
    loading.value = true
    error.value   = null
    try {
      filters.value       = { ...filters.value, ...f, page: f.page ?? 1 }
      const res: PaginatedAsambleas = await asambleasApi.list(filters.value)
      items.value = res.data
      total.value = res.total
      page.value  = res.page
      pages.value = res.pages
      limit.value = res.limit
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al cargar asambleas'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string) {
    loading.value = true
    error.value   = null
    try {
      current.value = await asambleasApi.getById(id)
    } catch (e: any) {
      error.value   = e?.response?.data?.message ?? 'Asamblea no encontrada'
      current.value = null
    } finally {
      loading.value = false
    }
  }

  async function create(payload: AsambleaCreatePayload): Promise<Asamblea> {
    saving.value = true
    error.value  = null
    try {
      const nueva = await asambleasApi.create(payload)
      items.value.unshift(nueva)
      total.value++
      return nueva
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al crear asamblea'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: AsambleaUpdatePayload): Promise<Asamblea> {
    saving.value = true
    error.value  = null
    try {
      const updated = await asambleasApi.update(id, payload)
      const idx = items.value.findIndex((a) => a.id === id)
      if (idx !== -1) items.value[idx] = updated
      if (current.value?.id === id) current.value = updated
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al actualizar asamblea'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function deactivate(id: string) {
    saving.value = true
    error.value  = null
    try {
      await asambleasApi.deactivate(id)
      items.value = items.value.filter((a) => a.id !== id)
      total.value = Math.max(0, total.value - 1)
      if (current.value?.id === id) current.value = null
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al desactivar asamblea'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    saving.value = true
    error.value  = null
    try {
      await asambleasApi.remove(id)
      items.value = items.value.filter((a) => a.id !== id)
      total.value = Math.max(0, total.value - 1)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Error al eliminar asamblea'
      throw e
    } finally {
      saving.value = false
    }
  }

  // ── Votaciones ────────────────────────────────────────────────────────────

  async function fetchVotaciones(asambleaId: string) {
    try {
      votaciones.value = await asambleasApi.listVotaciones(asambleaId)
    } catch {
      votaciones.value = []
    }
  }

  async function addVotacion(asambleaId: string, payload: VotacionCreatePayload): Promise<AsambleaVotacion> {
    const v = await asambleasApi.createVotacion(asambleaId, payload)
    votaciones.value.push(v)
    return v
  }

  async function updateVotacion(asambleaId: string, votacionId: string, payload: VotacionUpdatePayload): Promise<AsambleaVotacion> {
    const v = await asambleasApi.updateVotacion(asambleaId, votacionId, payload)
    const idx = votaciones.value.findIndex((x) => x.id === votacionId)
    if (idx !== -1) votaciones.value[idx] = v
    return v
  }

  async function removeVotacion(asambleaId: string, votacionId: string) {
    await asambleasApi.deleteVotacion(asambleaId, votacionId)
    votaciones.value = votaciones.value.filter((v) => v.id !== votacionId)
  }

  // ── Acuerdos ──────────────────────────────────────────────────────────────

  async function fetchAcuerdos(asambleaId: string) {
    try {
      acuerdos.value = await asambleasApi.listAcuerdos(asambleaId)
    } catch {
      acuerdos.value = []
    }
  }

  async function addAcuerdo(asambleaId: string, payload: AcuerdoCreatePayload): Promise<AsambleaAcuerdo> {
    const a = await asambleasApi.createAcuerdo(asambleaId, payload)
    acuerdos.value.push(a)
    return a
  }

  async function updateAcuerdo(asambleaId: string, acuerdoId: string, payload: AcuerdoUpdatePayload): Promise<AsambleaAcuerdo> {
    const a = await asambleasApi.updateAcuerdo(asambleaId, acuerdoId, payload)
    const idx = acuerdos.value.findIndex((x) => x.id === acuerdoId)
    if (idx !== -1) acuerdos.value[idx] = a
    return a
  }

  async function removeAcuerdo(asambleaId: string, acuerdoId: string) {
    await asambleasApi.deleteAcuerdo(asambleaId, acuerdoId)
    acuerdos.value = acuerdos.value.filter((a) => a.id !== acuerdoId)
  }

  function changePage(p: number) { fetchList({ ...filters.value, page: p }) }
  function applyFilters(f: AsambleaFilters) { fetchList({ ...f, page: 1 }) }
  function clearError() { error.value = null }
  function clearCurrent() { current.value = null; votaciones.value = []; acuerdos.value = [] }

  return {
    items, current, total, page, pages, limit, loading, saving, error, filters,
    votaciones, acuerdos,
    programadas, enCurso, realizadas, proximas,
    fetchList, fetchOne, create, update, deactivate, remove,
    fetchVotaciones, addVotacion, updateVotacion, removeVotacion,
    fetchAcuerdos, addAcuerdo, updateAcuerdo, removeAcuerdo,
    changePage, applyFilters, clearError, clearCurrent,
  }
})
