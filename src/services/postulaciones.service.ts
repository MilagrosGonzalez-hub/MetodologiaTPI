/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase'

export type PostulacionInput = {
  nombre: string
  apellido: string
  email: string
  telefono: string
  puesto: string
  mensaje: string
}

export async function crearPostulacion(postulacion: PostulacionInput) {
  const supabase = createClient()
  const { error } = await (supabase
    .from('postulaciones')
    .insert(postulacion as any) as any)
  if (error) throw new Error(error.message)
  return true
}

export async function obtenerPostulaciones() {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('postulaciones')
    .select('*')
    .order('fecha_postulacion', { ascending: false }) as any)
  if (error) throw new Error(error.message)
  return data
}
