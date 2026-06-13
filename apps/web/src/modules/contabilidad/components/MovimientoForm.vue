<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <!-- Número asiento -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">
          N° Asiento <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.numero_asiento"
          type="text"
          placeholder="Ej: ASI-2024-001"
          required
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Fecha -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">
          Fecha del movimiento <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.fecha_movimiento"
          type="date"
          required
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Tipo -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">
          Tipo <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.tipo_movimiento"
          required
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona el tipo</option>
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Egreso</option>
          <option value="ajuste">Ajuste</option>
          <option value="traslado">Traslado</option>
          <option value="apertura">Apertura</option>
          <option value="cierre">Cierre</option>
        </select>
      </div>

      <!-- Categoría -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">
          Categoría <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.categoria"
          required
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona la categoría</option>
          <option value="cuota_administracion">Cuota administración</option>
          <option value="cuota_extraordinaria">Cuota extraordinaria</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="servicios_publicos">Servicios públicos</option>
          <option value="nomina">Nómina</option>
          <option value="seguros">Seguros</option>
          <option value="impuestos">Impuestos</option>
          <option value="reparaciones">Reparaciones</option>
          <option value="arrendamiento">Arrendamiento</option>
          <option value="intereses">Intereses</option>
          <option value="multas">Multas</option>
          <option value="reservas">Reservas</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <!-- Valor Débito -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Valor Débito (salida)</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            v-model.number="form.valor_debit"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            :disabled="(form.valor_credit ?? 0) > 0"
            class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
        <p class="text-xs text-gray-400">Solo débito O crédito, no ambos</p>
      </div>

      <!-- Valor Crédito -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Valor Crédito (entrada)</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            v-model.number="form.valor_credit"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            :disabled="(form.valor_debit ?? 0) > 0"
            class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
      </div>

      <!-- Descripción -->
      <div class="flex flex-col gap-1 md:col-span-2">
        <label class="text-sm font-semibold text-gray-700">Descripción</label>
        <textarea
          v-model="form.descripcion"
          rows="2"
          placeholder="Descripción detallada del movimiento (mínimo 5 caracteres)"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <!-- Referencia externa -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Referencia externa</label>
        <input
          v-model="form.referencia_externa"
          type="text"
          placeholder="Ej: Factura #123, Recibo #456"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Conjunto ID -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">
          ID del Conjunto <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.conjuntoId"
          type="text"
          placeholder="UUID del conjunto"
          required
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
      <span>⚠️</span> {{ error }}
    </div>

    <!-- Botones -->
    <div class="flex gap-3 pt-2">
      <button
        type="button"
        @click="$emit('cancel')"
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
        {{ loading ? 'Registrando...' : 'Registrar movimiento' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { MovimientoCreateInput } from '../types/contabilidad.types'

defineProps<{ loading?: boolean; error?: string | null }>()
const emit = defineEmits<{
  (e: 'submit', data: MovimientoCreateInput): void
  (e: 'cancel'): void
}>()

const hoy = new Date().toISOString().split('T')[0]

const form = reactive<MovimientoCreateInput>({
  conjuntoId:         '',
  numero_asiento:     '',
  tipo_movimiento:    'ingreso',
  categoria:          'cuota_administracion',
  valor_debit:        0,
  valor_credit:       0,
  descripcion:        '',
  fecha_movimiento:   hoy,
  referencia_externa: '',
  unidad_id:          undefined,
  cobranza_id:        undefined,
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>