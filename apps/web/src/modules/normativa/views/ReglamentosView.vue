<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Reglamentos</h1>
        <p class="text-sm text-gray-500 mt-0.5">Reglamento PH y manual de convivencia — Ley 675 de 2001</p>
      </div>
      <button v-if="authStore.isAdmin"
        class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
        @click="router.push('/normativa/nuevo')">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo reglamento
      </button>
    </div>
    <!-- Marco legal -->
    <div class="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
      <div class="flex items-start gap-3">
        <span class="text-2xl shrink-0">🏛️</span>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-indigo-900">Marco legal — Propiedad Horizontal en Colombia</p>
          <ul class="text-xs text-indigo-700 space-y-0.5 list-disc list-inside">
            <li><strong>Ley 675 de 2001</strong>: Régimen de propiedad horizontal. Regula la constitución y funcionamiento de conjuntos.</li>
            <li><strong>Decreto 1060 de 2009</strong>: Reglamentación parcial de la Ley 675 en materia de seguros.</li>
            <li><strong>NSR-10</strong>: Norma de Sismo Resistencia aplicable a áreas comunes.</li>
            <li>El <strong>Reglamento de PH</strong> debe ser aprobado por escritura pública e inscrito en el Registro.</li>
            <li>El <strong>Manual de convivencia</strong> debe ser aprobado por la Asamblea General de Propietarios.</li>
          </ul>
        </div>
      </div>
    </div>
    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="rounded-xl border border-gray-200 bg-white p-5 animate-pulse space-y-3">
        <div class="h-4 w-3/4 rounded bg-gray-200" /><div class="h-3 w-full rounded bg-gray-200" />
      </div>
    </div>
    <template v-else>
      <section>
        <h2 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          📜 Reglamento de Propiedad Horizontal
          <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 font-normal">{{ reglamentosPH.length }} doc(s)</span>
        </h2>
        <div v-if="!reglamentosPH.length" class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p class="text-sm text-gray-400">No hay reglamentos de PH registrados</p>
          <button v-if="authStore.isAdmin" class="mt-3 text-xs text-indigo-600 hover:underline" @click="router.push('/normativa/nuevo')">+ Agregar reglamento</button>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DocumentoCard v-for="doc in reglamentosPH" :key="doc.id" :doc="doc" @select="router.push(`/normativa/${doc.id}`)" />
        </div>
      </section>
      <section>
        <h2 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          🤝 Manual de Convivencia
          <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 font-normal">{{ manuales.length }} doc(s)</span>
        </h2>
        <div v-if="!manuales.length" class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p class="text-sm text-gray-400">No hay manuales de convivencia registrados</p>
          <button v-if="authStore.isAdmin" class="mt-3 text-xs text-indigo-600 hover:underline" @click="router.push('/normativa/nuevo')">+ Agregar manual</button>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DocumentoCard v-for="doc in manuales" :key="doc.id" :doc="doc" @select="router.push(`/normativa/${doc.id}`)" />
        </div>
      </section>
      <section v-if="resolucionesRecientes.length">
        <h2 class="text-sm font-semibold text-gray-700 mb-3">⚖️ Resoluciones y circulares recientes</h2>
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          <div v-for="doc in resolucionesRecientes" :key="doc.id"
            class="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="router.push(`/normativa/${doc.id}`)">
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-base shrink-0">{{ tipoIcon(doc.tipo) }}</span>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ doc.titulo }}</p>
                <p class="text-xs text-gray-400">{{ formatDateShort(doc.fecha_emision) }}</p>
              </div>
            </div>
            <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset shrink-0', estadoBadgeClass(doc.estado)]">
              <span :class="['h-1.5 w-1.5 rounded-full', estadoDotClass(doc.estado)]" />
              {{ ESTADOS_DOCUMENTO.find(e => e.value === doc.estado)?.label }}
            </span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNormativaStore } from '../store/normativa.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { tipoIcon, estadoBadgeClass, estadoDotClass, formatDateShort, ESTADOS_DOCUMENTO } from '../composables/useNormativa'
import DocumentoCard from '../components/DocumentoCard.vue'
const router    = useRouter()
const store     = useNormativaStore()
const authStore = useAuthStore()
onMounted(() => store.fetchList({ limit: 50 }))
const reglamentosPH        = computed(() => store.items.filter((d) => d.tipo === 'reglamento_ph'))
const manuales             = computed(() => store.items.filter((d) => d.tipo === 'manual_convivencia'))
const resolucionesRecientes = computed(() =>
  store.items.filter((d) => ['resolucion', 'circular'].includes(d.tipo))
    .sort((a, b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime())
    .slice(0, 10)
)
</script>