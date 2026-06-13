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
      <div class="rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-800 p-6 text-white">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p class="text-indigo-300 text-xs font-medium uppercase tracking-wide mb-1">Sala de votación</p>
            <h1 class="text-xl font-bold">{{ a.asunto }}</h1>
            <p class="text-indigo-300 text-sm mt-0.5">Acta {{ a.numero_acta }}</p>
          </div>
          <span :class="['rounded-full px-3 py-1 text-sm font-semibold', a.estado === 'en_curso' ? 'bg-green-500/20 text-green-200' : 'bg-white/10 text-white/70']">
            {{ a.estado === 'en_curso' ? '🔴 En vivo' : ESTADOS_ASAMBLEA.find((e) => e.value === a.estado)?.label }}
          </span>
        </div>
      </div>

      <!-- Puntos de votación -->
      <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="text-sm font-semibold text-gray-900">Puntos a votar</h2>
          <button
            v-if="authStore.isAdmin && a.estado === 'en_curso'"
            class="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            @click="agregarPunto"
          >
            + Agregar punto
          </button>
        </div>

        <!-- Sin puntos -->
        <div v-if="!puntos.length" class="flex flex-col items-center py-12 text-gray-400">
          <span class="text-4xl mb-3">🗳️</span>
          <p class="text-sm">No hay puntos de votación aún</p>
          <p v-if="authStore.isAdmin && a.estado === 'en_curso'" class="text-xs mt-1">Agrega el primer punto para comenzar</p>
        </div>

        <!-- Lista de puntos -->
        <div v-else class="divide-y divide-gray-100">
          <div v-for="(punto, idx) in puntos" :key="idx" class="p-5 space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Punto {{ idx + 1 }}</p>
                <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ punto.titulo }}</p>
                <p v-if="punto.descripcion" class="text-xs text-gray-500 mt-1">{{ punto.descripcion }}</p>
              </div>
              <span :class="['rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0',
                             punto.cerrado ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700']">
                {{ punto.cerrado ? 'Cerrado' : 'Abierto' }}
              </span>
            </div>

            <!-- Botones de voto -->
            <div v-if="!punto.cerrado && a.estado === 'en_curso'" class="flex gap-3">
              <button
                :disabled="punto.miVoto !== null"
                :class="['flex-1 rounded-lg border-2 py-2.5 text-sm font-bold transition-all',
                         punto.miVoto === 'si'
                           ? 'border-green-500 bg-green-500 text-white'
                           : 'border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50']"
                @click="votar(idx, 'si')"
              >
                👍 A favor <span v-if="punto.votos.si > 0" class="ml-1 text-xs">({{ punto.votos.si }})</span>
              </button>
              <button
                :disabled="punto.miVoto !== null"
                :class="['flex-1 rounded-lg border-2 py-2.5 text-sm font-bold transition-all',
                         punto.miVoto === 'no'
                           ? 'border-red-500 bg-red-500 text-white'
                           : 'border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50']"
                @click="votar(idx, 'no')"
              >
                👎 En contra <span v-if="punto.votos.no > 0" class="ml-1 text-xs">({{ punto.votos.no }})</span>
              </button>
              <button
                :disabled="punto.miVoto !== null"
                :class="['flex-1 rounded-lg border-2 py-2.5 text-sm font-bold transition-all',
                         punto.miVoto === 'abstencion'
                           ? 'border-gray-500 bg-gray-500 text-white'
                           : 'border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50']"
                @click="votar(idx, 'abstencion')"
              >
                ✋ Abstención
              </button>
            </div>

            <!-- Resultados -->
            <div v-if="punto.cerrado || punto.miVoto !== null" class="space-y-2">
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Resultados</p>
              <div class="space-y-1.5">
                <div v-for="(val, key) in punto.votos" :key="key" class="flex items-center gap-3">
                  <span class="text-xs text-gray-500 w-20 capitalize">{{ key === 'si' ? 'A favor' : key === 'no' ? 'En contra' : 'Abstención' }}</span>
                  <div class="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      :class="['h-2 rounded-full transition-all',
                               key === 'si' ? 'bg-green-500' : key === 'no' ? 'bg-red-500' : 'bg-gray-400']"
                      :style="{ width: `${totalVotos(punto) ? (val / totalVotos(punto)) * 100 : 0}%` }"
                    />
                  </div>
                  <span class="text-xs font-bold text-gray-700 w-6 text-right">{{ val }}</span>
                </div>
              </div>

              <button
                v-if="authStore.isAdmin && !punto.cerrado"
                class="mt-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                @click="cerrarPunto(idx)"
              >
                Cerrar votación
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAsambleasStore } from '../store/asambleas.store'
import { ESTADOS_ASAMBLEA } from '../composables/useAsambleas'
import { useAuthStore } from '@/modules/auth/store/auth.store'

interface PuntoVotacion {
  titulo: string
  descripcion: string
  votos: { si: number; no: number; abstencion: number }
  miVoto: 'si' | 'no' | 'abstencion' | null
  cerrado: boolean
}

const route     = useRoute()
const router    = useRouter()
const store     = useAsambleasStore()
const authStore = useAuthStore()

const a      = computed(() => store.current)
const puntos = ref<PuntoVotacion[]>([])

onMounted(() => store.fetchOne(route.params.id as string))

function agregarPunto() {
  const titulo = prompt('Título del punto a votar:')
  if (!titulo?.trim()) return
  const descripcion = prompt('Descripción (opcional):') ?? ''
  puntos.value.push({ titulo, descripcion, votos: { si: 0, no: 0, abstencion: 0 }, miVoto: null, cerrado: false })
}

function votar(idx: number, opcion: 'si' | 'no' | 'abstencion') {
  const p = puntos.value[idx]
  if (p.miVoto !== null || p.cerrado) return
  p.votos[opcion]++
  p.miVoto = opcion
}

function cerrarPunto(idx: number) {
  puntos.value[idx].cerrado = true
}

function totalVotos(p: PuntoVotacion) {
  return p.votos.si + p.votos.no + p.votos.abstencion
}
</script>