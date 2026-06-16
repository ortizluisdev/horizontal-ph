<template>
  <form @submit.prevent="handleSubmit" class="space-y-6" novalidate>

    <fieldset class="space-y-4">
      <legend class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 w-full">Identificación</legend>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Nombre <span class="text-red-500">*</span></label>
          <input v-model="form.nombre" type="text" placeholder="Ej: Apto 301, Casa 12, Local 5"
            class="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition"
            :class="errors.nombre ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'"/>
          <p v-if="errors.nombre" class="text-xs text-red-500">{{ errors.nombre }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Número de unidad</label>
          <input v-model="form.numero_unidad" type="text" maxlength="20" placeholder="Ej: 301, A-12"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
          <p class="text-xs text-gray-400">Debe ser único dentro del conjunto</p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Torre</label>
          <input v-model="form.torre" type="text" maxlength="50" placeholder="Ej: A, B, Norte"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
        </div>
      </div>
    </fieldset>

    <fieldset class="space-y-4">
      <legend class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 w-full">Características</legend>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Tipo de unidad</label>
          <select v-model="form.tipo_unidad"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
            <option value="">Sin especificar</option>
            <option v-for="opt in TIPO_UNIDAD_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Piso</label>
          <input v-model.number="form.piso" type="number" min="-5" max="200" placeholder="Ej: 3"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
          <p class="text-xs text-gray-400">Negativo para sótanos (mín: -5)</p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Área (m²)</label>
          <input v-model.number="form.area_m2" type="number" min="0.01" max="99999" step="0.01" placeholder="Ej: 65.50"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Descripción</label>
          <input v-model="form.descripcion" type="text" maxlength="500" placeholder="Ej: Apto esquinero con vista al parque"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
        </div>
      </div>
    </fieldset>

    <fieldset v-if="!isEdit" class="space-y-4">
      <legend class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 w-full">Conjunto</legend>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">ID del conjunto <span class="text-red-500">*</span></label>
        <input v-model="form.conjuntoId" type="text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          class="border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 transition"
          :class="errors.conjuntoId ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'"/>
        <p v-if="errors.conjuntoId" class="text-xs text-red-500">{{ errors.conjuntoId }}</p>
        <p v-else class="text-xs text-gray-400">Copia el ID desde la vista de conjuntos</p>
      </div>
    </fieldset>

    <div v-if="isEdit" class="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
      <input id="activo" v-model="form.activo" type="checkbox"
        class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"/>
      <label for="activo" class="text-sm font-medium text-gray-700 cursor-pointer">Unidad activa</label>
    </div>

    <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ error }}</p>

    <div class="flex gap-3 pt-2">
      <button type="button" @click="$router.back()"
        class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
        Cancelar
      </button>
      <button type="submit" :disabled="loading"
        class="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
        <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
        {{ loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear unidad') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { Unidad, UnidadCreateInput, UnidadUpdateInput } from '../types/unidades.types'
import { TIPO_UNIDAD_OPTIONS } from '../types/unidades.types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const props = defineProps<{ initial?: Partial<Unidad>; loading?: boolean; error?: string | null }>()
const emit  = defineEmits<{ (e: 'submit', data: UnidadCreateInput | UnidadUpdateInput): void }>()

const isEdit = computed(() => !!props.initial?.id)

const form = reactive({
  conjuntoId:    props.initial?.conjunto_id   ?? '',
  nombre:        props.initial?.nombre        ?? '',
  descripcion:   props.initial?.descripcion   ?? '',
  tipo_unidad:   props.initial?.tipo_unidad   ?? '' as any,
  numero_unidad: props.initial?.numero_unidad ?? '',
  torre:         props.initial?.torre         ?? '',
  piso:          props.initial?.piso          ?? undefined as number | undefined,
  area_m2:       props.initial?.area_m2       ?? undefined as number | undefined,
  activo:        props.initial?.activo        ?? true,
})

const errors = reactive<Record<string, string>>({})

const cleanStr = (v: string) => v?.trim() || undefined
const cleanNum = (v: number | undefined) => (v != null && !Number.isNaN(v)) ? v : undefined

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio'
  if (!isEdit.value) {
    if (!form.conjuntoId.trim())            errors.conjuntoId = 'El conjunto es obligatorio'
    else if (!UUID_RE.test(form.conjuntoId)) errors.conjuntoId = 'Debe ser un UUID válido'
  }
  return Object.keys(errors).length === 0
}

function handleSubmit() {
  if (!validate()) return
  if (isEdit.value) {
    emit('submit', {
      nombre:        cleanStr(form.nombre),
      descripcion:   cleanStr(form.descripcion),
      tipo_unidad:   form.tipo_unidad  || undefined,
      numero_unidad: cleanStr(form.numero_unidad),
      torre:         cleanStr(form.torre),
      piso:          cleanNum(form.piso),
      area_m2:       cleanNum(form.area_m2),
      activo:        form.activo,
    } as UnidadUpdateInput)
  } else {
    emit('submit', {
      conjuntoId:    form.conjuntoId,
      nombre:        form.nombre.trim(),
      descripcion:   cleanStr(form.descripcion),
      tipo_unidad:   form.tipo_unidad  || undefined,
      numero_unidad: cleanStr(form.numero_unidad),
      torre:         cleanStr(form.torre),
      piso:          cleanNum(form.piso),
      area_m2:       cleanNum(form.area_m2),
    } as UnidadCreateInput)
  }
}
</script>