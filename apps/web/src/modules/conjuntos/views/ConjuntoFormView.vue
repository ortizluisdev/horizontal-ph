<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button
        @click="$router.back()"
        class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Volver"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit ? 'Editar conjunto' : 'Nuevo conjunto' }}
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ isEdit ? 'Modifica los datos del conjunto' : 'Registra un nuevo conjunto' }}
        </p>
      </div>
    </div>

    <!-- Loading inicial (modo edición) -->
    <div v-if="isEdit && loading && !current" class="flex justify-center py-16">
      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 p-6">
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

const route  = useRoute()
const router = useRouter()
const { current, loading, error, cargarPorId, crear, actualizar } = useConjuntos()

const id     = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)

// tenantId fijo — en un contexto real vendría del store de auth
const TENANT_ID = import.meta.env.VITE_TENANT_ID ?? ''

onMounted(() => {
  if (id.value) cargarPorId(id.value)
})

async function onSubmit(data: ConjuntoCreateInput | ConjuntoUpdateInput) {
  let result
  if (isEdit.value && id.value) {
    result = await actualizar(id.value, data as ConjuntoUpdateInput)
  } else {
    result = await crear({ ...(data as ConjuntoCreateInput), tenantId: TENANT_ID })
  }
  if (result && !error.value) {
    router.push('/conjuntos')
  }
}
</script>