<template>
  <footer class="text-center text-xs text-gray-400 py-3 border-t border-gray-100">
    © {{ year }} Horizontal PH — Todos los derechos reservados
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>