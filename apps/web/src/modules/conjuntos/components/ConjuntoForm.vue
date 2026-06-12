<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Nombre -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Nombre del conjunto <span class="text-red-500">*</span></label>
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
        <label class="text-sm font-medium text-gray-700">Tipo de conjunto</label>
        <select
          v-model="form.tipo_conjunto"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona un tipo</option>
          <option value="residencial">Residencial</option>
          <option value="comercial">Comercial</option>
          <option value="mixto">Mixto</option>
          <option value="industrial">Industrial</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <!-- Dirección -->
      <div class="flex flex-col gap-1 md:col-span-2">
        <label class="text-sm font-medium text-gray-700">Dirección <span class="text-red-500">*</span></label>
        <input
          v-model="form.direccion"
          type="text"
          placeholder="Ej: Calle 123 # 45-67"
          required
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Ciudad -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Ciudad</label>
        <input
          v-model="form.ciudad"
          type="text"
          placeholder="Ej: Bogotá"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ error }}
    </p>

    <div class="flex gap-3 pt-2">
      <button
        type="button"
        @click="$router.back()"
        class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {{ loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear conjunto') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { Conjunto, ConjuntoCreateInput, ConjuntoUpdateInput } from '../types/conjuntos.types'

const props = defineProps<{
  initial?: Partial<Conjunto>
  loading?: boolean
  error?: string | null
}>()