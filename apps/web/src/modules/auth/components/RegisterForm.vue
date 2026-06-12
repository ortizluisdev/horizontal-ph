<template>
  <form @submit.prevent="submit" novalidate class="space-y-5">
    <!-- Nombre -->
    <div>
      <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
        Nombre completo
      </label>
      <input
        id="nombre"
        v-model="form.nombre"
        type="text"
        autocomplete="name"
        placeholder="Juan Pérez"
        :class="inputClass(errors.nombre)"
        @input="errors.nombre = undefined"
      />
      <p v-if="errors.nombre" class="mt-1 text-xs text-red-600">{{ errors.nombre }}</p>
    </div>

    <!-- Email -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        Correo electrónico
      </label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        autocomplete="email"
        placeholder="correo@ejemplo.com"
        :class="inputClass(errors.email)"
        @input="errors.email = undefined"
      />
      <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
    </div>

    <!-- Tipo de usuario -->
    <div>
      <label for="tipoUsuario" class="block text-sm font-medium text-gray-700 mb-1">
        Tipo de usuario
      </label>
      <select
        id="tipoUsuario"
        v-model="form.tipoUsuario"
        :class="inputClass(errors.tipoUsuario)"
      >
        <option v-for="tipo in tiposUsuario" :key="tipo.value" :value="tipo.value">
          {{ tipo.label }}
        </option>
      </select>
    </div>

    <!-- Password -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        Contraseña
      </label>
      <div class="relative">
        <input
          id="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="••••••••"
          :class="[inputClass(errors.password), 'pr-10']"
          @input="errors.password = undefined"
        />
        <button
          type="button"
          tabindex="-1"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          @click="showPassword = !showPassword"
        >
          <EyeIcon v-if="!showPassword" />
          <EyeOffIcon v-else />
        </button>
      </div>
      <!-- Indicador de fortaleza -->
      <div class="mt-2 space-y-1">
        <div class="flex gap-1">
          <div
            v-for="i in 4"
            :key="i"
            :class="['h-1 flex-1 rounded-full transition-colors', strengthColor(i)]"
          />
        </div>
        <p class="text-xs text-gray-500">{{ strengthLabel }}</p>
      </div>
      <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
    </div>

    <!-- Confirmar password -->
    <div>
      <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
        Confirmar contraseña
      </label>
      <input
        id="confirmPassword"
        v-model="form.confirmPassword"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="new-password"
        placeholder="••••••••"
        :class="inputClass(errors.confirmPassword)"
        @input="errors.confirmPassword = undefined"
      />
      <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-600">
        {{ errors.confirmPassword }}
      </p>
    </div>

    <!-- Server error -->
    <div v-if="serverError" class="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
      <svg class="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm text-red-700">{{ serverError }}</p>
    </div>

    <!-- Success -->
    <div v-if="success" class="rounded-lg bg-green-50 border border-green-200 p-3 flex items-start gap-2">
      <svg class="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <p class="text-sm text-green-700">
        ¡Cuenta creada exitosamente! Redirigiendo al login...
      </p>
    </div>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="loading || success"
      class="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5
             text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
             disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>{{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRegister } from '../composables/useAuth'

const { form, errors, showPassword, success, loading, serverError, submit } = useRegister()

const tiposUsuario = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'propietario',   label: 'Propietario' },
  { value: 'inquilino',     label: 'Inquilino' },
  { value: 'vigilante',     label: 'Vigilante' },
  { value: 'celadora',      label: 'Celadora' },
  { value: 'aseadora',      label: 'Aseadora' },
  { value: 'otro',          label: 'Otro' },
]

// ─── Fortaleza de contraseña ──────────────────────────────────────────────────
const passwordStrength = computed(() => {
  const p = form.value.password
  let score = 0
  if (p.length >= 8)             score++
  if (/[A-Z]/.test(p))          score++
  if (/[0-9]/.test(p))          score++
  if (/[^A-Za-z0-9]/.test(p))  score++
  return score
})

const strengthLabel = computed(() => {
  const labels = ['', 'Débil', 'Regular', 'Buena', 'Excelente']
  return form.value.password ? labels[passwordStrength.value] : 'Ingresa una contraseña'
})

function strengthColor(index: number) {
  if (!form.value.password) return 'bg-gray-200'
  if (index > passwordStrength.value) return 'bg-gray-200'
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
  return colors[passwordStrength.value]
}

function inputClass(error?: string) {
  const base =
    'block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 ' +
    'focus:outline-none focus:ring-2 transition-colors'
  return error
    ? `${base} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`
    : `${base} border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 bg-white`
}

// ─── Inline icons ─────────────────────────────────────────────────────────────
const EyeIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
         -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>`,
}
const EyeOffIcon = {
  template: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
         a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243
         M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29
         m7.532 7.532l3.29 3.29M3 3l3.59 3.59
         m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7
         a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>`,
}
</script>
