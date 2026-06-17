<template>
  <div class="space-y-5">

    <button class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group" @click="router.back()">
      <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver a la asamblea
    </button>

    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <template v-else-if="a">

      <!-- Header sala -->
      <div class="rounded-2xl bg-gradient-to-r from-indigo-700 to-indigo-800 p-6 text-white shadow-lg">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p class="text-indigo-300 text-xs font-semibold uppercase tracking-wide mb-1">Sala de votación</p>
            <h1 class="text-xl font-bold">{{ a.asunto }}</h1>
            <p class="text-indigo-300 text-sm mt-0.5">Acta {{ a.numero_acta }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span :class="['rounded-full px-3 py-1 text-sm font-semibold',
                           a.estado === 'en_curso' ? 'bg-green-500/20 text-green-200 flex items-center gap-1.5' : 'bg-white/10 text-white/70']">
              <span v-if="a.estado === 'en_curso'" class="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              {{ a.estado === 'en_curso' ? 'En vivo' : estadoLabel(a.estado) }}
            </span>
            <button
              v-if="authStore.isAdmin && a.estado === 'en_curso'"
              class="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              @click="showModal = true"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo punto
            </button>
          </div>
        </div>
      </div>

      <!-- Sin puntos -->
      <div v-if="!store.votaciones.length" class="flex flex-col items-center py-16 text-gray-400">
        <span class="text-5xl mb-4">🗳️</span>
        <p class="text-sm font-medium">No hay puntos de votación registrados</p>
        <p v-if="authStore.isAdmin && a.estado === 'en_curso'" class="text-xs mt-1 text-indigo-500 cursor-pointer hover:underline" @click="showModal = true">
          Agregar el primer punto
        </p>
      </div>

      <!-- Lista de puntos -->
      <div v-else class="space-y-4">
        <div
          v-for="v in store.votaciones"
          :key="v.id"
          class="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden"
        >
          <!-- Cabecera punto -->
          <div class="flex items-start justify-between px-5 py-4 bg-gray-50 border-b border-gray-100 gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono text-gray-400 shrink-0">#{{ v.numero_votacion }}</span>
                <p class="text-sm font-bold text-gray-900">{{ v.tema }}</p>
              </div>
              <p v-if="v.descripcion" class="text-xs text-gray-500 mt-0.5">{{ v.descripcion }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span
                v-if="v.resultado"
                :class="['inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold',
                         v.resultado === 'aprobado'  ? 'bg-green-100 text-green-700' :
                         v.resultado === 'rechazado' ? 'bg-red-100 text-red-700' :
                                                       'bg-yellow-100 text-yellow-700']"
              >
                {{ v.resultado }}
              </span>
              <span v-else class="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                En proceso
              </span>
              <button
                v-if="authStore.isAdmin"
                class="text-gray-400 hover:text-indigo-600 transition-colors"
                title="Editar"
                @click="editarVotacion(v)"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Barras de resultados -->
          <div class="p-5 space-y-3">
            <div class="space-y-2.5">
              <div v-for="row in votacionRows(v)" :key="row.label" class="flex items-center gap-3">
                <span class="w-20 text-xs text-gray-500 shrink-0">{{ row.label }}</span>
                <div class="flex-1 rounded-full bg-gray-100 h-3 overflow-hidden">
                  <div
                    :class="['h-3 rounded-full transition-all duration-500', row.color]"
                    :style="{ width: `${row.pct}%` }"
                  />
                </div>
                <span class="w-8 text-right text-sm font-bold text-gray-700 shrink-0">{{ row.val }}</span>
                <span class="w-10 text-right text-xs text-gray-400 shrink-0">{{ row.pct }}%</span>
              </div>
            </div>

            <p class="text-xs text-gray-400 text-right">
              Total: {{ v.votos_a_favor + v.votos_en_contra + v.abstenciones }} votos
            </p>
          </div>
        </div>
      </div>

    </template>

    <!-- Modal: Agregar / editar punto de votación -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" @click.self="closeModal">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900">
              {{ editingVotacion ? 'Editar punto de votación' : 'Nuevo punto de votación' }}
            </h3>
            <button class="text-gray-400 hover:text-gray-600" @click="closeModal">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Tema *</label>
              <input v-model="form.tema" type="text" placeholder="Ej: Aprobación del presupuesto 2025"
                class="block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                autofocus />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea v-model="form.descripcion" rows="2" placeholder="Detalle del punto a votar..."
                class="block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none" />
            </div>

            <div>
              <p class="text-xs font-medium text-gray-600 mb-2">Conteo de votos (secretario registra en tiempo real)</p>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-xs text-green-600 font-semibold mb-1">👍 A favor</label>
                  <input v-model.number="form.votos_a_favor" type="number" min="0"
                    class="block w-full rounded-xl border border-gray-300 px-2.5 py-2 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400" />
                </div>
                <div>
                  <label class="block text-xs text-red-600 font-semibold mb-1">👎 En contra</label>
                  <input v-model.number="form.votos_en_contra" type="number" min="0"
                    class="block w-full rounded-xl border border-gray-300 px-2.5 py-2 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 font-semibold mb-1">✋ Abstención</label>
                  <input v-model.number="form.abstenciones" type="number" min="0"
                    class="block w-full rounded-xl border border-gray-300 px-2.5 py-2 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-gray-200" />
                </div>
              </div>
              <p class="text-xs text-gray-400 mt-1.5 text-center">
                Total: {{ form.votos_a_favor + form.votos_en_contra + form.abstenciones }} votos
              </p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Resultado</label>
              <select v-model="form.resultado"
                class="block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <option value="">Sin resultado aún</option>
                <option value="aprobado">✅ Aprobado</option>
                <option value="rechazado">❌ Rechazado</option>
                <option value="aplazado">⏸ Aplazado</option>
              </select>
            </div>

            <p v-if="formError" class="text-xs text-red-600">{{ formError }}</p>

            <div class="flex gap-3 pt-1">
              <button
                class="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                @click="closeModal"
              >Cancelar</button>
              <button
                :disabled="formSaving"
                class="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
                @click="guardarPunto"
              >
                {{ formSaving ? 'Guardando...' : (editingVotacion ? 'Actualizar' : 'Registrar') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAsambleasStore } from '../store/asambleas.store'
import { estadoLabel } from '../composables/useAsambleas'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { AsambleaVotacion } from '../types/asambleas.types'

const route     = useRoute()
const router    = useRouter()
const store     = useAsambleasStore()
const authStore = useAuthStore()

const id = route.params.id as string
const a  = computed(() => store.current)

function votacionRows(v: AsambleaVotacion) {
  const total = v.votos_a_favor + v.votos_en_contra + v.abstenciones
  const pct   = (n: number) => total ? Math.round((n / total) * 100) : 0
  return [
    { label: 'A favor',    val: v.votos_a_favor,   color: 'bg-green-500', pct: pct(v.votos_a_favor)   },
    { label: 'En contra',  val: v.votos_en_contra,  color: 'bg-red-500',   pct: pct(v.votos_en_contra)  },
    { label: 'Abstención', val: v.abstenciones,     color: 'bg-gray-400',  pct: pct(v.abstenciones)     },
  ]
}

// ── Modal ─────────────────────────────────────────────────────────────────────

const showModal       = ref(false)
const editingVotacion = ref<AsambleaVotacion | null>(null)
const formSaving      = ref(false)
const formError       = ref('')

const form = ref({
  tema:            '',
  descripcion:     '',
  votos_a_favor:   0,
  votos_en_contra: 0,
  abstenciones:    0,
  resultado:       '',
})

function editarVotacion(v: AsambleaVotacion) {
  editingVotacion.value = v
  form.value = {
    tema:            v.tema,
    descripcion:     v.descripcion ?? '',
    votos_a_favor:   v.votos_a_favor,
    votos_en_contra: v.votos_en_contra,
    abstenciones:    v.abstenciones,
    resultado:       v.resultado ?? '',
  }
  showModal.value = true
}

function closeModal() {
  showModal.value       = false
  editingVotacion.value = null
  formError.value       = ''
  form.value = { tema: '', descripcion: '', votos_a_favor: 0, votos_en_contra: 0, abstenciones: 0, resultado: '' }
}

async function guardarPunto() {
  if (!form.value.tema.trim()) { formError.value = 'El tema es obligatorio'; return }
  formSaving.value = true
  formError.value  = ''
  try {
    const payload = {
      tema:            form.value.tema.trim(),
      descripcion:     form.value.descripcion || undefined,
      votos_a_favor:   form.value.votos_a_favor,
      votos_en_contra: form.value.votos_en_contra,
      abstenciones:    form.value.abstenciones,
      resultado:       (form.value.resultado || undefined) as any,
    }
    if (editingVotacion.value) {
      await store.updateVotacion(id, editingVotacion.value.id, payload)
    } else {
      await store.addVotacion(id, payload)
    }
    closeModal()
  } catch (e: any) {
    formError.value = e?.response?.data?.message ?? 'Error al guardar el punto'
  } finally {
    formSaving.value = false
  }
}

onMounted(async () => {
  await store.fetchOne(id)
  await store.fetchVotaciones(id)
})
</script>
