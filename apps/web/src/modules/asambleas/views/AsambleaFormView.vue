<template>
  <div class="max-w-2xl mx-auto p-6">
    <RouterLink to="/asambleas" class="text-sm text-blue-600 hover:underline block mb-2">
      ← Asambleas
    </RouterLink>
    <h1 class="text-xl font-bold text-slate-800 mb-6">
      {{ esEdicion ? 'Editar asamblea' : 'Nueva asamblea' }}
    </h1>

    <form
      class="bg-white border border-slate-200 rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-5"
      @submit.prevent="submit"
    >
      <!-- Número de acta -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-600">Número de acta *</label>
        <input
          v-model="form.numero_acta"
          type="text"
          placeholder="Ej: 001-2025"
          required
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Tipo -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-600">Tipo *</label>
        <select
          v-model="form.tipo"
          required
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar tipo</option>
          <option value="ordinaria">Ordinaria</option>
          <option value="extraordinaria">Extraordinaria</option>
          <option value="de_propietarios">De propietarios</option>
          <option value="de_consejo">De consejo</option>
          <option value="otra">Otra</option>
        </select>
      </div>

      <!-- Asunto -->
      <div class="flex flex-col gap-1 sm:col-span-2">
        <label class="text-xs font-semibold text-slate-600">Asunto *</label>
        <input
          v-model="form.asunto"
          type="text"
          placeholder="Descripción del asunto principal"
          required
          minlength="5"
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Fecha -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-600">Fecha programada *</label>
        <input
          v-model="form.fecha_programada"
          type="datetime-local"
          required
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Lugar -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-600">Lugar</label>
        <input
          v-model="form.lugar"
          type="text"
          placeholder="Salón comunal, virtual, etc."
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Quórum -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-600">Quórum requerido (%)</label>
        <input
          v-model.number="form.quorum_requerido"
          type="number"
          min="1"
          max="100"
          placeholder="Ej: 51"
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Estado (solo edición) -->
      <div v-if="esEdicion" class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-600">Estado</label>
        <select
          v-model="form.estado"
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="programada">Programada</option>
          <option value="en_curso">En curso</option>
          <option value="realizada">Realizada</option>
          <option value="cancelada">Cancelada</option>
          <option value="pospuesta">Pospuesta</option>
        </select>
      </div>

      <!-- Notas -->
      <div class="flex flex-col gap-1 sm:col-span-2">
        <label class="text-xs font-semibold text-slate-600">Notas</label>
        <textarea
          v-model="form.notas"
          rows="3"
          placeholder="Observaciones adicionales..."
          class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      <!-- Error -->
      <div v-if="formError" class="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {{ formError }}
      </div>

      <!-- Acciones -->
      <div class="sm:col-span-2 flex justify-end gap-3 mt-2">
        <RouterLink
          to="/asambleas"
          class="text-sm font-semibold px-4 py-2 border border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600"
        >Cancelar</RouterLink>
        <button
          type="submit"
          :disabled="saving"
          class="text-sm font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg"
        >
          {{ saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear asamblea' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAsambleas } from '../composables/useAsambleas'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { TipoAsamblea, EstadoAsamblea } from '../types/asambleas.types'

const route = useRoute()
const authStore = useAuthStore()
const { submitCreate, submitUpdate, loadOne, current, saving, formError } = useAsambleas()

const esEdicion = computed(() => !!route.params.id)

const form = ref({
  numero_acta: '',
  tipo: '' as TipoAsamblea | '',
  asunto: '',
  fecha_programada: '',
  lugar: '',
  quorum_requerido: undefined as number | undefined,
  notas: '',
  estado: undefined as EstadoAsamblea | undefined,
})

async function submit() {
  if (!form.value.tipo) return
  if (esEdicion.value) {
    await submitUpdate(route.params.id as string, {
      numero_acta:      form.value.numero_acta || undefined,
      tipo:             form.value.tipo || undefined,
      asunto:           form.value.asunto || undefined,
      fecha_programada: form.value.fecha_programada
        ? new Date(form.value.fecha_programada).toISOString()
        : undefined,
      lugar:            form.value.lugar || undefined,
      quorum_requerido: form.value.quorum_requerido,
      notas:            form.value.notas || undefined,
      estado:           form.value.estado,
    })
  } else {
    const conjuntoId = (authStore.user as any)?.conjunto_id ?? ''
    await submitCreate({
      conjuntoId,
      numero_acta:      form.value.numero_acta,
      tipo:             form.value.tipo as TipoAsamblea,
      asunto:           form.value.asunto,
      fecha_programada: new Date(form.value.fecha_programada).toISOString(),
      lugar:            form.value.lugar || undefined,
      quorum_requerido: form.value.quorum_requerido,
      notas:            form.value.notas || undefined,
    })
  }
}

onMounted(async () => {
  if (esEdicion.value) {
    await loadOne(route.params.id as string)
    if (current.value) {
      form.value = {
        numero_acta:      current.value.numero_acta,
        tipo:             current.value.tipo,
        asunto:           current.value.asunto,
        fecha_programada: current.value.fecha_programada.slice(0, 16),
        lugar:            current.value.lugar ?? '',
        quorum_requerido: current.value.quorum_requerido,
        notas:            current.value.notas ?? '',
        estado:           current.value.estado,
      }
    }
  }
})
</script>
