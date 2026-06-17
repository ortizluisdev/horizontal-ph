<template>
  <div class="space-y-5">
    <button
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group"
      @click="router.back()"
    >
      <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>

    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="!pqrs" class="text-center py-20 text-gray-400">
      <p class="text-sm">PQRS no encontrada</p>
    </div>

    <template v-else>
      <div class="flex items-start gap-4 justify-between flex-wrap">
        <div class="flex items-center gap-3">
          <span class="text-3xl">{{ tipoIcon(pqrs.tipo) }}</span>
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ pqrs.asunto }}</h1>
            <p class="text-sm font-mono text-gray-400 mt-0.5">{{ pqrs.numero_radicado }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span :class="['rounded-full px-2.5 py-1 text-xs font-medium capitalize', prioridadBadgeClass(pqrs.prioridad)]">
            {{ pqrs.prioridad }}
          </span>
          <PqrsStatusBadge :estado="pqrs.estado" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="lg:col-span-2 space-y-4">

          <!-- Descripción -->
          <div class="rounded-xl border border-gray-200 bg-white p-5">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Descripción</h3>
            <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ pqrs.descripcion }}</p>
          </div>

          <!-- Respuesta (cuando existe) -->
          <div
            v-if="pqrs.respuesta_descripcion"
            class="rounded-xl border border-green-200 bg-green-50 p-5"
          >
            <h3 class="text-sm font-semibold text-green-800 mb-2">Respuesta del administrador</h3>
            <p class="text-sm text-green-700 leading-relaxed whitespace-pre-line">{{ pqrs.respuesta_descripcion }}</p>
            <p v-if="pqrs.fecha_respuesta" class="text-xs text-green-500 mt-2">
              {{ formatDateTime(pqrs.fecha_respuesta) }}
            </p>
          </div>

          <!-- Datos del caso -->
          <div class="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
            <div
              v-for="row in detalleRows"
              :key="row.label"
              class="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span class="text-gray-500">{{ row.label }}</span>
              <span class="font-medium text-gray-900 text-right max-w-xs truncate">{{ row.value }}</span>
            </div>
          </div>

          <!-- Satisfacción del residente (cuando resuelta/cerrada) -->
          <div
            v-if="!isAdmin && ['resuelta', 'cerrada'].includes(pqrs.estado)"
            class="rounded-xl border border-gray-200 bg-white p-5 space-y-3"
          >
            <h3 class="text-sm font-semibold text-gray-900">¿Quedaste satisfecho con la respuesta?</h3>
            <div v-if="pqrs.calificacion_satisfaccion" class="text-sm text-gray-600">
              Calificación: <span class="font-semibold">{{ '★'.repeat(pqrs.calificacion_satisfaccion) }}{{ '☆'.repeat(5 - pqrs.calificacion_satisfaccion) }}</span>
              <span v-if="pqrs.comentario_satisfaccion" class="block text-gray-500 mt-1">{{ pqrs.comentario_satisfaccion }}</span>
            </div>
            <template v-else>
              <div class="flex gap-2">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  :class="[
                    'text-2xl transition-transform hover:scale-110',
                    satisfaccionHover >= n ? 'text-yellow-400' : 'text-gray-300',
                  ]"
                  @mouseenter="satisfaccionHover = n"
                  @mouseleave="satisfaccionHover = 0"
                  @click="calificacionSeleccionada = n"
                >★</button>
              </div>
              <textarea
                v-if="calificacionSeleccionada"
                v-model="comentarioSatisfaccion"
                rows="2"
                placeholder="Comentario opcional..."
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
              />
              <button
                v-if="calificacionSeleccionada"
                :disabled="savingRating"
                class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
                @click="enviarCalificacion"
              >
                {{ savingRating ? 'Enviando...' : 'Enviar calificación' }}
              </button>
            </template>
          </div>

          <!-- Acciones admin -->
          <div v-if="isAdmin && pqrs.activo" class="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h3 class="text-sm font-semibold text-gray-900">Gestión</h3>

            <!-- Tomar caso -->
            <div v-if="pqrs.estado === 'abierta'" class="flex gap-2">
              <input
                v-model="responsableNombre"
                type="text"
                placeholder="Nombre del responsable asignado"
                class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                :disabled="processing || !responsableNombre.trim()"
                class="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-400 disabled:opacity-60 transition-colors"
                @click="handleTomar"
              >
                Tomar caso
              </button>
            </div>

            <!-- Resolver -->
            <div v-if="pqrs.estado === 'en proceso'" class="space-y-2">
              <textarea
                v-model="respuestaTexto"
                rows="3"
                placeholder="Describe la solución o respuesta dada al residente..."
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
              />
              <button
                :disabled="processing || !respuestaTexto.trim()"
                class="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60 transition-colors"
                @click="handleResolver"
              >
                Marcar como resuelta
              </button>
            </div>

            <!-- Cerrar / Archivar -->
            <div class="flex gap-2">
              <button
                v-if="pqrs.estado === 'resuelta'"
                :disabled="processing"
                class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                @click="handleCerrar"
              >
                Cerrar PQRS
              </button>
              <button
                v-if="pqrs.estado === 'cerrada'"
                :disabled="processing"
                class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                @click="handleArchivar"
              >
                Archivar
              </button>
            </div>

            <!-- Desactivar -->
            <div v-if="!['archivada'].includes(pqrs.estado)" class="pt-2 border-t border-gray-100">
              <button
                :disabled="processing"
                class="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-60"
                @click="handleDesactivar"
              >
                Desactivar PQRS
              </button>
            </div>

            <p v-if="gestionError" class="text-xs text-red-600">{{ gestionError }}</p>
          </div>

        </div>

        <div class="space-y-4">
          <!-- Solicitante -->
          <div v-if="pqrs.nombre_solicitante" class="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Solicitante</h3>
            <p class="text-sm font-medium text-gray-900">{{ pqrs.nombre_solicitante }}</p>
            <p v-if="pqrs.email_solicitante" class="text-xs text-gray-500">{{ pqrs.email_solicitante }}</p>
            <p v-if="pqrs.telefono_solicitante" class="text-xs text-gray-500">{{ pqrs.telefono_solicitante }}</p>
          </div>

          <!-- Responsable -->
          <div v-if="pqrs.responsable_asignado_nombre" class="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <h3 class="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Responsable asignado</h3>
            <p class="text-sm font-medium text-indigo-900">{{ pqrs.responsable_asignado_nombre }}</p>
          </div>

          <!-- Notas internas (solo admin) -->
          <div
            v-if="isAdmin && pqrs.observaciones_internas"
            class="rounded-xl border border-amber-200 bg-amber-50 p-4"
          >
            <h3 class="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Notas internas</h3>
            <p class="text-sm text-amber-800">{{ pqrs.observaciones_internas }}</p>
          </div>

          <PqrsTimeline :items="store.seguimiento" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { usePqrsStore } from '../store/pqrs.store'
import { usePqrsGestion, tipoIcon, prioridadBadgeClass, formatDateTime } from '../composables/usePqrs'
import { pqrsApi } from '../api/pqrs.api'
import PqrsStatusBadge from '../components/PqrsStatusBadge.vue'
import PqrsTimeline from '../components/PqrsTimeline.vue'

const route  = useRoute()
const router = useRouter()
const store  = usePqrsStore()
const auth   = useAuthStore()
const { processing, error: gestionError, tomarCaso, resolver, cerrar, archivar } = usePqrsGestion()

const pqrs    = computed(() => store.current)
const isAdmin = computed(() => auth.isAdmin)

const responsableNombre      = ref('')
const respuestaTexto         = ref('')
const satisfaccionHover      = ref(0)
const calificacionSeleccionada = ref(0)
const comentarioSatisfaccion = ref('')
const savingRating           = ref(false)

onMounted(() => store.fetchOne(route.params.id as string))
onUnmounted(() => store.clearCurrent())

const detalleRows = computed(() => {
  if (!pqrs.value) return []
  const p = pqrs.value
  return [
    { label: 'Tipo',              value: p.tipo },
    { label: 'Categoría',        value: p.categoria ?? '-' },
    { label: 'Ubicación',        value: p.ubicacion_afectada ?? '-' },
    { label: 'Fecha radicación', value: formatDateTime(p.fecha_radicacion) },
    { label: 'Fecha respuesta',  value: p.fecha_respuesta ? formatDateTime(p.fecha_respuesta) : '-' },
    { label: 'Fecha cierre',     value: p.fecha_cierre    ? formatDateTime(p.fecha_cierre)    : '-' },
    { label: 'Días resolución',  value: p.tiempo_resolucion_dias ? `${p.tiempo_resolucion_dias} días` : '-' },
    { label: 'Seguimiento',      value: p.requiere_seguimiento ? 'Sí' : 'No' },
  ]
})

async function refreshDetalle() {
  await store.fetchOne(route.params.id as string)
}

async function handleTomar() {
  const ok = await tomarCaso(pqrs.value!.id, responsableNombre.value.trim())
  if (ok) {
    responsableNombre.value = ''
    await refreshDetalle()
  }
}

async function handleResolver() {
  const ok = await resolver(pqrs.value!.id, respuestaTexto.value.trim())
  if (ok) {
    respuestaTexto.value = ''
    await refreshDetalle()
  }
}

async function handleCerrar() {
  const ok = await cerrar(pqrs.value!.id)
  if (ok) await refreshDetalle()
}

async function handleArchivar() {
  const ok = await archivar(pqrs.value!.id)
  if (ok) await refreshDetalle()
}

async function handleDesactivar() {
  if (!confirm('¿Seguro que deseas desactivar esta PQRS? Dejará de aparecer en la lista.')) return
  try {
    await pqrsApi.deactivate(pqrs.value!.id)
    router.back()
  } catch (e: any) {
    alert(e?.response?.data?.message ?? 'Error al desactivar la PQRS')
  }
}

async function enviarCalificacion() {
  if (!calificacionSeleccionada.value) return
  savingRating.value = true
  try {
    await store.update(pqrs.value!.id, {
      calificacion_satisfaccion: calificacionSeleccionada.value,
      comentario_satisfaccion:   comentarioSatisfaccion.value || undefined,
    })
    await refreshDetalle()
    calificacionSeleccionada.value = 0
    comentarioSatisfaccion.value   = ''
  } finally {
    savingRating.value = false
  }
}
</script>
