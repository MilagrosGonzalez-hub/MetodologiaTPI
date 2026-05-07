/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase'

export async function obtenerRoles() {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('roles')
    .select('*')
    .order('nombre') as any)
  if (error) throw new Error(error.message)
  return data
}
