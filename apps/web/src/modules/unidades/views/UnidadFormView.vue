<template>
  <div class="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">

    <div class="flex items-center gap-3">
      <button @click="$router.back()" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Volver">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? 'Editar unidad' : 'Nueva unidad' }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ isEdit ? 'Modifica los datos de la unidad' : 'Registra una nueva unidad en el conjunto' }}
        </p>
      </div>
    </div>

    <div v-if="isEdit && store.loading && !store.current" class="flex justify-center py-16">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 p-6">
      <UnidadForm
        :initial="store.current ?? undefined"
        :loading="submitting"
        :error="submitError"
        @submit="onSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUnidadesStore } from '../store/unidades.store'
import UnidadForm from '../components/UnidadForm.vue'
import type { UnidadCreateInput, UnidadUpdateInput } from '../types/unidades.types'

const route  = useRoute()
const router = useRouter()
const store  = useUnidadesStore()

const submitting  = ref(false)
const submitError = ref<string | null>(null)

const id     = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)

onMounted(() => {
  if (id.value) store.fetchById(id.value)
  else store.reset()  // evita que datos de edición anterior aparezcan en formulario nuevo
})

async function onSubmit(data: UnidadCreateInput | UnidadUpdateInput) {
  submitting.value = true; submitError.value = null
  try {
    if (isEdit.value && id.value) await store.update(id.value, data as UnidadUpdateInput)
    else await store.create(data as UnidadCreateInput)
    router.push('/unidades')
  } catch (e: any) {
    submitError.value =
      e.response?.data?.errors?.[0]?.message ??
      e.response?.data?.message ??
      'Error al guardar la unidad'
  } finally { submitting.value = false }
}
</script>