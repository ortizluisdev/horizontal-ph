<template>
  <AuthLayout>
    <div class="space-y-8">
      <!-- Encabezado -->
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Crear cuenta</h2>
        <p class="mt-1 text-sm text-gray-500">
          ¿Ya tienes cuenta?
          <RouterLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Inicia sesión
          </RouterLink>
        </p>
      </div>

      <!-- Formulario -->
      <RegisterForm />
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import RegisterForm from '../components/RegisterForm.vue'
</script>
