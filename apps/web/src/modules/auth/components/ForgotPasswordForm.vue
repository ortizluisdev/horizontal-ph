<template>
  <form @submit.prevent="submit" novalidate class="space-y-5">
    <template v-if="!sent">
      <p class="text-sm text-gray-600">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="correo@ejemplo.com"
          :class="inputClass(emailError)"
          @input="emailError = null"
        />
        <p v-if="emailError" class="mt-1 text-xs text-red-600">{{ emailError }}</p>
      </div>

      <div v-if="serverError" class="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
        <svg class="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-red-700">{{ serverError }}</p>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5
               text-sm font-semibold text-white shadow-sm hover:bg-indigo-500
               disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>{{ loading ? 'Enviando...' : 'Enviar enlace' }}</span>
      </button>
    </template>

    <!-- Estado enviado -->
    <div v-else class="text-center space-y-4">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <svg class="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-900">¡Correo enviado!</p>
        <p class="mt-1 text-sm text-gray-500">
          Revisa tu bandeja de entrada en <strong>{{ email }}</strong> y sigue las instrucciones.
        </p>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForgotPassword } from '../composables/useAuth'

const { email, emailError, loading, sent, serverError, submit } = useForgotPassword()

function inputClass(error: string | null) {
  const base =
    'block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 ' +
    'focus:outline-none focus:ring-2 transition-colors'
  return error
    ? `${base} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`
    : `${base} border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 bg-white`
}
</script>
