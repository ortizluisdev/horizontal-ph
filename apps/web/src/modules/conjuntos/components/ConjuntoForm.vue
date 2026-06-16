<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Sección: Información básica -->
    <fieldset class="space-y-4">
      <legend class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 w-full">
        Información básica
      </legend>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Nombre -->
        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">
            Nombre del conjunto <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre"
            type="text"
            placeholder="Ej: Conjunto Residencial Los Pinos"
            required
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Tipo -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">
            Tipo de conjunto <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.tipo_conjunto"
            required
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Selecciona un tipo</option>
            <option v-for="opt in tipoOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Código catastral -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Código catastral</label>
          <input
            v-model="form.codigo_catastral"
            type="text"
            placeholder="Ej: 001-0001-0001"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </fieldset>

    <!-- Sección: Ubicación -->
    <fieldset class="space-y-4">
      <legend class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 w-full">
        Ubicación
      </legend>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">
            Dirección <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.direccion"
            type="text"
            placeholder="Ej: Calle 123 # 45-67"
            required
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Ciudad</label>
          <input
            v-model="form.ciudad"
            type="text"
            placeholder="Ej: Bogotá"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Departamento</label>
          <input
            v-model="form.departamento"
            type="text"
            placeholder="Ej: Cundinamarca"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </fieldset>

    <!-- Sección: Características -->
    <fieldset class="space-y-4">
      <legend class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 w-full">
        Características
      </legend>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">N° torres</label>
          <input
            v-model.number="form.numero_torres"
            type="number"
            min="1"
            placeholder="0"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">N° unidades</label>
          <input
            v-model.number="form.numero_unidades"
            type="number"
            min="1"
            placeholder="0"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Año construcción</label>
          <input
            v-model.number="form.anio_construccion"
            type="number"
            min="1800"
            :max="currentYear"
            placeholder="Ej: 2005"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Área total (m²)</label>
          <input
            v-model.number="form.area_total_m2"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Área común (m²)</label>
          <input
            v-model.number="form.area_comun_m2"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </fieldset>

    <!-- Sección: Administración y contacto -->
    <fieldset class="space-y-4">
      <legend class="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 w-full">
        Administración y contacto
      </legend>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Nombre del administrador</label>
          <input
            v-model="form.administrador_nombre"
            type="text"
            placeholder="Ej: Juan Pérez"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Email del administrador</label>
          <input
            v-model="form.administrador_email"
            type="email"
            placeholder="admin@conjunto.com"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Teléfono del administrador</label>
          <input
            v-model="form.administrador_telefono"
            type="tel"
            placeholder="Ej: 601 234 5678"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Teléfono de emergencias</label>
          <input
            v-model="form.telefono_emergencia"
            type="tel"
            placeholder="Ej: 123"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Email de contacto general</label>
          <input
            v-model="form.email_contacto"
            type="email"
            placeholder="contacto@conjunto.com"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </fieldset>

    <!-- Modo edición: campo activo -->
    <div v-if="isEdit" class="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
      <input
        id="activo"
        v-model="form.activo"
        type="checkbox"
        class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />
      <label for="activo" class="text-sm font-medium text-gray-700">Conjunto activo</label>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ error }}
    </p>

    <!-- Acciones -->
    <div class="flex gap-3 pt-2">
      <button
        type="button"
        @click="$router.back()"
        class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {{ loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear conjunto' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { Conjunto, ConjuntoCreateInput, ConjuntoUpdateInput } from '../types/conjuntos.types'
import { TIPO_CONJUNTO_OPTIONS } from '../types/conjuntos.types'

const props = defineProps<{
  initial?: Partial<Conjunto>
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: ConjuntoCreateInput | ConjuntoUpdateInput): void
}>()

const tipoOptions = TIPO_CONJUNTO_OPTIONS
const currentYear = new Date().getFullYear()

const isEdit = computed(() => !!props.initial?.id)

const form = reactive({
  nombre:                 props.initial?.nombre                 ?? '',
  tipo_conjunto:          props.initial?.tipo_conjunto          ?? '' as any,
  direccion:              props.initial?.direccion              ?? '',
  ciudad:                 props.initial?.ciudad                 ?? '',
  departamento:           props.initial?.departamento           ?? '',
  codigo_catastral:       props.initial?.codigo_catastral       ?? '',
  numero_torres:          props.initial?.numero_torres          ?? undefined as number | undefined,
  numero_unidades:        props.initial?.numero_unidades        ?? undefined as number | undefined,
  anio_construccion:      props.initial?.anio_construccion      ?? undefined as number | undefined,
  area_total_m2:          props.initial?.area_total_m2          ?? undefined as number | undefined,
  area_comun_m2:          props.initial?.area_comun_m2          ?? undefined as number | undefined,
  administrador_nombre:   props.initial?.administrador_nombre   ?? '',
  administrador_email:    props.initial?.administrador_email    ?? '',
  administrador_telefono: props.initial?.administrador_telefono ?? '',
  telefono_emergencia:    props.initial?.telefono_emergencia    ?? '',
  email_contacto:         props.initial?.email_contacto         ?? '',
  activo:                 props.initial?.activo                 ?? true,
})

function handleSubmit() {
  // Limpia strings vacíos a undefined para el payload
  const clean = (v: string | undefined) => (v?.trim() ? v.trim() : undefined)
  const cleanNum = (v: number | undefined) => (v != null && !isNaN(v) ? v : undefined)

  const payload: ConjuntoCreateInput | ConjuntoUpdateInput = {
    nombre:                 form.nombre.trim(),
    tipo_conjunto:          form.tipo_conjunto,
    direccion:              form.direccion.trim(),
    ciudad:                 clean(form.ciudad),
    departamento:           clean(form.departamento),
    codigo_catastral:       clean(form.codigo_catastral),
    numero_torres:          cleanNum(form.numero_torres),
    numero_unidades:        cleanNum(form.numero_unidades),
    anio_construccion:      cleanNum(form.anio_construccion),
    area_total_m2:          cleanNum(form.area_total_m2),
    area_comun_m2:          cleanNum(form.area_comun_m2),
    administrador_nombre:   clean(form.administrador_nombre),
    administrador_email:    clean(form.administrador_email),
    administrador_telefono: clean(form.administrador_telefono),
    telefono_emergencia:    clean(form.telefono_emergencia),
    email_contacto:         clean(form.email_contacto),
    ...(isEdit.value ? { activo: form.activo } : {}),
  }

  emit('submit', payload)
}
</script>