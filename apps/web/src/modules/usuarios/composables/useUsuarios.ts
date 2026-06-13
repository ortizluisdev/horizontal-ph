import { ref, computed } from 'vue'
import { useUsuariosStore } from '../store/usuarios.store'
import type {
  TipoUsuario, EstadoUsuario,
  UsuarioCreatePayload,
} from '../types/usuarios.types'

export const TIPOS_USUARIO: { value: TipoUsuario; label: string; icon: string }[] = [
  { value: 'super_admin',    label: 'Super Admin',         icon: '👑' },
  { value: 'admin_conjunto', label: 'Admin de conjunto',   icon: '🏢' },
  { value: 'propietario',    label: 'Propietario',         icon: '🏠' },
  { value: 'residente',      label: 'Residente',           icon: '👤' },
  { value: 'empleado',       label: 'Empleado',            icon: '🔧' },
  { value: 'contador',       label: 'Contador',            icon: '📒' },
  { value: 'vigilante',      label: 'Vigilante',           icon: '🛡️' },
]

export const ESTADOS_USUARIO: { value: EstadoUsuario | ''; label: string }[] = [
  { value: '',           label: 'Todos los estados' },
  { value: 'activo',     label: 'Activo'            },
  { value: 'inactivo',   label: 'Inactivo'          },
  { value: 'suspendido', label: 'Suspendido'        },
  { value: 'pendiente',  label: 'Pendiente'         },
]

export function estadoBadgeClass(estado: EstadoUsuario): string {
  const map: Record<EstadoUsuario, string> = {
    activo:     'bg-green-100  text-green-800  ring-green-200',
    inactivo:   'bg-gray-100   text-gray-600   ring-gray-200',
    suspendido: 'bg-red-100    text-red-700    ring-red-200',
    pendiente:  'bg-yellow-100 text-yellow-800 ring-yellow-200',
  }
  return map[estado] ?? 'bg-gray-100 text-gray-600 ring-gray-200'
}

export function estadoDotClass(estado: EstadoUsuario): string {
  const map: Record<EstadoUsuario, string> = {
    activo:     'bg-green-500',
    inactivo:   'bg-gray-400',
    suspendido: 'bg-red-500',
    pendiente:  'bg-yellow-500',
  }
  return map[estado] ?? 'bg-gray-400'
}

export function tipoLabel(tipo: TipoUsuario): string {
  return TIPOS_USUARIO.find(t => t.value === tipo)?.label ?? tipo
}

export function tipoIcon(tipo: TipoUsuario): string {
  return TIPOS_USUARIO.find(t => t.value === tipo)?.icon ?? '👤'
}

export function formatDate(dt: string): string {
  if (!dt) return '-'
  return new Date(dt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function formatDateShort(dt: string): string {
  if (!dt) return '-'
  return new Date(dt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatRelativo(dt: string): string {
  if (!dt) return '-'
  const diff = Date.now() - new Date(dt).getTime()
  const min  = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)
  if (min  <  1) return 'Ahora mismo'
  if (min  < 60) return `Hace ${min} min`
  if (hrs  < 24) return `Hace ${hrs} h`
  if (dias <  7) return `Hace ${dias} día(s)`
  return formatDateShort(dt)
}

export function initialsFromName(nombre: string): string {
  return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export function avatarBgClass(tipo: TipoUsuario): string {
  const map: Record<TipoUsuario, string> = {
    super_admin:    'bg-purple-600',
    admin_conjunto: 'bg-indigo-600',
    propietario:    'bg-blue-600',
    residente:      'bg-teal-600',
    empleado:       'bg-orange-500',
    contador:       'bg-green-600',
    vigilante:      'bg-gray-600',
  }
  return map[tipo] ?? 'bg-gray-500'
}

export function useUsuariosForm(modo: 'crear' | 'editar' = 'crear') {
  const store = useUsuariosStore()

  const form = ref<UsuarioCreatePayload>({
    nombre: '', email: '', password: '', telefono: '',
    tipo_usuario: 'residente', estado: 'activo',
    conjunto_id: '', unidad_id: '',
  })

  const errors   = ref<Record<string, string>>({})
  const showPass = ref(false)

  function validate(): boolean {
    errors.value = {}
    if (!form.value.nombre.trim() || form.value.nombre.length < 3)
      errors.value.nombre = 'El nombre debe tener al menos 3 caracteres'
    if (!form.value.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))
      errors.value.email = 'Ingresa un correo electrónico válido'
    if (modo === 'crear' && (!form.value.password || form.value.password.length < 8))
      errors.value.password = 'La contraseña debe tener al menos 8 caracteres'
    if (!form.value.tipo_usuario)
      errors.value.tipo_usuario = 'El tipo de usuario es obligatorio'
    return Object.keys(errors.value).length === 0
  }

  async function submit(): Promise<Usuario | null> {
    if (!validate()) return null
    try {
      const payload = { ...form.value }
      if (!payload.telefono)   delete payload.telefono
      if (!payload.conjunto_id) delete payload.conjunto_id
      if (!payload.unidad_id)  delete payload.unidad_id
      return await store.create(payload)
    } catch { return null }
  }

  async function submitUpdate(id: string): Promise<boolean> {
    if (!validate()) return false
    try {
      await store.update(id, {
        nombre:       form.value.nombre,
        email:        form.value.email,
        telefono:     form.value.telefono || undefined,
        tipo_usuario: form.value.tipo_usuario,
        estado:       form.value.estado,
        conjunto_id:  form.value.conjunto_id || undefined,
        unidad_id:    form.value.unidad_id   || undefined,
      })
      return true
    } catch { return false }
  }

  function loadFromUsuario(u: any) {
    form.value = {
      nombre:       u.nombre        ?? '',
      email:        u.email         ?? '',
      password:     '',
      telefono:     u.telefono      ?? '',
      tipo_usuario: u.tipo_usuario  ?? 'residente',
      estado:       u.estado        ?? 'activo',
      conjunto_id:  u.conjunto_id   ?? '',
      unidad_id:    u.unidad_id     ?? '',
    }
  }

  function reset() {
    form.value = {
      nombre: '', email: '', password: '', telefono: '',
      tipo_usuario: 'residente', estado: 'activo',
      conjunto_id: '', unidad_id: '',
    }
    errors.value = {}
    store.clearError()
  }

  return {
    form, errors, showPass,
    saving:      computed(() => store.saving),
    serverError: computed(() => store.error),
    submit, submitUpdate, loadFromUsuario, reset, validate,
  }
}

// Re-exportar tipo para usarlo en los componentes
import type { Usuario } from '../types/usuarios.types'
export type { Usuario }