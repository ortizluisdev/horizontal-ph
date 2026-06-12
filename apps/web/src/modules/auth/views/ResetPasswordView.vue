<template>
  <AuthLayout>
    <div class="space-y-8">
      <!-- Encabezado -->
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Nueva contraseña</h2>
        <p class="mt-1 text-sm text-gray-500">Ingresa tu nueva contraseña para restablecer el acceso.</p>
      </div>

      <!-- Token inválido -->
      <div v-if="!token" class="rounded-lg bg-red-50 border border-red-200 p-4 text-center space-y-2">
        <svg class="mx-auto h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium text-red-700">Enlace inválido o expirado</p>
        <RouterLink to="/forgot-password" class="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
          Solicitar nuevo enlace
        </RouterLink>
      </div>

      <!-- Formulario -->
      <form v-else @submit.prevent="() => submit(token!)" novalidate class="space-y-5">
        <!-- Nueva contraseña -->
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
            Nueva contraseña
          </label>
          <input
            id="newPassword"
            v-model="form.newPassword"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
            :class="inputClass(errors.newPassword)"
            @input="errors.newPassword = undefined"
          />
          <p v-if="errors.newPassword" class="mt-1 text-xs text-red-600">{{ errors.newPassword }}</p>
        </div>

        <!-- Confirmar contraseña -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
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
            ¡Contraseña restablecida! Redirigiendo al login...
          </p>
        </div>

        <button
          type="submit"
          :disabled="loading || success"
          class="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5
                 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500
                 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{{ loading ? 'Restableciendo...' : 'Restablecer contraseña' }}</span>
        </button>
      </form>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import { useResetPassword } from '../composables/useAuth'

const route = useRoute()
const token = computed(() => route.query.token as string | undefined)

const { form, errors, loading, success, serverError, submit } = useResetPassword()

function inputClass(error?: string) {
  const base =
    'block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 ' +
    'focus:outline-none focus:ring-2 transition-colors'
  return error
    ? `${base} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`
    : `${base} border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 bg-white`
}
</script>
