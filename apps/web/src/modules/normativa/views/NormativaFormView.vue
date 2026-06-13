<template>
  <div class="max-w-3xl mx-auto space-y-5">
    <button class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group" @click="router.back()">
      <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>
    <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100">
        <h1 class="text-lg font-bold text-gray-900">{{ esEdicion ? 'Editar documento' : 'Nuevo documento' }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ esEdicion ? 'Modifica los datos del documento normativo' : 'Registra un nuevo documento legal o reglamentario' }}</p>
      </div>
      <form @submit.prevent="handleSubmit" novalidate class="p-6 space-y-6">
        <!-- Tipo -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2">Tipo de documento *</label>
          <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <button v-for="t in TIPOS_DOCUMENTO" :key="t.value" type="button"
              :class="['rounded-lg border-2 px-2 py-2.5 text-center transition-all', form.tipo === t.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300']"
              @click="form.tipo = t.value; errors.tipo = undefined">
              <span class="text-lg block">{{ t.icon }}</span>
              <p :class="['text-xs font-medium mt-0.5 leading-tight', form.tipo === t.value ? 'text-indigo-700' : 'text-gray-600']">{{ t.label }}</p>
            </button>
          </div>
          <p v-if="errors.tipo" class="mt-1 text-xs text-red-600">{{ errors.tipo }}</p>
        </div>
        <!-- Título -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Título *</label>
          <input v-model="form.titulo" type="text" placeholder="Ej: Reglamento de propiedad horizontal — Conjunto El Prado"
            :class="fieldClass(errors.titulo)" @input="errors.titulo = undefined" />
          <p v-if="errors.titulo" class="mt-1 text-xs text-red-600">{{ errors.titulo }}</p>
        </div>
        <!-- Número y versión -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Número de documento</label>
            <input v-model="form.numero_documento" type="text" placeholder="Ej: RPH-2024-001" :class="fieldClass()" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Versión</label>
            <input v-model="form.version" type="text" placeholder="Ej: 1.0" :class="fieldClass()" />
          </div>
        </div>
        <!-- Categoría y Alcance -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Categoría legal *</label>
            <select v-model="form.categoria_legal" :class="fieldClass(errors.categoria)">
              <option v-for="c in CATEGORIAS_LEGALES.filter(c => c.value)" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
            <p v-if="errors.categoria" class="mt-1 text-xs text-red-600">{{ errors.categoria }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Alcance *</label>
            <select v-model="form.alcance" :class="fieldClass()">
              <option v-for="a in ALCANCES_DOCUMENTO.filter(a => a.value)" :key="a.value" :value="a.value">{{ a.label }}</option>
            </select>
          </div>
        </div>
        <!-- Estado -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2">Estado *</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="e in ESTADOS_DOCUMENTO.filter(e => e.value)" :key="e.value" type="button"
              :class="['rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all',
                       form.estado === e.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300']"
              @click="form.estado = e.value as any">{{ e.label }}</button>
          </div>
        </div>
        <!-- Descripción -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
          <textarea v-model="form.descripcion" rows="2" placeholder="Breve descripción del propósito del documento..."
            class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white resize-none" />
        </div>
        <!-- Fechas -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Fecha de emisión *</label>
            <input v-model="form.fecha_emision" type="date" :class="fieldClass(errors.fecha_emision)" @change="errors.fecha_emision = undefined" />
            <p v-if="errors.fecha_emision" class="mt-1 text-xs text-red-600">{{ errors.fecha_emision }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Vigente desde</label>
            <input v-model="form.fecha_vigencia_desde" type="date" :class="fieldClass()" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Vigente hasta</label>
            <input v-model="form.fecha_vigencia_hasta" type="date" :class="fieldClass(errors.fecha_vigencia_hasta)" @change="errors.fecha_vigencia_hasta = undefined" />
            <p v-if="errors.fecha_vigencia_hasta" class="mt-1 text-xs text-red-600">{{ errors.fecha_vigencia_hasta }}</p>
          </div>
        </div>
        <!-- Aprobado por -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Aprobado por</label>
          <input v-model="form.aprobado_por" type="text" placeholder="Ej: Asamblea General de Propietarios..." :class="fieldClass()" />
        </div>
        <!-- Contenido -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Contenido del documento</label>
          <textarea v-model="form.contenido" rows="8" placeholder="Texto completo o resumen de artículos principales..."
            class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white resize-y font-mono" />
          <p class="mt-1 text-xs text-gray-400">Opcional si tienes un PDF adjunto.</p>
        </div>
        <!-- URL archivo -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">URL del archivo PDF / adjunto</label>
          <input v-model="form.archivo_url" type="url" placeholder="https://storage.ejemplo.com/documentos/reglamento.pdf" :class="fieldClass()" />
        </div>
        <!-- Tags -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Etiquetas</label>
          <div class="flex gap-2">
            <input v-model="tagInput" type="text" placeholder="Agrega etiqueta y presiona Enter"
              class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              @keydown.enter.prevent="addTag" />
            <button type="button" class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors" @click="addTag">+</button>
          </div>
          <div v-if="form.tags?.length" class="flex flex-wrap gap-1.5 mt-2">
            <span v-for="tag in form.tags" :key="tag" class="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700">
              #{{ tag }}
              <button type="button" class="text-indigo-400 hover:text-red-500 transition-colors" @click="removeTag(tag)">✕</button>
            </span>
          </div>
        </div>
        <div v-if="serverError" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{{ serverError }}</div>
        <div class="flex gap-3 pt-2">
          <button type="button" class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" @click="router.back()">Cancelar</button>
          <button type="submit" :disabled="saving"
            class="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear documento' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNormativaStore } from '../store/normativa.store'
import { useNormativaForm, TIPOS_DOCUMENTO, ESTADOS_DOCUMENTO, CATEGORIAS_LEGALES, ALCANCES_DOCUMENTO } from '../composables/useNormativa'
import { useAuthStore } from '@/modules/auth/store/auth.store'
const route     = useRoute()
const router    = useRouter()
const store     = useNormativaStore()
const authStore = useAuthStore()
const esEdicion = computed(() => !!route.params.id)
const { form, errors, tagInput, saving, serverError, submit, submitUpdate, loadFromNormativa, addTag, removeTag } =
  useNormativaForm(esEdicion.value ? 'editar' : 'crear')
if (authStore.user?.unidad_id) form.value.conjuntoId = authStore.user.unidad_id ?? ''
onMounted(async () => {
  if (esEdicion.value) {
    await store.fetchOne(route.params.id as string)
    if (store.current) loadFromNormativa(store.current)
  }
})
async function handleSubmit() {
  if (esEdicion.value) {
    const ok = await submitUpdate(route.params.id as string)
    if (ok) router.push(`/normativa/${route.params.id}`)
  } else {
    const result = await submit()
    if (result) router.push(`/normativa/${result.id}`)
  }
}
function fieldClass(error?: string) {
  const base = 'block w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors bg-white'
  return error ? `${base} border-red-300 focus:border-red-500 focus:ring-red-200` : `${base} border-gray-300 focus:border-indigo-400 focus:ring-indigo-200`
}
</script>