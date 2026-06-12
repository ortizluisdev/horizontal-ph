<template>
  <AuthLayout>
    <div class="space-y-8">
      <!-- Encabezado -->
      <div>
        <RouterLink
          to="/login"
          class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 group"
        >
          <svg class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al login
        </RouterLink>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">¿Olvidaste tu contraseña?</h2>
      </div>

      <!-- Formulario -->
      <ForgotPasswordForm />
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import ForgotPasswordForm from '../components/ForgotPasswordForm.vue'
</script>
