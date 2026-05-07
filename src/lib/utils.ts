import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function calcularPorcentajeLocal(
  asistencias: { estado: string }[]
): number {
  if (asistencias.length === 0) return 0
  const presentes = asistencias.filter(
    (a) => a.estado === 'PRESENTE' || a.estado === 'JUSTIFICADO'
  ).length
  return Math.round((presentes / asistencias.length) * 100 * 100) / 100
}

export function formatFecha(fecha: string, pattern = 'dd/MM/yyyy'): string {
  try {
    return format(parseISO(fecha), pattern, { locale: es })
  } catch {
    return fecha
  }
}

export function formatFechaRelativa(fecha: string): string {
  try {
    return formatDistanceToNow(parseISO(fecha), { addSuffix: true, locale: es })
  } catch {
    return fecha
  }
}

export function formatPorcentaje(valor: number): string {
  return `${valor.toFixed(1)}%`
}

export function getAsistenciaColor(porcentaje: number): string {
  if (porcentaje >= 85) return 'text-green-600'
  if (porcentaje >= 75) return 'text-yellow-600'
  return 'text-red-600'
}

export function getAsistenciaBgColor(porcentaje: number): string {
  if (porcentaje >= 85) return 'bg-green-50 border-green-200'
  if (porcentaje >= 75) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

export function getCupoColor(porcentajeOcupacion: number): string {
  if (porcentajeOcupacion < 70) return 'bg-green-500'
  if (porcentajeOcupacion < 90) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const NIVELES = ['INICIAL', 'PRIMARIO', 'SECUNDARIO'] as const
export const ESTADOS_ASISTENCIA = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO'] as const
export const TIPOS_ACTIVIDAD = ['CURRICULAR', 'DEPORTE', 'TALLER'] as const
export const ROLES = ['DIRECTOR', 'DOCENTE', 'PADRE', 'ESTUDIANTE', 'PERSONAL'] as const

export const ACTIVIDADES_DEPORTIVAS = [
  'Fútbol', 'Natación', 'Atletismo', 'Artes Marciales',
  'Vóley', 'Danza', 'Básquet', 'Ajedrez'
] as const
