/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase'

export async function obtenerActividadesConCupos() {
  const supabase = createClient()
  const { data: actividades, error } = await supabase
    .from('actividades')
    .select(`*, nivel:niveles(nombre)`)
    .order('nombre') as any

  if (error) throw new Error(error.message)

  const actividadesConConteo = await Promise.all(
    (actividades ?? []).map(async (act: any) => {
      const { count } = await supabase
        .from('inscripciones')
        .select('*', { count: 'exact', head: true })
        .eq('actividad_id', act.id)
        .eq('estado', 'ACTIVO') as any

      return {
        ...act,
        inscriptos: count ?? 0,
        cupo_disponible: act.cupo_maximo - (count ?? 0),
        porcentaje_ocupacion: Math.round(((count ?? 0) / act.cupo_maximo) * 100),
      }
    })
  )
  return actividadesConConteo
}

export async function inscribirAlumno(estudianteId: string, actividadId: number) {
  const supabase = createClient()
  const { error } = await (supabase
    .from('inscripciones')
    .insert({ estudiante_id: estudianteId, actividad_id: actividadId, estado: 'ACTIVO' } as any) as any)
  if (error) {
    throw new Error(error.message.includes('Cupo máximo')
      ? 'El cupo para esta actividad está completo.'
      : error.message
    )
  }
  return true
}

export async function darBajaInscripcion(inscripcionId: string) {
  const supabase = createClient()
  const { error } = await (supabase as any)
    .from('inscripciones')
    .update({ estado: 'BAJA' })
    .eq('id', inscripcionId)
  if (error) throw new Error(error.message)
  return true
}

export async function obtenerInscripcionesDeAlumno(estudianteId: string) {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('inscripciones')
    .select(`*, actividad:actividades(nombre, tipo, cupo_maximo)`)
    .eq('estudiante_id', estudianteId)
    .eq('estado', 'ACTIVO') as any)
  if (error) throw new Error(error.message)
  return data
}
