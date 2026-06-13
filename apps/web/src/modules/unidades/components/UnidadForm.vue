<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <!-- Nombre -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">
          Nombre / Número <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.nombre"
          type="text"
          placeholder="Ej: Apto 301, Casa 12, Local 5"
          required
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <!-- Tipo -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">
          Tipo <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.tipo"
          required
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="">Selecciona el tipo</option>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="local">Local</option>
          <option value="parqueadero">Parqueadero</option>
          <option value="bodega">Bodega</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <!-- Estado -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Estado</label>
        <select
          v-model="form.estado"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="desocupado">Desocupado</option>
          <option value="ocupado">Ocupado</option>
          <option value="en_mora">En mora</option>
          <option value="bloqueado">Bloqueado</option>
        </select>
      </div>

      <!-- Piso -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Piso</label>
        <input
          v-model.number="form.piso"
          type="number"
          min="0"
          max="200"
          placeholder="Ej: 3"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <!-- Área -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Área (m²)</label>
        <input
          v-model.number="form.area_m2"
          type="number"
          min="0"
          step="0.01"
          placeholder="Ej: 65.50"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <!-- Coeficiente -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-gray-700">Coeficiente (%)</label>
        <input
          v-model.number="form.coeficiente"
          type="number"
          min="0"
          max="100"
          step="0.0001"
          placeholder="Ej: 2.5432"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <p class="text-xs text-gray-400">La suma de todos los coeficientes debe ser 100%</p>
      </div>

      <!-- Conjunto ID -->
      <div class="flex flex-col gap-1 md:col-span-2">
        <label class="text-sm font-semibold text-gray-700">
          ID del Conjunto <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.conjunto_id"
          type="text"
          placeholder="UUID del conjunto al que pertenece"
          required
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <p class="text-xs text-gray-400">Puedes copiar el ID desde la vista de conjuntos</p>
      </div>

      <!-- Activo (solo edición) -->
      <div v-if="isEdit" class="flex items-center gap-3 md:col-span-2">
        <input
          id="activo"
          v-model="formActivo"
          type="checkbox"
          class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
        />
        <label for="activo" class="text-sm font-semibold text-gray-700 cursor-pointer">
          Unidad activa
        </label>
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
    >
      <span>⚠️</span> {{ error }}
    </div>

    <!-- Botones -->
    <div class="flex gap-3 pt-2">
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
        <span
          v-if="loading"
          class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
        />
        {{ loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear unidad') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import type { Unidad, UnidadCreateInput, UnidadUpdateInput } from '../types/unidades.types'

const props = defineProps<{
  initial?: Partial<Unidad>
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: UnidadCreateInput | UnidadUpdateInput): void
}>()

const isEdit   = computed(() => !!props.initial?.id)
const formActivo = ref<boolean>(props.initial?.activo ?? true)

const form = reactive<UnidadCreateInput>({
  conjunto_id: props.initial?.conjunto_id ?? '',
  nombre:      props.initial?.nombre      ?? '',
  tipo:        props.initial?.tipo        ?? 'apartamento',
  estado:      props.initial?.estado      ?? 'desocupado',
  piso:        props.initial?.piso,
  area_m2:     props.initial?.area_m2,
  coeficiente: props.initial?.coeficiente,
})

function handleSubmit() {
  const payload: UnidadCreateInput | UnidadUpdateInput = { ...form }
  if (isEdit.value) (payload as UnidadUpdateInput).activo = formActivo.value
  emit('submit', payload)
}
</script>