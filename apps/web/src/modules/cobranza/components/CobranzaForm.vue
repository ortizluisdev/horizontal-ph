<template>
  <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">
          {{ modo === 'editar' ? 'Editar cobranza' : 'Nueva cobranza' }}
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">
          {{ modo === 'editar' ? 'Modifica los datos de la cobranza' : 'Completa los campos requeridos' }}
        </p>
      </div>
      <button
        v-if="showClose"
        class="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Cerrar"
        @click="emit('close')"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="p-5 space-y-4">
      <!-- N° Recibo -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">
          N° Recibo <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.numero_recibo"
          type="text"
          placeholder="REC-2024-001"
          :class="fieldClass(errors.numero_recibo)"
          @input="errors.numero_recibo = undefined"
        />
        <p v-if="errors.numero_recibo" class="mt-1 text-xs text-red-600">{{ errors.numero_recibo }}</p>
      </div>

      <!-- Concepto -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">
          Concepto <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.concepto"
          :class="fieldClass(errors.concepto)"
          @change="errors.concepto = undefined"
        >
          <option value="" disabled>Seleccionar concepto...</option>
          <option v-for="c in CONCEPTOS_COBRANZA" :key="c" :value="c">{{ c }}</option>
        </select>
        <p v-if="errors.concepto" class="mt-1 text-xs text-red-600">{{ errors.concepto }}</p>
      </div>

      <!-- Descripción -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">
          Descripción <span class="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          v-model="form.descripcion"
          rows="2"
          placeholder="Detalles adicionales..."
          :class="[fieldClass(), 'resize-none']"
        />
      </div>

      <!-- Valor base + impuesto + total -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">
            Valor base <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">$</span>
            <input
              v-model.number="form.valor_base"
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              :class="[fieldClass(errors.valor_base), 'pl-7']"
              @input="recalcularTotal"
            />
          </div>
          <p v-if="errors.valor_base" class="mt-1 text-xs text-red-600">{{ errors.valor_base }}</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Impuesto / Recargo</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">$</span>
            <input
              v-model.number="form.valor_impuesto"
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              :class="[fieldClass(), 'pl-7']"
              @input="recalcularTotal"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">
            Total <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">$</span>
            <input
              v-model.number="form.valor_total"
              type="number"
              min="1"
              step="1000"
              placeholder="0"
              :class="[fieldClass(errors.valor_total), 'pl-7']"
              @input="errors.valor_total = undefined"
            />
          </div>
          <p v-if="errors.valor_total" class="mt-1 text-xs text-red-600">{{ errors.valor_total }}</p>
          <p v-else-if="form.valor_total > 0" class="mt-1 text-xs text-indigo-600 font-medium">
            {{ formatCurrency(form.valor_total) }}
          </p>
        </div>
      </div>

      <!-- Período de facturación -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Mes de facturación</label>
          <select v-model.number="form.mes_facturacion" :class="fieldClass()">
            <option :value="undefined">Sin especificar</option>
            <option v-for="m in MESES" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Año</label>
          <select v-model.number="form.anio_facturacion" :class="fieldClass()">
            <option :value="undefined">Sin especificar</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <!-- Fechas -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Fecha de emisión</label>
          <input
            v-model="form.fecha_emision"
            type="date"
            :class="fieldClass()"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">
            Fecha vencimiento <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.fecha_vencimiento"
            type="date"
            :class="fieldClass(errors.fecha_vencimiento)"
            @change="errors.fecha_vencimiento = undefined"
          />
          <p v-if="errors.fecha_vencimiento" class="mt-1 text-xs text-red-600">
            {{ errors.fecha_vencimiento }}
          </p>
        </div>
      </div>

      <!-- Observaciones -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">
          Observaciones <span class="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          v-model="form.observaciones"
          rows="2"
          placeholder="Notas adicionales..."
          :class="[fieldClass(), 'resize-none']"
        />
      </div>

      <!-- Error servidor -->
      <div
        v-if="serverError"
        class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex gap-2"
      >
        <svg class="h-4 w-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 00-2 0zm0-4a1 1 0 112 0 1 1 0 01-2 0z"
            clip-rule="evenodd" />
        </svg>
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
          type="button"
          :disabled="saving"
          class="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
          @click="handleSubmit"
        >
          <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ saving ? 'Guardando...' : modo === 'editar' ? 'Guardar cambios' : 'Crear cobranza' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useCobranzaForm,
  CONCEPTOS_COBRANZA,
  MESES,
  formatCurrency,
} from '../composables/useCobranza'

const props = defineProps<{
  modo?:       'crear' | 'editar'
  conjuntoId?: string
  unidadId?:   string
  showClose?:  boolean
}>()

const emit = defineEmits<{
  (e: 'close'):             void
  (e: 'saved', id: string): void
}>()

// Pasar objeto para pre-rellenar conjuntoId/unidadId
const { form, errors, saving, serverError, submit, reset } = useCobranzaForm({
  modo:       props.modo       ?? 'crear',
  conjuntoId: props.conjuntoId ?? '',
  unidadId:   props.unidadId   ?? '',
})

const currentYear = new Date().getFullYear()
const years = computed(() => Array.from({ length: 6 }, (_, i) => currentYear - i))

function recalcularTotal() {
  const base     = form.value.valor_base     ?? 0
  const impuesto = form.value.valor_impuesto ?? 0
  if (base > 0) {
    form.value.valor_total = base + impuesto
    errors.value.valor_total = undefined
  }
}

async function handleSubmit() {
  const id = await submit()
  if (id) {
    emit('saved', id)
    reset()
  }
}

function fieldClass(error?: string) {
  const base =
    'block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors'
  return error
    ? `${base} border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50`
    : `${base} border-gray-300 focus:border-indigo-400 focus:ring-indigo-100 bg-white`
}
</script>