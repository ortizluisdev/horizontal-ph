<template>
  <div class="rounded-xl border border-gray-200 bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900">
        {{ modo === 'crear' ? 'Nueva cobranza' : 'Editar cobranza' }}
      </h3>
      <button
        v-if="showClose"
        class="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Cerrar"
        @click="emit('close')"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" novalidate class="p-5 space-y-4">
      <!-- Número de recibo -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          N° Recibo <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.numero_recibo"
          type="text"
          placeholder="REC-2024-001"
          :class="fieldClass(errors.numero_recibo)"
          @input="errors.numero_recibo = undefined"
        />
        <p v-if="errors.numero_recibo" class="mt-1 text-xs text-red-600">
          {{ errors.numero_recibo }}
        </p>
      </div>

      <!-- Concepto -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
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
        <label class="block text-xs font-medium text-gray-600 mb-1">Descripción (opcional)</label>
        <textarea
          v-model="form.descripcion"
          rows="2"
          placeholder="Detalles adicionales..."
          class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none"
        />
      </div>

      <!-- Valor base + IVA + Total -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">
            Valor base <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">$</span>
            <input
              v-model.number="form.valor_base"
              type="number"
              min="1"
              step="1000"
              placeholder="0"
              :class="[fieldClass(errors.valor_base), 'pl-7']"
              @input="onValorChange"
            />
          </div>
          <p v-if="errors.valor_base" class="mt-1 text-xs text-red-600">{{ errors.valor_base }}</p>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">IVA / Recargo</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">$</span>
            <input
              v-model.number="form.valor_impuesto"
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              class="block w-full rounded-lg border border-gray-300 pl-7 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              @input="onValorChange"
            />
          </div>
        </div>
      </div>

      <!-- Total calculado -->
      <div class="rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-2.5 flex items-center justify-between">
        <span class="text-xs font-medium text-indigo-700">Total a cobrar</span>
        <span class="text-base font-bold text-indigo-900">{{ formatCurrency(form.valor_total) }}</span>
      </div>
      <p v-if="errors.valor_total" class="text-xs text-red-600">{{ errors.valor_total }}</p>

      <!-- Facturación -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Mes facturación</label>
          <select
            v-model.number="form.mes_facturacion"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          >
            <option value="">Sin mes</option>
            <option v-for="m in meses" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Año facturación</label>
          <input
            v-model.number="form.anio_facturacion"
            type="number"
            :min="2020"
            :max="currentYear + 1"
            placeholder="2024"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>
      </div>

      <!-- Fecha vencimiento -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          Fecha de vencimiento <span class="text-red-500">*</span>
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

      <!-- Error del servidor -->
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
import { watch } from 'vue'
import { useCobranzaForm, formatCurrency } from '../composables/useCobranza'
import { CONCEPTOS_COBRANZA } from '../types/cobranza.types'

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

const { form, errors, saving, serverError, submit, reset } =
  useCobranzaForm(props.modo ?? 'crear')

// Pre-rellenar reactivamente cuando cambian las props
watch(
  () => props.conjuntoId,
  (v) => { if (v) form.value.conjuntoId = v },
  { immediate: true }
)
watch(
  () => props.unidadId,
  (v) => { if (v) form.value.unidadId = v },
  { immediate: true }
)

const currentYear = new Date().getFullYear()

const meses = [
  { value: 1,  label: 'Enero'      },
  { value: 2,  label: 'Febrero'    },
  { value: 3,  label: 'Marzo'      },
  { value: 4,  label: 'Abril'      },
  { value: 5,  label: 'Mayo'       },
  { value: 6,  label: 'Junio'      },
  { value: 7,  label: 'Julio'      },
  { value: 8,  label: 'Agosto'     },
  { value: 9,  label: 'Septiembre' },
  { value: 10, label: 'Octubre'    },
  { value: 11, label: 'Noviembre'  },
  { value: 12, label: 'Diciembre'  },
]

// Recalcula valor_total automáticamente
function onValorChange() {
  form.value.valor_total =
    (form.value.valor_base ?? 0) + (form.value.valor_impuesto ?? 0)
  errors.value.valor_total = undefined
  errors.value.valor_base  = undefined
}

async function handleSubmit() {
  const ok = await submit()
  if (ok) {
    emit('close')
    reset()
  }
}

function fieldClass(error?: string) {
  const base =
    'block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors'
  return error
    ? `${base} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`
    : `${base} border-gray-300 focus:border-indigo-400 focus:ring-indigo-200 bg-white`
}
</script>