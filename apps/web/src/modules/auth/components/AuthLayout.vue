<template>
  <!-- Layout de autenticación: panel izquierdo branding + panel derecho formulario -->
  <div class="min-h-screen flex">
    <!-- Panel izquierdo: branding -->
    <div class="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-indigo-700 relative overflow-hidden flex-col justify-between p-12">
      <!-- Fondo decorativo -->
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-800 via-indigo-700 to-violet-800" />
      <div class="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div class="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />

      <!-- Logo + tagline -->
      <div class="relative z-10">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5
                   M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span class="text-xl font-bold text-white tracking-tight">Horizontal PH</span>
        </div>
      </div>

      <!-- Texto central -->
      <div class="relative z-10 space-y-6">
        <h1 class="text-4xl font-bold text-white leading-tight">
          Gestiona tu<br />
          <span class="text-indigo-200">propiedad horizontal</span><br />
          de forma inteligente
        </h1>
        <p class="text-indigo-200 text-lg leading-relaxed max-w-md">
          Cobranza, asambleas, PQRS, contabilidad y más — todo en una sola plataforma.
        </p>

        <!-- Feature pills -->
        <div class="flex flex-wrap gap-2 pt-2">
          <span
            v-for="feat in features"
            :key="feat"
            class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100"
          >
            {{ feat }}
          </span>
        </div>
      </div>

      <!-- Footer branding -->
      <div class="relative z-10">
        <p class="text-indigo-300 text-sm">
          © {{ new Date().getFullYear() }} Horizontal PH · Todos los derechos reservados
        </p>
      </div>
    </div>

    <!-- Panel derecho: slot del formulario -->
    <div class="flex flex-1 flex-col justify-center items-center px-6 py-12 lg:px-12 bg-gray-50">
      <!-- Logo mobile -->
      <div class="lg:hidden mb-8 flex items-center gap-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
          <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
          </svg>
        </div>
        <span class="text-lg font-bold text-gray-900">Horizontal PH</span>
      </div>

      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const features = ['Cobranza', 'Asambleas', 'PQRS', 'Contabilidad', 'Normativa', 'Notificaciones']
</script>
