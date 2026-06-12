<template>
  <AuthLayout>
    <div class="space-y-8">
      <!-- Encabezado -->
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Bienvenido de nuevo</h2>
        <p class="mt-1 text-sm text-gray-500">
          ¿No tienes cuenta?
          <RouterLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
            Regístrate aquí
          </RouterLink>
        </p>
      </div>

      <!-- Formulario -->
      <LoginForm />
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import LoginForm from '../components/LoginForm.vue'
</script>
