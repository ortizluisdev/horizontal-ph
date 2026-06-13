<template>
  <div class="space-y-5">
    <!-- Tipo de usuario -->
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-2">Tipo de usuario *</label>
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
        <button
          v-for="t in TIPOS_USUARIO" :key="t.value" type="button"
          :class="['rounded-lg border-2 px-2 py-2.5 text-center transition-all', form.tipo_usuario === t.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300']"
          @click="form.tipo_usuario = t.value; errors.tipo_usuario = undefined">
          <span class="text-lg block">{{ t.icon }}</span>
          <p :class="['text-xs font-medium mt-0.5 leading-tight', form.tipo_usuario === t.value ? 'text-indigo-700' : 'text-gray-600']">{{ t.label }}</p>
        </button>
      </div>
      <p v-if="errors.tipo_usuario" class="mt-1 text-xs text-red-600">{{ errors.tipo_usuario }}</p>
    </div>

    <!-- Nombre -->
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
      <input v-model="form.nombre" type="text" placeholder="Ej: María García López"
        :class="fieldClass(errors.nombre)"
        @input="errors.nombre = undefined" />
      <p v-if="errors.nombre" class="mt-1 text-xs text-red-600">{{ errors.nombre }}</p>
    </div>

    <!-- Email -->
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-1">Correo electrónico *</label>
      <input v-model="form.email" type="email" placeholder="correo@ejemplo.com"
        :class="fieldClass(errors.email)"
        @input="errors.email = undefined" />
      <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
    </div>

    <!-- Contraseña (solo crear) -->
    <div v-if="modo === 'crear'">
      <label class="block text-xs font-medium text-gray-600 mb-1">Contraseña *</label>
      <div class="relative">
        <input v-model="form.password"
          :type="showPass ? 'text' : 'password'"
          placeholder="Mínimo 8 caracteres"
          :class="fieldClass(errors.password)"
          @input="errors.password = undefined" />
        <button type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          @click="showPass = !showPass">
          {{ showPass ? '🙈' : '👁️' }}
        </button>
      </div>
      <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
    </div>

    <!-- Teléfono -->
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
      <input v-model="form.telefono" type="tel" placeholder="Ej: 3001234567" :class="fieldClass()" />
    </div>

    <!-- Estado -->
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-2">Estado *</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="e in ESTADOS_USUARIO.filter(e => e.value)" :key="e.value" type="button"
          :class="['rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all',
                   form.estado === e.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300']"
          @click="form.estado = e.value as any">
          {{ e.label }}
        </button>
      </div>
    </div>

    <!-- Error servidor -->
    <div v-if="serverError" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
      {{ serverError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { TIPOS_USUARIO, ESTADOS_USUARIO } from '../composables/useUsuarios'
import type { UsuarioCreatePayload } from '../types/usuarios.types'
import type { Ref } from 'vue'

defineProps<{
  form: UsuarioCreatePayload
  errors: Record<string, string | undefined>
  showPass: boolean
  saving: boolean
  serverError: string | null
  modo: 'crear' | 'editar'
}>()

defineEmits<{ (e: 'update:showPass', v: boolean): void }>()

function fieldClass(error?: string) {
  const base = 'block w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors bg-white'
  return error
    ? `${base} border-red-300 focus:border-red-500 focus:ring-red-200`
    : `${base} border-gray-300 focus:border-indigo-400 focus:ring-indigo-200`
}
</script>