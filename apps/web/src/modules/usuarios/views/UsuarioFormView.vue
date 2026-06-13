<template>
  <div class="max-w-2xl mx-auto space-y-5">
    <button class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group" @click="router.back()">
      <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>

    <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100">
        <h1 class="text-lg font-bold text-gray-900">{{ esEdicion ? 'Editar usuario' : 'Nuevo usuario' }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ esEdicion ? 'Modifica los datos del usuario' : 'Registra un nuevo acceso al sistema' }}
        </p>
      </div>

      <form class="p-6 space-y-6" novalidate @submit.prevent="handleSubmit">
        <UsuarioForm
          :form="form"
          :errors="errors"
          :show-pass="showPass"
          :saving="saving"
          :server-error="serverError"
          :modo="esEdicion ? 'editar' : 'crear'"
          @update:show-pass="showPass = $event"
        />

        <div class="flex gap-3 pt-2">
          <button type="button"
            class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            @click="router.back()">Cancelar</button>
          <button type="submit" :disabled="saving"
            class="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsuariosStore } from '../store/usuarios.store'
import { useUsuariosForm } from '../composables/useUsuarios'
import UsuarioForm from '../components/UsuarioForm.vue'

const route  = useRoute()
const router = useRouter()
const store  = useUsuariosStore()

const esEdicion = computed(() => !!route.params.id)

const { form, errors, showPass, saving, serverError, submit, submitUpdate, loadFromUsuario } =
  useUsuariosForm(esEdicion.value ? 'editar' : 'crear')

onMounted(async () => {
  if (esEdicion.value) {
    await store.fetchOne(route.params.id as string)
    if (store.current) loadFromUsuario(store.current)
  }
})

async function handleSubmit() {
  if (esEdicion.value) {
    const ok = await submitUpdate(route.params.id as string)
    if (ok) router.push(`/usuarios/${route.params.id}`)
  } else {
    const result = await submit()
    if (result) router.push(`/usuarios/${result.id}`)
  }
}
</script>