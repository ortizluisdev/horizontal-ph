<template>
  <form @submit.prevent="handleSubmit" class="space-y-6" novalidate>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <!-- Nombre -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">
          Nombre <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.nombre"
          type="text"
          placeholder="Ej: Apto 301, Casa 12, Local 5"
          class="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
          :class="errors.nombre ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'"
        />
        <p v-if="errors.nombre" class="text-xs text-red-500">{{ errors.nombre }}</p>
      </div>

      <!-- Número de unidad -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Número de unidad</label>
        <input
          v-model="form.numero_unidad"
          type="text"
          placeholder="Ej: 301, A-12"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <p class="text-xs text-gray-400">Debe ser único dentro del conjunto</p>
      </div>

      <!-- Tipo (alineado con backend: tipo_unidad) -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Tipo de unidad</label>
        <select
          v-model="form.tipo_unidad"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
        >
          <option value="">Sin especificar</option>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="local_comercial">Local comercial</option>
          <option value="oficina">Oficina</option>
          <option value="bodega">Bodega</option>
          <option value="parqueadero">Parqueadero</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <!-- Piso (backend acepta -5 a 200) -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Piso</label>
        <input
          v-model.number="form.piso"
          type="number"
          min="-5"
          max="200"
          placeholder="Ej: 3 (negativo = sótano)"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <p class="text-xs text-gray-400">Valores negativos para sótanos</p>
      </div>

      <!-- Área -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Área (m²)</label>
        <input
          v-model.number="form.area_m2"
          type="number"
          min="0.01"
          max="99999"
          step="0.01"
          placeholder="Ej: 65.50"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <!-- Descripción -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Descripción</label>
        <input
          v-model="form.descripcion"
          type="text"
          maxlength="500"
          placeholder="Ej: Apto esquinero con vista al parque"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <!-- conjuntoId (campo correcto para el backend) -->
      <div v-if="!isEdit" class="flex flex-col gap-1 md:col-span-2">
        <label class="text-sm font-semibold text-gray-700">
          Conjunto <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.conjuntoId"
          type="text"
          placeholder="UUID del conjunto"
          class="border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 transition"
          :class="errors.conjuntoId ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'"
        />
        <p v-if="errors.conjuntoId" class="text-xs text-red-500">{{ errors.conjuntoId }}</p>
        <p v-else class="text-xs text-gray-400">Copia el ID desde la vista de conjuntos</p>
      </div>

      <!-- Activo (solo edición) -->
      <div v-if="isEdit" class="flex items-center gap-3 md:col-span-2">
        <input
          id="activo"
          v-model="form.activo"
          type="checkbox"
          class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
        />
        <label for="activo" class="text-sm font-semibold text-gray-700 cursor-pointer">
          Unidad activa
        </label>
      </div>
    </div>

    <!-- Error del servidor -->
    <div
      v-if="error"
      class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
    >
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
      {{ error }}
    </div>

    <!-- Botones -->
    <div class="flex flex-col sm:flex-row gap-3 pt-2">
      <button
        type="button"
        @click="$router.back()"
        class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        {{ loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear unidad') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { Unidad, UnidadCreateInput, UnidadUpdateInput } from '../types/unidades.types'

const props = defineProps<{
  initial?: Partial<Unidad>
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: UnidadCreateInput | UnidadUpdateInput): void
}>()

const isEdit = computed(() => !!props.initial?.id)

// El formulario maneja create y update con los campos reales del backend
const form = reactive<UnidadCreateInput & { activo?: boolean }>({
  conjuntoId:    props.initial?.conjunto_id ?? '',
  nombre:        props.initial?.nombre       ?? '',
  descripcion:   props.initial?.descripcion  ?? '',
  tipo_unidad:   props.initial?.tipo_unidad  ?? undefined,
  numero_unidad: props.initial?.numero_unidad ?? '',
  piso:          props.initial?.piso,
  area_m2:       props.initial?.area_m2,
  activo:        props.initial?.activo ?? true,
})

const errors = reactive<Record<string, string>>({})

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio'
  }
  if (!isEdit.value && !form.conjuntoId.trim()) {
    errors.conjuntoId = 'El conjunto es obligatorio'
  }
  if (!isEdit.value && form.conjuntoId && !/^[0-9a-f-]{36}$/.test(form.conjuntoId)) {
    errors.conjuntoId = 'Debe ser un UUID válido'
  }
  return Object.keys(errors).length === 0
}

function handleSubmit() {
  if (!validate()) return

  if (isEdit.value) {
    const payload: UnidadUpdateInput = {}
    if (form.nombre)        payload.nombre        = form.nombre
    if (form.descripcion)   payload.descripcion   = form.descripcion
    if (form.tipo_unidad)   payload.tipo_unidad   = form.tipo_unidad
    if (form.numero_unidad) payload.numero_unidad = form.numero_unidad
    if (form.piso !== undefined) payload.piso      = form.piso
    if (form.area_m2 !== undefined) payload.area_m2 = form.area_m2
    payload.activo = form.activo
    emit('submit', payload)
  } else {
    const payload: UnidadCreateInput = {
      conjuntoId: form.conjuntoId,
      nombre:     form.nombre,
    }
    if (form.descripcion)   payload.descripcion   = form.descripcion
    if (form.tipo_unidad)   payload.tipo_unidad   = form.tipo_unidad
    if (form.numero_unidad) payload.numero_unidad = form.numero_unidad
    if (form.piso !== undefined) payload.piso      = form.piso
    if (form.area_m2 !== undefined) payload.area_m2 = form.area_m2
    emit('submit', payload)
  }
}
</script>