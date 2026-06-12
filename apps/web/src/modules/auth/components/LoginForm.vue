<template>
  <form @submit.prevent="submit" novalidate class="space-y-5">
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

    <!-- Password -->
    <div>
      <div class="flex items-center justify-between mb-1">
        <label for="password" class="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <RouterLink
          to="/forgot-password"
          class="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
        >
          ¿Olvidaste tu contraseña?
        </RouterLink>
      </div>
      <div class="relative">
        <input
          id="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
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
          <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                 -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                 a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243
                 M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29
                 m7.532 7.532l3.29 3.29M3 3l3.59 3.59
                 m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7
                 a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>
      <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
    </div>

    <!-- Server error -->
    <div v-if="serverError" class="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
      <svg class="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm text-red-700">{{ serverError }}</p>
    </div>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="loading"
      class="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5
             text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
             disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>{{ loading ? 'Ingresando...' : 'Iniciar sesión' }}</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useLogin } from '../composables/useAuth'

const { form, errors, showPassword, loading, serverError, submit } = useLogin()

function inputClass(error?: string) {
  const base =
    'block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 ' +
    'focus:outline-none focus:ring-2 transition-colors'
  return error
    ? `${base} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`
    : `${base} border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 bg-white`
}
</script>
