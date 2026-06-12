<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-slate-800">Asambleas</h1>
      <RouterLink
        v-if="authStore.isAdmin"
        to="/asambleas/nueva"
        class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
      >
        + Nueva asamblea
      </RouterLink>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-3 mb-6">
      <select
        v-model="filtros.tipo"
        class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="buscar"
      >
        <option value="">Todos los tipos</option>
        <option value="ordinaria">Ordinaria</option>
        <option value="extraordinaria">Extraordinaria</option>
        <option value="de_propietarios">De propietarios</option>
        <option value="de_consejo">De consejo</option>
        <option value="otra">Otra</option>
      </select>
      <select
        v-model="filtros.estado"
        class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="buscar"
      >
        <option value="">Todos los estados</option>
        <option value="programada">Programada</option>
        <option value="en_curso">En curso</option>
        <option value="realizada">Realizada</option>
        <option value="cancelada">Cancelada</option>
        <option value="pospuesta">Pospuesta</option>
      </select>
    </div>

    <!-- Estados -->
    <div v-if="store.loading" class="text-center py-16 text-slate-500">Cargando...</div>
    <div v-else-if="store.error" class="text-red-600 p-4 bg-red-50 rounded-lg">{{ store.error }}</div>
    <div v-else-if="!store.asambleas.length" class="text-center py-16 text-slate-400">
      No hay asambleas registradas.
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AsambleaCard
        v-for="a in store.asambleas"
        :key="a.id"
        :asamblea="a"
        @click="router.push(`/asambleas/${a.id}`)"
      />
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-6">
      <button
        class="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed bg-white"
        :disabled="paginaActual === 1"
        @click="cambiarPagina(paginaActual - 1)"
      >‹</button>
      <span class="text-sm text-slate-600">{{ paginaActual }} / {{ totalPages }}</span>
      <button
        class="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed bg-white"
        :disabled="paginaActual === totalPages"
        @click="cambiarPagina(paginaActual + 1)"
      >›</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAsambleasStore } from '../store/asambleas.store'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import AsambleaCard from '../components/AsambleaCard.vue'
import type { TipoAsamblea, EstadoAsamblea } from '../types/asambleas.types'

const store = useAsambleasStore()
const authStore = useAuthStore()
const router = useRouter()

const filtros = ref<{ tipo: TipoAsamblea | ''; estado: EstadoAsamblea | '' }>({ tipo: '', estado: '' })
const paginaActual = ref(1)
const totalPages = computed(() => Math.ceil(store.total / 20))

function buscar() { paginaActual.value = 1; cargar() }
function cambiarPagina(n: number) { paginaActual.value = n; cargar() }

function cargar() {
  store.fetchList({
    page: paginaActual.value,
    limit: 20,
    ...(filtros.value.tipo   ? { tipo:   filtros.value.tipo   } : {}),
    ...(filtros.value.estado ? { estado: filtros.value.estado } : {}),
  })
}

onMounted(cargar)
</script>
