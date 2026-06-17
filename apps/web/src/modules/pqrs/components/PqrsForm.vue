<template>
  <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900">Radicar nueva PQRS</h3>
      <button v-if="showClose" class="text-gray-400 hover:text-gray-600" @click="emit('close')">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" novalidate class="p-5 space-y-4">
      <!-- conjuntoId / unidadId ocultos con error visible si faltan -->
      <div v-if="errors.conjuntoId || errors.unidadId" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
        {{ errors.conjuntoId || errors.unidadId }}
      </div>

      <!-- Tipo -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-2">Tipo de solicitud *</label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            v-for="t in TIPOS_PQRS"
            :key="t.value"
            type="button"
            :class="[
              'rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all text-center',
              form.tipo === t.value
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600',
            ]"
            @click="form.tipo = t.value; errors.tipo = undefined"
          >
            <div class="text-xl mb-0.5">{{ t.icon }}</div>
            <div class="text-xs">{{ t.label }}</div>
          </button>
        </div>
        <p v-if="errors.tipo" class="mt-1 text-xs text-red-600">{{ errors.tipo }}</p>
      </div>

      <!-- Asunto -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Asunto *</label>
        <input
          v-model="form.asunto"
          type="text"
          placeholder="Describe brevemente el motivo..."
          :class="field(errors.asunto)"
          @input="errors.asunto = undefined"
        />
        <p v-if="errors.asunto" class="mt-1 text-xs text-red-600">{{ errors.asunto }}</p>
      </div>

      <!-- Descripción -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Descripción detallada *</label>
        <textarea
          v-model="form.descripcion"
          rows="4"
          placeholder="Describe la situación con el mayor detalle posible..."
          :class="[field(errors.descripcion), 'resize-none']"
          @input="errors.descripcion = undefined"
        />
        <div class="mt-1 flex justify-between">
          <p v-if="errors.descripcion" class="text-xs text-red-600">{{ errors.descripcion }}</p>
          <p class="text-xs text-gray-400 ml-auto">{{ form.descripcion.length }} / 2000</p>
        </div>
      </div>

      <!-- Categoría + Prioridad -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
          <select v-model="form.categoria" :class="field()">
            <option :value="undefined">Seleccionar...</option>
            <option v-for="c in CATEGORIAS_PQRS.slice(1)" :key="c.value" :value="c.value">
              {{ c.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Prioridad</label>
          <select v-model="form.prioridad" :class="field()">
            <option v-for="p in PRIORIDADES_PQRS.slice(1)" :key="p.value" :value="p.value">
              {{ p.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Ubicación -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Ubicación afectada</label>
        <input
          v-model="form.ubicacion_afectada"
          type="text"
          placeholder="Ej: Parqueadero P2, Piso 3 pasillo..."
          :class="field()"
        />
      </div>

      <!-- Datos del solicitante -->
      <div class="border-t border-gray-100 pt-4 space-y-3">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Datos del solicitante (opcional)
        </p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
            <input v-model="form.nombre_solicitante" type="text" placeholder="Nombre completo" :class="field()" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input v-model="form.email_solicitante" type="email" placeholder="correo@ejemplo.com" :class="field()" />
          </div>
        </div>
      </div>

      <!-- Seguimiento -->
      <div class="flex items-center gap-3 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
        <input
          id="seguimiento"
          v-model="form.requiere_seguimiento"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label for="seguimiento" class="text-sm text-indigo-800 cursor-pointer">
          Requiere seguimiento posterior
        </label>
      </div>

      <!-- Error servidor -->
      <div v-if="serverError" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
        {{ serverError }}
      </div>

      <!-- Acciones -->
      <div class="flex gap-3 pt-2">
        <button
          type="button"
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ saving ? 'Radicando...' : 'Radicar PQRS' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { TIPOS_PQRS, CATEGORIAS_PQRS, PRIORIDADES_PQRS } from '../composables/usePqrs'
import { usePqrsForm } from '../composables/usePqrs'
import type { Pqrs } from '../types/pqrs.types'

const props = defineProps<{
  conjuntoId?: string
  unidadId?:   string
  showClose?:  boolean
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', p: Pqrs): void
}>()

const { form, errors, saving, serverError, submit, reset } = usePqrsForm(
  props.conjuntoId,
  props.unidadId
)

async function handleSubmit() {
  const result = await submit()
  if (result) {
    emit('saved', result)
    reset()
  }
}

function field(error?: string) {
  const base = 'block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors'
  return error
    ? `${base} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`
    : `${base} border-gray-300 focus:border-indigo-400 focus:ring-indigo-200 bg-white`
}
</script>