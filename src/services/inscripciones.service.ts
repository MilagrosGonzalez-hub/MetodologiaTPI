/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase'

export async function crearSolicitudInscripcion(datosAspirante: Record<string, unknown>) {
  const supabase = createClient()
  const { error } = await (supabase
    .from('solicitudes_inscripcion')
    .insert({ datos_aspirante: datosAspirante, estado: 'PENDIENTE' } as any) as any)
  if (error) throw new Error(error.message)
  return true
}

export async function obtenerSolicitudes(estado?: string) {
  const supabase = createClient()
  let query: any = supabase
    .from('solicitudes_inscripcion')
    .select('*')
    .order('fecha_solicitud', { ascending: false })
  if (estado) query = query.eq('estado', estado)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function actualizarEstadoSolicitud(
  id: string,
  estado: 'PENDIENTE' | 'REVISADO' | 'ACEPTADO'
) {
  const supabase = createClient()
  const { error } = await (supabase
    .from('solicitudes_inscripcion')
    .update({ estado } as any)
    .eq('id', id) as any)
  if (error) throw new Error(error.message)
  return true
}

async function obtenerRolEstudianteId(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await (supabase
    .from('roles')
    .select('id')
    .eq('nombre', 'ESTUDIANTE')
    .limit(1) as any)
  if (error) throw new Error(error.message)
  const rolId = data?.[0]?.id as number | undefined
  if (!rolId) throw new Error('No existe el rol ESTUDIANTE')
  return rolId
}

async function generarLegajoNumero(supabase: ReturnType<typeof createClient>) {
  const year = new Date().getFullYear()
  const prefix = `${year}-`
  const { data, error } = await (supabase
    .from('perfiles')
    .select('legajo_nro')
    .ilike('legajo_nro', `${prefix}%`)
    .order('legajo_nro', { ascending: false })
    .limit(1) as any)
  if (error) throw new Error(error.message)

  const lastLegajo = data?.[0]?.legajo_nro as string | undefined
  const lastNumber = lastLegajo?.split('-')[1]
  const next = lastNumber ? parseInt(lastNumber, 10) + 1 : 1
  const padded = String(next).padStart(4, '0')
  return `${prefix}${padded}`
}

export async function aceptarSolicitud(
  id: string,
  datosAspirante: Record<string, unknown>
) {
  const supabase = createClient()
  const nombre = String(datosAspirante.nombre ?? '').trim()
  const apellido = String(datosAspirante.apellido ?? '').trim()
  const dni = String(datosAspirante.dni ?? '').trim()
  const fecha_nacimiento = (datosAspirante.fecha_nacimiento as string | undefined) || null
  const telefono = (datosAspirante.telefono as string | undefined) || null
  const direccion = (datosAspirante.direccion as string | undefined) || null

  if (!nombre || !apellido || !dni) {
    throw new Error('Datos incompletos para crear el legajo')
  }

  const { data: existing, error: existingError } = await (supabase
    .from('perfiles')
    .select('id')
    .eq('dni', dni)
    .limit(1) as any)
  if (existingError) throw new Error(existingError.message)
  if (existing?.length) {
    await actualizarEstadoSolicitud(id, 'ACEPTADO')
    return
  }

  const rolId = await obtenerRolEstudianteId(supabase)

  let legajo = await generarLegajoNumero(supabase)
  let created = false
  let attempts = 0

  while (!created && attempts < 3) {
    attempts += 1
    const { error } = await (supabase
      .from('perfiles')
      .insert({
        nombre,
        apellido,
        dni,
        fecha_nacimiento,
        telefono,
        direccion,
        rol_id: rolId,
        legajo_nro: legajo,
      } as any) as any)
    if (!error) {
      created = true
      break
    }
    if (!String(error.message).includes('legajo_nro')) {
      throw new Error(error.message)
    }
    legajo = await generarLegajoNumero(supabase)
  }

  if (!created) {
    throw new Error('No se pudo generar un legajo único')
  }

  await actualizarEstadoSolicitud(id, 'ACEPTADO')
}
