<template>
  <div class="max-w-2xl mx-auto space-y-5">

    <button class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group" @click="router.back()">
      <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>

    <!-- Loading opciones -->
    <div v-if="loadingOptions" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div class="px-6 py-5 border-b border-gray-100">
        <h1 class="text-lg font-bold text-gray-900">{{ esEdicion ? 'Editar asamblea' : 'Nueva asamblea' }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ esEdicion ? 'Modifica los datos de la asamblea' : 'Programa una nueva asamblea para el conjunto' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" novalidate class="p-6 space-y-5">

        <!-- Conjunto (solo admin en creación) -->
        <div v-if="authStore.isAdmin && !esEdicion">
          <label class="block text-xs font-medium text-gray-600 mb-1">Conjunto *</label>
          <select v-model="form.conjuntoId" :class="fieldClass(errors.conjuntoId)" @change="errors.conjuntoId = undefined">
            <option value="">Seleccionar conjunto...</option>
            <option v-for="c in conjuntosOptions" :key="c.id" :value="c.id">{{ c.label }}</option>
          </select>
          <p v-if="errors.conjuntoId" class="mt-1 text-xs text-red-600">{{ errors.conjuntoId }}</p>
        </div>

        <!-- Info conjunto (residente o edición) -->
        <div v-else-if="conjuntoLabel" class="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
          <p class="text-xs font-medium text-indigo-600 mb-0.5">Conjunto</p>
          <p class="text-sm font-semibold text-indigo-900">{{ conjuntoLabel }}</p>
        </div>

        <!-- Tipo -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2">Tipo de asamblea *</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="t in TIPOS_ASAMBLEA"
              :key="t.value"
              type="button"
              :class="['rounded-xl border-2 px-3 py-2.5 text-left transition-all',
                       form.tipo === t.value
                         ? 'border-indigo-500 bg-indigo-50'
                         : 'border-gray-200 hover:border-gray-300']"
              @click="form.tipo = t.value; errors.tipo = undefined"
            >
              <span class="text-lg">{{ t.icon }}</span>
              <p :class="['text-xs font-semibold mt-0.5', form.tipo === t.value ? 'text-indigo-700' : 'text-gray-700']">{{ t.label }}</p>
            </button>
          </div>
          <p v-if="errors.tipo" class="mt-1 text-xs text-red-600">{{ errors.tipo }}</p>
        </div>

        <!-- Número de acta -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Número de acta *</label>
          <input v-model="form.numero_acta" type="text" placeholder="Ej: ACTA-2024-001"
            :class="fieldClass(errors.numero_acta)" @input="errors.numero_acta = undefined" />
          <p v-if="errors.numero_acta" class="mt-1 text-xs text-red-600">{{ errors.numero_acta }}</p>
        </div>

        <!-- Asunto -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Asunto *</label>
          <input v-model="form.asunto" type="text" placeholder="Tema principal de la asamblea..."
            :class="fieldClass(errors.asunto)" @input="errors.asunto = undefined" />
          <p v-if="errors.asunto" class="mt-1 text-xs text-red-600">{{ errors.asunto }}</p>
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Descripción / Agenda</label>
          <textarea v-model="form.descripcion" rows="3"
            placeholder="Puntos de la agenda, instrucciones previas..."
            class="block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white resize-none" />
        </div>

        <!-- Fecha + Lugar -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Fecha y hora *</label>
            <input v-model="form.fecha_programada" type="datetime-local"
              :class="fieldClass(errors.fecha_programada)" @change="errors.fecha_programada = undefined" />
            <p v-if="errors.fecha_programada" class="mt-1 text-xs text-red-600">{{ errors.fecha_programada }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Lugar</label>
            <input v-model="form.lugar" type="text" placeholder="Salón comunal, virtual..."
              :class="fieldClass()" />
          </div>
        </div>

        <!-- Presidente + Secretario -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Presidente</label>
            <input v-model="form.presidente_nombre" type="text" placeholder="Nombre del presidente"
              :class="fieldClass()" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Secretario</label>
            <input v-model="form.secretario_nombre" type="text" placeholder="Nombre del secretario"
              :class="fieldClass()" />
          </div>
        </div>

        <!-- Quórum -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">
            Quórum requerido: <span class="text-indigo-600 font-bold">{{ form.quorum_requerido }}%</span>
          </label>
          <input v-model.number="form.quorum_requerido" type="range" min="1" max="100" step="1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>1%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        <!-- Votación requerida -->
        <div class="flex items-center gap-3 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
          <input id="votacion" v-model="form.votacion_requerida" type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <label for="votacion" class="text-sm text-indigo-800 cursor-pointer">
            Esta asamblea requiere votaciones formales
          </label>
        </div>

        <!-- Observaciones -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
          <textarea v-model="form.observaciones" rows="2"
            placeholder="Observaciones adicionales..."
            class="block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white resize-none" />
        </div>

        <!-- Error servidor -->
        <div v-if="serverError" class="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {{ serverError }}
        </div>

        <!-- Acciones -->
        <div class="flex gap-3 pt-2">
          <button type="button"
            class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            @click="router.back()">
            Cancelar
          </button>
          <button type="submit" :disabled="saving || (!form.conjuntoId && !esEdicion)"
            class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear asamblea' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAsambleasStore } from '../store/asambleas.store'
import { useAsambleaForm, TIPOS_ASAMBLEA } from '../composables/useAsambleas'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { conjuntosApi } from '@/modules/conjuntos/api/conjuntos.api'
import { unidadesApi } from '@/modules/unidades/api/unidades.api'

const route     = useRoute()
const router    = useRouter()
const store     = useAsambleasStore()
const authStore = useAuthStore()

const esEdicion = computed(() => !!route.params.id)

const { form, errors, saving, serverError, submit, submitUpdate, loadFromAsamblea } =
  useAsambleaForm(esEdicion.value ? 'editar' : 'crear')

interface Option { id: string; label: string }
const conjuntosOptions = ref<Option[]>([])
const conjuntoLabel    = ref('')
const loadingOptions   = ref(false)

onMounted(async () => {
  loadingOptions.value = true
  try {
    if (esEdicion.value) {
      // Modo edición: cargar asamblea existente
      await store.fetchOne(route.params.id as string)
      if (store.current) {
        loadFromAsamblea(store.current)
        conjuntoLabel.value = store.current.conjunto_id
      }
    } else if (authStore.isAdmin) {
      // Admin creando: cargar lista de conjuntos del tenant
      const res = await conjuntosApi.list({ limit: 100 } as any)
      const list = (res as any)?.data?.data ?? (res as any)?.data ?? []
      conjuntosOptions.value = list.map((c: any) => ({ id: c.id, label: c.nombre }))
    } else if (authStore.user?.unidad_id) {
      // Residente: obtener conjunto_id a partir de su unidad_id
      const { data: unidad } = await unidadesApi.getById(authStore.user.unidad_id)
      form.value.conjuntoId = unidad.conjunto_id
      conjuntoLabel.value   = unidad.nombre || unidad.numero_unidad
    }
  } catch {
    // validación del formulario capturará conjuntoId vacío
  } finally {
    loadingOptions.value = false
  }
})

async function handleSubmit() {
  if (esEdicion.value) {
    const ok = await submitUpdate(route.params.id as string)
    if (ok) router.push(`/asambleas/${route.params.id}`)
  } else {
    const result = await submit()
    if (result) router.push(`/asambleas/${(result as any).id}`)
  }
}

function fieldClass(error?: string) {
  const base = 'block w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors bg-white'
  return error
    ? `${base} border-red-300 focus:border-red-500 focus:ring-red-200`
    : `${base} border-gray-300 focus:border-indigo-400 focus:ring-indigo-200`
}
</script>
