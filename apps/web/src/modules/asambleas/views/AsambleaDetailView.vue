<template>
  <div class="space-y-6">

    <button class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 group" @click="router.back()">
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

    <div v-else-if="!a" class="text-center py-20 text-gray-400">
      <span class="text-4xl block mb-3">🗓️</span>
      <p class="text-sm">Asamblea no encontrada</p>
    </div>

    <template v-else>

      <!-- Title row -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl', iconBg]">
            {{ tipoIcon(a.tipo) }}
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 leading-tight">{{ a.asunto }}</h1>
            <p class="text-sm text-gray-400 font-mono mt-0.5">{{ a.numero_acta }}</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span :class="['inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold', estadoBadgeClass(a.estado)]">
            <span :class="['h-1.5 w-1.5 rounded-full', estadoDotClass(a.estado)]" />
            {{ estadoLabel(a.estado) }}
          </span>
          <button
            v-if="authStore.isAdmin && a.activo"
            class="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            @click="router.push(`/asambleas/${a.id}/editar`)"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Main: info + descripción + votaciones + acuerdos -->
        <div class="lg:col-span-2 space-y-5">

          <!-- Info general -->
          <div class="rounded-2xl bg-white border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
            <div class="px-5 py-3 bg-gray-50">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Información general</h3>
            </div>
            <div v-for="row in detalleRows" :key="row.label" class="flex items-center justify-between px-5 py-3 text-sm">
              <span class="text-gray-500">{{ row.label }}</span>
              <span class="font-medium text-gray-900 text-right max-w-xs truncate">{{ row.value }}</span>
            </div>
          </div>

          <!-- Descripción / Agenda -->
          <div v-if="a.descripcion" class="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Descripción / Agenda</h3>
            <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ a.descripcion }}</p>
          </div>

          <!-- Observaciones -->
          <div v-if="a.observaciones" class="rounded-2xl bg-amber-50 border border-amber-200 shadow-sm p-5">
            <h3 class="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Observaciones</h3>
            <p class="text-sm text-amber-800 leading-relaxed whitespace-pre-line">{{ a.observaciones }}</p>
          </div>

          <!-- Acta documento -->
          <div v-if="a.documento_acta_url" class="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📄</span>
              <div>
                <p class="text-sm font-semibold text-gray-900">Acta de la asamblea</p>
                <p class="text-xs text-gray-400">Documento oficial</p>
              </div>
            </div>
            <a :href="a.documento_acta_url" target="_blank"
               class="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
              Descargar
            </a>
          </div>

          <!-- Sala de votación (acceso rápido) -->
          <button
            v-if="['programada', 'en_curso'].includes(a.estado)"
            class="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            @click="router.push(`/asambleas/${a.id}/votacion`)"
          >
            🗳️ Ir a la sala de votación
          </button>

          <!-- Votaciones -->
          <div class="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Votaciones ({{ store.votaciones.length }})
              </h3>
              <button
                v-if="authStore.isAdmin && ['programada', 'en_curso'].includes(a.estado)"
                class="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                @click="showVotacionModal = true"
              >
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Agregar punto
              </button>
            </div>
            <div v-if="!store.votaciones.length" class="flex flex-col items-center py-8 text-gray-400">
              <span class="text-2xl mb-2">🗳️</span>
              <p class="text-xs">No hay puntos de votación registrados</p>
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div v-for="v in store.votaciones" :key="v.id" class="px-5 py-4 space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-mono text-gray-400">#{{ v.numero_votacion }}</span>
                      <p class="text-sm font-semibold text-gray-900">{{ v.tema }}</p>
                    </div>
                    <p v-if="v.descripcion" class="text-xs text-gray-500 mt-0.5">{{ v.descripcion }}</p>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span v-if="v.resultado"
                      :class="['inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                               v.resultado === 'aprobado'  ? 'bg-green-100 text-green-700' :
                               v.resultado === 'rechazado' ? 'bg-red-100 text-red-700' :
                                                             'bg-yellow-100 text-yellow-700']">
                      {{ v.resultado }}
                    </span>
                    <button v-if="authStore.isAdmin" class="text-gray-400 hover:text-indigo-600" @click="editVotacion(v)">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div class="rounded-xl bg-green-50 p-2">
                    <p class="text-lg font-bold text-green-700">{{ v.votos_a_favor }}</p>
                    <p class="text-xs text-green-600">A favor</p>
                  </div>
                  <div class="rounded-xl bg-red-50 p-2">
                    <p class="text-lg font-bold text-red-700">{{ v.votos_en_contra }}</p>
                    <p class="text-xs text-red-600">En contra</p>
                  </div>
                  <div class="rounded-xl bg-gray-50 p-2">
                    <p class="text-lg font-bold text-gray-600">{{ v.abstenciones }}</p>
                    <p class="text-xs text-gray-500">Abstenciones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Acuerdos -->
          <div class="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Acuerdos ({{ store.acuerdos.length }})
              </h3>
              <button
                v-if="authStore.isAdmin"
                class="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                @click="showAcuerdoModal = true"
              >
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Agregar
              </button>
            </div>
            <div v-if="!store.acuerdos.length" class="flex flex-col items-center py-8 text-gray-400">
              <span class="text-2xl mb-2">🤝</span>
              <p class="text-xs">No hay acuerdos registrados</p>
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div v-for="ac in store.acuerdos" :key="ac.id" class="px-5 py-4 flex items-start gap-3">
                <span :class="['mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                              ac.estado === 'cumplido'    ? 'bg-green-100 text-green-700' :
                              ac.estado === 'en progreso' ? 'bg-blue-100 text-blue-700'  :
                              ac.estado === 'no cumplido' ? 'bg-red-100 text-red-700'    : 'bg-yellow-100 text-yellow-700']">
                  {{ ac.estado === 'cumplido' ? '✓' : ac.numero_acuerdo }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900">{{ ac.descripcion }}</p>
                  <div class="flex flex-wrap items-center gap-3 mt-1">
                    <span :class="['text-xs font-medium capitalize',
                                   ac.estado === 'cumplido'    ? 'text-green-600'  :
                                   ac.estado === 'en progreso' ? 'text-blue-600'   :
                                   ac.estado === 'no cumplido' ? 'text-red-600'    : 'text-yellow-600']">
                      {{ ac.estado }}
                    </span>
                    <span v-if="ac.responsable_nombre" class="text-xs text-gray-400">→ {{ ac.responsable_nombre }}</span>
                    <span v-if="ac.fecha_vencimiento" class="text-xs text-gray-400">
                      📅 {{ new Date(ac.fecha_vencimiento).toLocaleDateString('es-CO') }}
                    </span>
                  </div>
                </div>
                <button v-if="authStore.isAdmin" class="shrink-0 text-gray-400 hover:text-indigo-600" @click="editAcuerdo(ac)">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Sidebar -->
        <div class="space-y-4">

          <!-- Asistencia / Quórum -->
          <div class="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Asistencia</h3>

            <div v-if="a.quorum_requerido" class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">Quórum requerido</span>
                <span class="font-semibold text-gray-700">{{ a.quorum_requerido }}%</span>
              </div>
              <div v-if="a.asistentes_presente" class="space-y-1.5">
                <div class="w-full rounded-full bg-gray-100 h-2.5 overflow-hidden">
                  <div
                    :class="['h-2.5 rounded-full transition-all duration-500', quorumAlcanzado ? 'bg-green-500' : 'bg-yellow-400']"
                    :style="{ width: Math.min(quorumPct, 100) + '%' }"
                  />
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span :class="quorumAlcanzado ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'">
                    {{ quorumAlcanzado ? '✓ Quórum alcanzado' : '⚠ Sin quórum aún' }}
                  </span>
                  <span class="text-gray-500">{{ quorumPct }}%</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="rounded-xl bg-green-50 p-3 text-center">
                <p class="text-2xl font-bold text-green-700">{{ a.asistentes_presente ?? '—' }}</p>
                <p class="text-xs text-green-600 mt-0.5">Presentes</p>
              </div>
              <div class="rounded-xl bg-red-50 p-3 text-center">
                <p class="text-2xl font-bold text-red-700">{{ a.asistentes_ausentes ?? '—' }}</p>
                <p class="text-xs text-red-600 mt-0.5">Ausentes</p>
              </div>
            </div>

            <div v-if="a.representantes" class="rounded-xl bg-indigo-50 p-3 text-center">
              <p class="text-2xl font-bold text-indigo-700">{{ a.representantes }}</p>
              <p class="text-xs text-indigo-600 mt-0.5">Representantes</p>
            </div>

            <!-- Actualizar asistencia -->
            <div v-if="authStore.isAdmin && ['en_curso', 'realizada'].includes(a.estado)" class="pt-3 border-t border-gray-100 space-y-2">
              <p class="text-xs font-semibold text-gray-500">Actualizar asistencia</p>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs text-gray-400 mb-1">Presentes</label>
                  <input v-model.number="asistForm.presentes" type="number" min="0"
                    class="block w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                </div>
                <div>
                  <label class="block text-xs text-gray-400 mb-1">Ausentes</label>
                  <input v-model.number="asistForm.ausentes" type="number" min="0"
                    class="block w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                </div>
              </div>
              <button
                :disabled="savingAsist"
                class="w-full rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
                @click="guardarAsistencia"
              >{{ savingAsist ? 'Guardando...' : 'Guardar asistencia' }}</button>
            </div>
          </div>

          <!-- Gestión estado (admin) -->
          <div v-if="authStore.isAdmin && a.activo" class="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-2.5">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gestión</h3>

            <button v-if="a.estado === 'programada'" :disabled="estadoLoading"
              class="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60 transition-colors"
              @click="handleCambio('en_curso')">▶ Iniciar asamblea</button>

            <button v-if="a.estado === 'en_curso'" :disabled="estadoLoading"
              class="w-full rounded-xl bg-gray-700 py-2.5 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-60 transition-colors"
              @click="handleCambio('realizada')">✓ Finalizar asamblea</button>

            <button v-if="a.estado === 'programada'" :disabled="estadoLoading"
              class="w-full rounded-xl border border-yellow-300 bg-yellow-50 py-2.5 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 disabled:opacity-60 transition-colors"
              @click="handleCambio('pospuesta')">⏸ Posponer</button>

            <button v-if="['programada', 'pospuesta'].includes(a.estado)" :disabled="estadoLoading"
              class="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 transition-colors"
              @click="handleCambio('cancelada')">✕ Cancelar asamblea</button>

            <button v-if="['programada', 'cancelada'].includes(a.estado)" :disabled="estadoLoading"
              class="w-full rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
              @click="handleEliminar">🗑 Eliminar</button>

            <p v-if="estadoError" class="text-xs text-red-600">{{ estadoError }}</p>

            <div class="pt-2 border-t border-gray-100">
              <button class="w-full text-xs text-red-500 hover:text-red-700 py-1 transition-colors" @click="handleDesactivar">
                Desactivar asamblea
              </button>
            </div>
          </div>

          <!-- Mesa directiva -->
          <div v-if="a.presidente_nombre || a.secretario_nombre" class="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-2.5">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mesa directiva</h3>
            <div v-if="a.presidente_nombre" class="flex items-center gap-2 text-sm">
              <span class="text-gray-400 w-20 text-xs">Presidente:</span>
              <span class="font-medium text-gray-800">{{ a.presidente_nombre }}</span>
            </div>
            <div v-if="a.secretario_nombre" class="flex items-center gap-2 text-sm">
              <span class="text-gray-400 w-20 text-xs">Secretario:</span>
              <span class="font-medium text-gray-800">{{ a.secretario_nombre }}</span>
            </div>
          </div>

        </div>
      </div>
    </template>

    <!-- Modal: Votación -->
    <Teleport to="body">
      <div v-if="showVotacionModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" @click.self="closeVotacionModal">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="text-sm font-semibold">{{ editingVotacion ? 'Editar votación' : 'Nuevo punto de votación' }}</h3>
            <button class="text-gray-400 hover:text-gray-600" @click="closeVotacionModal">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-5 space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Tema *</label>
              <input v-model="vForm.tema" type="text" placeholder="Ej: Aprobación del presupuesto..."
                class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea v-model="vForm.descripcion" rows="2" class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none" />
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">A favor</label>
                <input v-model.number="vForm.votos_a_favor" type="number" min="0" class="block w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-200" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">En contra</label>
                <input v-model.number="vForm.votos_en_contra" type="number" min="0" class="block w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-200" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Abstenciones</label>
                <input v-model.number="vForm.abstenciones" type="number" min="0" class="block w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-200" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Resultado</label>
              <select v-model="vForm.resultado" class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <option value="">Sin resultado aún</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
                <option value="aplazado">Aplazado</option>
              </select>
            </div>
            <p v-if="vError" class="text-xs text-red-600">{{ vError }}</p>
            <div class="flex gap-3 pt-1">
              <button class="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="closeVotacionModal">Cancelar</button>
              <button :disabled="vSaving" class="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors" @click="guardarVotacion">
                {{ vSaving ? 'Guardando...' : (editingVotacion ? 'Actualizar' : 'Agregar') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Acuerdo -->
    <Teleport to="body">
      <div v-if="showAcuerdoModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" @click.self="closeAcuerdoModal">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="text-sm font-semibold">{{ editingAcuerdo ? 'Editar acuerdo' : 'Nuevo acuerdo' }}</h3>
            <button class="text-gray-400 hover:text-gray-600" @click="closeAcuerdoModal">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="p-5 space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Descripción *</label>
              <textarea v-model="acForm.descripcion" rows="3" placeholder="Detalle el acuerdo tomado..."
                class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Responsable</label>
              <input v-model="acForm.responsable_nombre" type="text" placeholder="Nombre del responsable"
                class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Fecha límite</label>
              <input v-model="acForm.fecha_vencimiento" type="date"
                class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
            <div v-if="editingAcuerdo">
              <label class="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select v-model="acForm.estado" class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En progreso</option>
                <option value="cumplido">Cumplido</option>
                <option value="no cumplido">No cumplido</option>
              </select>
            </div>
            <p v-if="acError" class="text-xs text-red-600">{{ acError }}</p>
            <div class="flex gap-3 pt-1">
              <button class="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="closeAcuerdoModal">Cancelar</button>
              <button :disabled="acSaving" class="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors" @click="guardarAcuerdo">
                {{ acSaving ? 'Guardando...' : (editingAcuerdo ? 'Actualizar' : 'Agregar') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useAsambleasStore } from '../store/asambleas.store'
import {
  tipoIcon, estadoBadgeClass, estadoDotClass, estadoLabel,
  formatDateTime, formatDateShort,
} from '../composables/useAsambleas'
import type { AsambleaVotacion, AsambleaAcuerdo, EstadoAsamblea } from '../types/asambleas.types'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()
const store     = useAsambleasStore()

const id = route.params.id as string
const a  = computed(() => store.current)

const iconBg = computed(() => {
  const map: Record<string, string> = {
    programada: 'bg-blue-50', en_curso: 'bg-green-50', realizada: 'bg-gray-50',
    cancelada: 'bg-red-50', pospuesta: 'bg-yellow-50',
  }
  return map[a.value?.estado ?? ''] ?? 'bg-gray-50'
})

const detalleRows = computed(() => {
  if (!a.value) return []
  return [
    { label: 'Tipo',              value: `${tipoIcon(a.value.tipo)} ${a.value.tipo}` },
    { label: 'Fecha programada',  value: formatDateTime(a.value.fecha_programada) },
    { label: 'Fecha realizada',   value: a.value.fecha_realizada ? formatDateShort(a.value.fecha_realizada) : '—' },
    { label: 'Lugar',             value: a.value.lugar ?? '—' },
    { label: 'Quórum requerido',  value: a.value.quorum_requerido ? `${a.value.quorum_requerido}%` : '—' },
    { label: 'Votación requerida', value: a.value.votacion_requerida ? 'Sí' : 'No' },
    { label: 'Creada el',         value: new Date(a.value.created_at).toLocaleDateString('es-CO') },
  ]
})

const quorumPct       = computed(() => {
  if (!a.value?.quorum_requerido || !a.value.asistentes_presente) return 0
  return Math.round((a.value.asistentes_presente / a.value.quorum_requerido) * 100)
})
const quorumAlcanzado = computed(() => quorumPct.value >= 100)

// ── Asistencia ────────────────────────────────────────────────────────────────

const asistForm   = ref({ presentes: 0, ausentes: 0 })
const savingAsist = ref(false)

async function guardarAsistencia() {
  savingAsist.value = true
  try {
    await store.update(id, { asistentes_presente: asistForm.value.presentes, asistentes_ausentes: asistForm.value.ausentes })
    await store.fetchOne(id)
  } finally {
    savingAsist.value = false
  }
}

// ── Estado ────────────────────────────────────────────────────────────────────

const estadoLoading = ref(false)
const estadoError   = ref('')

async function handleCambio(estado: EstadoAsamblea) {
  const labels: Record<EstadoAsamblea, string> = {
    programada: 'reprogramar', en_curso: 'iniciar', realizada: 'finalizar', cancelada: 'cancelar', pospuesta: 'posponer',
  }
  if (!confirm(`¿${labels[estado]} esta asamblea?`)) return
  estadoLoading.value = true
  estadoError.value   = ''
  try {
    await store.update(id, { estado })
    await store.fetchOne(id)
  } catch (e: any) {
    estadoError.value = e?.response?.data?.message ?? 'Error al cambiar estado'
  } finally {
    estadoLoading.value = false
  }
}

async function handleEliminar() {
  if (!confirm('¿Eliminar esta asamblea? Esta acción no se puede deshacer.')) return
  await store.remove(id)
  router.push('/asambleas')
}

async function handleDesactivar() {
  if (!confirm('¿Desactivar esta asamblea? Dejará de aparecer en la lista.')) return
  try {
    await store.deactivate(id)
    router.back()
  } catch (e: any) {
    alert(e?.response?.data?.message ?? 'Error al desactivar')
  }
}

// ── Votaciones ────────────────────────────────────────────────────────────────

const showVotacionModal = ref(false)
const editingVotacion   = ref<AsambleaVotacion | null>(null)
const vSaving           = ref(false)
const vError            = ref('')
const vForm             = ref({ tema: '', descripcion: '', votos_a_favor: 0, votos_en_contra: 0, abstenciones: 0, resultado: '' })

function editVotacion(v: AsambleaVotacion) {
  editingVotacion.value   = v
  vForm.value             = { tema: v.tema, descripcion: v.descripcion ?? '', votos_a_favor: v.votos_a_favor, votos_en_contra: v.votos_en_contra, abstenciones: v.abstenciones, resultado: v.resultado ?? '' }
  showVotacionModal.value = true
}

function closeVotacionModal() {
  showVotacionModal.value = false
  editingVotacion.value   = null
  vForm.value             = { tema: '', descripcion: '', votos_a_favor: 0, votos_en_contra: 0, abstenciones: 0, resultado: '' }
  vError.value            = ''
}

async function guardarVotacion() {
  if (!vForm.value.tema.trim()) { vError.value = 'El tema es obligatorio'; return }
  vSaving.value = true
  vError.value  = ''
  try {
    const payload = { tema: vForm.value.tema.trim(), descripcion: vForm.value.descripcion || undefined, votos_a_favor: vForm.value.votos_a_favor, votos_en_contra: vForm.value.votos_en_contra, abstenciones: vForm.value.abstenciones, resultado: (vForm.value.resultado || undefined) as any }
    editingVotacion.value
      ? await store.updateVotacion(id, editingVotacion.value.id, payload)
      : await store.addVotacion(id, payload)
    closeVotacionModal()
  } catch (e: any) {
    vError.value = e?.response?.data?.message ?? 'Error al guardar'
  } finally {
    vSaving.value = false
  }
}

// ── Acuerdos ──────────────────────────────────────────────────────────────────

const showAcuerdoModal = ref(false)
const editingAcuerdo   = ref<AsambleaAcuerdo | null>(null)
const acSaving         = ref(false)
const acError          = ref('')
const acForm           = ref({ descripcion: '', responsable_nombre: '', fecha_vencimiento: '', estado: 'pendiente' })

function editAcuerdo(ac: AsambleaAcuerdo) {
  editingAcuerdo.value   = ac
  acForm.value           = { descripcion: ac.descripcion, responsable_nombre: ac.responsable_nombre ?? '', fecha_vencimiento: ac.fecha_vencimiento?.split('T')[0] ?? '', estado: ac.estado }
  showAcuerdoModal.value = true
}

function closeAcuerdoModal() {
  showAcuerdoModal.value = false
  editingAcuerdo.value   = null
  acForm.value           = { descripcion: '', responsable_nombre: '', fecha_vencimiento: '', estado: 'pendiente' }
  acError.value          = ''
}

async function guardarAcuerdo() {
  if (!acForm.value.descripcion.trim()) { acError.value = 'La descripción es obligatoria'; return }
  acSaving.value = true
  acError.value  = ''
  try {
    const payload = { descripcion: acForm.value.descripcion.trim(), responsable_nombre: acForm.value.responsable_nombre || undefined, fecha_vencimiento: acForm.value.fecha_vencimiento || undefined, estado: (acForm.value.estado || undefined) as any }
    editingAcuerdo.value
      ? await store.updateAcuerdo(id, editingAcuerdo.value.id, payload)
      : await store.addAcuerdo(id, payload)
    closeAcuerdoModal()
  } catch (e: any) {
    acError.value = e?.response?.data?.message ?? 'Error al guardar'
  } finally {
    acSaving.value = false
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  await store.fetchOne(id)
  await Promise.all([store.fetchVotaciones(id), store.fetchAcuerdos(id)])
  if (a.value) {
    asistForm.value.presentes = a.value.asistentes_presente ?? 0
    asistForm.value.ausentes  = a.value.asistentes_ausentes ?? 0
  }
})

onUnmounted(() => store.clearCurrent())
</script>
