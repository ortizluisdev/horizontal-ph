<template>
  <div
    class="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
    @click="$emit('click', asamblea)"
  >
    <div class="flex justify-between items-center mb-2">
      <span class="text-xs font-semibold text-slate-500"># {{ asamblea.numero_acta }}</span>
      <span
        class="text-xs font-bold px-2 py-0.5 rounded-full uppercase"
        :class="badgeClass"
      >{{ LABELS_ESTADO[asamblea.estado] }}</span>
    </div>
    <h3 class="text-sm font-semibold text-slate-800 mb-2">{{ asamblea.asunto }}</h3>
    <div class="flex flex-wrap gap-3 text-xs text-slate-500">
      <span>{{ LABELS_TIPO[asamblea.tipo] }}</span>
      <span>{{ fechaFormateada }}</span>
      <span v-if="asamblea.lugar">📍 {{ asamblea.lugar }}</span>
    </div>
    <div v-if="asamblea.quorum_requerido" class="mt-2 text-xs text-slate-600">
      Quórum requerido: {{ asamblea.quorum_requerido }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Asamblea } from '../types/asambleas.types'

const props = defineProps<{ asamblea: Asamblea }>()
defineEmits<{ (e: 'click', a: Asamblea): void }>()

const LABELS_TIPO: Record<string, string> = {
  ordinaria: 'Ordinaria',
  extraordinaria: 'Extraordinaria',
  de_propietarios: 'De propietarios',
  de_consejo: 'De consejo',
  otra: 'Otra',
}

const LABELS_ESTADO: Record<string, string> = {
  programada: 'Programada',
  en_curso: 'En curso',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  pospuesta: 'Pospuesta',
}

const badgeClass = computed(() => ({
  'bg-blue-100 text-blue-700':   props.asamblea.estado === 'programada',
  'bg-yellow-100 text-yellow-700': props.asamblea.estado === 'en_curso',
  'bg-green-100 text-green-700': props.asamblea.estado === 'realizada',
  'bg-red-100 text-red-700':     props.asamblea.estado === 'cancelada',
  'bg-purple-100 text-purple-700': props.asamblea.estado === 'pospuesta',
}))

const fechaFormateada = computed(() =>
  new Date(props.asamblea.fecha_programada).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
)
</script>
