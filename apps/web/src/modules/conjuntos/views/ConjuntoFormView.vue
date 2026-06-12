<template>
  <div class="p-6 max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <button @click="$router.back()" class="text-gray-400 hover:text-gray-600 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? 'Editar conjunto' : 'Nuevo conjunto' }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ isEdit ? 'Modifica los datos del conjunto' : 'Registra un nuevo conjunto residencial' }}</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <ConjuntoForm
        :initial="current ?? undefined"
        :loading="loading"
        :error="error"
        @submit="onSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConjuntos } from '../composables/useConjuntos'
import ConjuntoForm from '../components/ConjuntoForm.vue'
import type { ConjuntoCreateInput, ConjuntoUpdateInput } from '../types/conjuntos.types'

const route = useRoute()
const router = useRouter()
const { current, loading, error, cargarPorId, crear, actualizar } = useConjuntos()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)

onMounted(() => {
  if (id.value) cargarPorId(id.value)
})

async function onSubmit(data: ConjuntoCreateInput | ConjuntoUpdateInput) {
  if (isEdit.value && id.value) {
    await actualizar(id.value, data as ConjuntoUpdateInput)
  } else {
    await crear(data as ConjuntoCreateInput)
  }
  if (!error.value) router.push('/conjuntos')
}
</script>