<template>
  <div class="max-w-3xl mx-auto p-6">
    <div v-if="store.loading" class="text-center py-16 text-slate-500">Cargando...</div>
    <div v-else-if="store.error" class="text-red-600 p-4 bg-red-50 rounded-lg">{{ store.error }}</div>

    <template v-else-if="store.current">
      <!-- Header -->
      <div class="flex justify-between items-start mb-6 gap-4">
        <div>
          <RouterLink to="/asambleas" class="text-sm text-blue-600 hover:underline block mb-1">
            ← Asambleas
          </RouterLink>
          <h1 class="text-xl font-bold text-slate-800 mb-1">{{ store.current.asunto }}</h1>
          <span
            class="text-xs font-bold px-2 py-0.5 rounded-full uppercase"
            :class="badgeClass"
          >{{ LABELS_ESTADO[store.current.estado] }}</span>
        </div>
        <div v-if="authStore.isAdmin" class="flex gap-2 shrink-0">
          <RouterLink
            :to="`/asambleas/${store.current.id}/editar`"
            class="text-sm font-semibold px-3 py-1.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600"
          >Editar</RouterLink>
          <button
            v-if="puedeEliminar"
            class="text-sm font-semibold px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg text-red-700"
            @click="confirmarEliminar"
          >Eliminar</button>
        </div>
      </div>

      <!-- Detalle -->
      <div class="bg-white border border-slate-200 rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Número de acta</p>
          <p class="text-sm text-slate-800">{{ store.current.numero_acta }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Tipo</p>
          <p class="text-sm text-slate-800">{{ LABELS_TIPO[store.current.tipo] }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Fecha programada</p>
          <p class="text-sm text-slate-800">{{ fechaFormateada }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Lugar</p>
          <p class="text-sm text-slate-800">{{ store.current.lugar ?? '—' }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Quórum requerido</p>
          <p class="text-sm text-slate-800">
            {{ store.current.quorum_requerido ? store.current.quorum_requerido + '%' : '—' }}
          </p>
        </div>
        <div class="sm:col-span-2">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notas</p>
          <p class="text-sm text-slate-800">{{ store.current.notas ?? '—' }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAsambleasStore } from '../store/asambleas.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const route = useRoute()
const router = useRouter()
const store = useAsambleasStore()
const authStore = useAuthStore()

const LABELS_TIPO: Record<string, string> = {
  ordinaria: 'Ordinaria', extraordinaria: 'Extraordinaria',
  de_propietarios: 'De propietarios', de_consejo: 'De consejo', otra: 'Otra',
}
const LABELS_ESTADO: Record<string, string> = {
  programada: 'Programada', en_curso: 'En curso', realizada: 'Realizada',
  cancelada: 'Cancelada', pospuesta: 'Pospuesta',
}

const badgeClass = computed(() => ({
  'bg-blue-100 text-blue-700':     store.current?.estado === 'programada',
  'bg-yellow-100 text-yellow-700': store.current?.estado === 'en_curso',
  'bg-green-100 text-green-700':   store.current?.estado === 'realizada',
  'bg-red-100 text-red-700':       store.current?.estado === 'cancelada',
  'bg-purple-100 text-purple-700': store.current?.estado === 'pospuesta',
}))

const puedeEliminar = computed(() =>
  store.current && ['programada', 'cancelada'].includes(store.current.estado)
)

const fechaFormateada = computed(() =>
  store.current
    ? new Date(store.current.fecha_programada).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : ''
)

async function confirmarEliminar() {
  if (!confirm('¿Eliminar esta asamblea? Esta acción no se puede deshacer.')) return
  await store.remove(store.current!.id)
  router.push('/asambleas')
}

onMounted(() => store.fetchById(route.params.id as string))
</script>
