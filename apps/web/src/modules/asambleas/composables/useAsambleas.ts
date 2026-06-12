import { useAsambleasStore } from '../store/asambleas.store'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import type { AsambleaCreateInput, AsambleaUpdateInput, AsambleaQuery } from '../types/asambleas.types'

export function useAsambleas() {
  const store = useAsambleasStore()
  const router = useRouter()
  const saving = ref(false)
  const formError = ref<string | null>(null)

  async function loadList(query?: AsambleaQuery) {
    await store.fetchList(query)
  }

  async function loadOne(id: string) {
    await store.fetchById(id)
  }

  async function submitCreate(input: AsambleaCreateInput) {
    saving.value = true
    formError.value = null
    try {
      const a = await store.create(input)
      await router.push(`/asambleas/${a.id}`)
    } catch (e: any) {
      formError.value = e.response?.data?.message ?? 'Error al crear asamblea'
    } finally {
      saving.value = false
    }
  }

  async function submitUpdate(id: string, input: AsambleaUpdateInput) {
    saving.value = true
    formError.value = null
    try {
      await store.update(id, input)
      await router.push(`/asambleas/${id}`)
    } catch (e: any) {
      formError.value = e.response?.data?.message ?? 'Error al actualizar asamblea'
    } finally {
      saving.value = false
    }
  }

  async function destroy(id: string) {
    await store.remove(id)
    await router.push('/asambleas')
  }

  return {
    asambleas: store.asambleas,
    current: store.current,
    total: store.total,
    loading: store.loading,
    error: store.error,
    saving,
    formError,
    loadList,
    loadOne,
    submitCreate,
    submitUpdate,
    destroy,
  }
}
