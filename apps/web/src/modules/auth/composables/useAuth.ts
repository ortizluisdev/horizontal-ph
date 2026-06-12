import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.store'
import type { LoginPayload, RegisterPayload } from '../types/auth.types'

// ─── Validaciones locales (espejo de backend) ─────────────────────────────────

function validateEmail(email: string): string | null {
  if (!email) return 'El email es obligatorio'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido'
  return null
}

function validatePassword(password: string): string | null {
  if (!password) return 'La contraseña es obligatoria'
  if (password.length < 8) return 'Mínimo 8 caracteres'
  if (!/[A-Z]/.test(password)) return 'Debe incluir una mayúscula'
  if (!/[a-z]/.test(password)) return 'Debe incluir una minúscula'
  if (!/[0-9]/.test(password)) return 'Debe incluir un número'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Debe incluir un carácter especial'
  return null
}

// ─── Composable de login ──────────────────────────────────────────────────────

export function useLogin() {
  const authStore = useAuthStore()
  const router = useRouter()

  const form = ref<LoginPayload>({ email: '', password: '' })
  const errors = ref<Partial<LoginPayload>>({})
  const showPassword = ref(false)

  function validate(): boolean {
    errors.value = {}
    const emailErr = validateEmail(form.value.email)
    if (emailErr) errors.value.email = emailErr
    if (!form.value.password) errors.value.password = 'La contraseña es obligatoria'
    return Object.keys(errors.value).length === 0
  }

  async function submit() {
    if (!validate()) return
    authStore.clearError()
    try {
      await authStore.login(form.value)
      router.push('/')
    } catch {
      // el error ya está en authStore.error
    }
  }

  return { form, errors, showPassword, loading: computed(() => authStore.loading), serverError: computed(() => authStore.error), submit }
}

// ─── Composable de register ───────────────────────────────────────────────────

export function useRegister() {
  const authStore = useAuthStore()
  const router = useRouter()

  const form = ref<RegisterPayload & { confirmPassword: string }>({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    tenantId: import.meta.env.VITE_DEFAULT_TENANT_ID ?? '',
    tipoUsuario: 'administrador',
  })

  const errors = ref<Record<string, string>>({})
  const showPassword = ref(false)
  const success = ref(false)

  function validate(): boolean {
    errors.value = {}
    if (!form.value.nombre || form.value.nombre.trim().length < 2)
      errors.value.nombre = 'El nombre debe tener al menos 2 caracteres'

    const emailErr = validateEmail(form.value.email)
    if (emailErr) errors.value.email = emailErr

    const passErr = validatePassword(form.value.password)
    if (passErr) errors.value.password = passErr

    if (form.value.password !== form.value.confirmPassword)
      errors.value.confirmPassword = 'Las contraseñas no coinciden'

    if (!form.value.tenantId) errors.value.tenantId = 'El conjunto es obligatorio'

    return Object.keys(errors.value).length === 0
  }

  async function submit() {
    if (!validate()) return
    authStore.clearError()
    try {
      const { confirmPassword: _, ...payload } = form.value
      await authStore.register(payload)
      success.value = true
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      // el error ya está en authStore.error
    }
  }

  return {
    form,
    errors,
    showPassword,
    success,
    loading: computed(() => authStore.loading),
    serverError: computed(() => authStore.error),
    submit,
  }
}

// ─── Composable de forgot password ───────────────────────────────────────────

export function useForgotPassword() {
  const email = ref('')
  const emailError = ref<string | null>(null)
  const loading = ref(false)
  const sent = ref(false)
  const serverError = ref<string | null>(null)

  async function submit() {
    emailError.value = validateEmail(email.value)
    if (emailError.value) return

    loading.value = true
    serverError.value = null
    try {
      // El endpoint de forgot-password no existe en el backend aún.
      // Se deja preparado para cuando se implemente.
      // await authApi.forgotPassword({ email: email.value })
      await new Promise((r) => setTimeout(r, 800)) // simulación
      sent.value = true
    } catch (e: any) {
      serverError.value = e?.response?.data?.message ?? 'Error al enviar el correo'
    } finally {
      loading.value = false
    }
  }

  return { email, emailError, loading, sent, serverError, submit }
}

// ─── Composable de reset password ────────────────────────────────────────────

export function useResetPassword() {
  const form = ref({ newPassword: '', confirmPassword: '' })
  const errors = ref<Record<string, string>>({})
  const loading = ref(false)
  const success = ref(false)
  const serverError = ref<string | null>(null)
  const router = useRouter()

  function validate(): boolean {
    errors.value = {}
    const passErr = validatePassword(form.value.newPassword)
    if (passErr) errors.value.newPassword = passErr
    if (form.value.newPassword !== form.value.confirmPassword)
      errors.value.confirmPassword = 'Las contraseñas no coinciden'
    return Object.keys(errors.value).length === 0
  }

  async function submit(token: string) {
    if (!validate()) return
    loading.value = true
    serverError.value = null
    try {
      // await authApi.resetPassword({ token, newPassword: form.value.newPassword })
      await new Promise((r) => setTimeout(r, 800)) // simulación
      success.value = true
      setTimeout(() => router.push('/login'), 2000)
    } catch (e: any) {
      serverError.value = e?.response?.data?.message ?? 'Error al restablecer la contraseña'
    } finally {
      loading.value = false
    }
  }

  return { form, errors, loading, success, serverError, submit }
}
