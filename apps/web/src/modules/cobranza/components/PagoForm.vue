<template>
  <div class="rounded-xl border border-gray-200 bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900">
        {{ modo === 'crear' ? 'Nueva cobranza' : 'Editar cobranza' }}
      </h3>
      <button v-if="showClose" class="text-gray-400 hover:text-gray-600" @click="emit('close')">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" novalidate class="p-5 space-y-4">
      <!-- Número de recibo -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">N° Recibo *</label>
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
        <label class="block text-xs font-medium text-gray-600 mb-1">Concepto *</label>
        <select
          v-model="form.concepto"
          :class="fieldClass(errors.concepto)"
          @change="errors.concepto = undefined"
        >
          <option value="">Seleccionar concepto...</option>
          <option v-for="c in conceptos" :key="c" :value="c">{{ c }}</option>
        </select>
        <p v-if="errors.concepto" class="mt-1 text-xs text-red-600">{{ errors.concepto }}</p>
      </div>

      <!-- Valor total -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Valor total *</label>
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
        <p v-else-if="form.valor_total > 0" class="mt-1 text-xs text-indigo-600">
          {{ formatCurrency(form.valor_total) }}
        </p>
      </div>

      <!-- Fecha vencimiento -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Fecha de vencimiento *</label>
        <input
          v-model="form.fecha_vencimiento"
          type="date"
          :class="fieldClass(errors.fecha_vencimiento)"
          @change="errors.fecha_vencimiento = undefined"
        />
        <p v-if="errors.fecha_vencimiento" class="mt-1 text-xs text-red-600">{{ errors.fecha_vencimiento }}</p>
      </div>

      <!-- Server error -->
      <div v-if="serverError" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
        {{ serverError }}
      </div>

      <!-- Acciones -->
      <div class="flex gap-3 pt-2">
        <button
          type="button"
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ saving ? 'Guardando...' : modo === 'crear' ? 'Crear cobranza' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useCobranzaForm } from '../composables/useCobranza'
import { formatCurrency } from '../composables/useCobranza'

const props = defineProps<{
  modo?:        'crear' | 'editar'
  conjuntoId?:  string
  unidadId?:    string
  showClose?:   boolean
}>()

const emit = defineEmits<{
  (e: 'close'):              void
  (e: 'saved', id: string): void
}>()

const { form, errors, saving, serverError, submit, reset } = useCobranzaForm(props.modo ?? 'crear')

// Pre-rellenar si viene desde el contexto de una unidad/conjunto
if (props.conjuntoId) form.value.conjuntoId = props.conjuntoId
if (props.unidadId)   form.value.unidadId   = props.unidadId

const conceptos = [
  'Cuota de administración',
  'Cuota extraordinaria',
  'Mantenimiento áreas comunes',
  'Servicios públicos comunes',
  'Parqueadero',
  'Multa',
  'Otro',
]

async function handleSubmit() {
  const ok = await submit()
  if (ok) {
    emit('close')
    reset()
  }
}

function fieldClass(error?: string) {
  const base = 'block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors'
  return error
    ? `${base} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`
    : `${base} border-gray-300 focus:border-indigo-400 focus:ring-indigo-200 bg-white`
}
</script>