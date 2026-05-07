'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Briefcase } from '@phosphor-icons/react'
import { obtenerPostulaciones } from '@/services/postulaciones.service'
import { formatFecha } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'

type Postulacion = {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  puesto: string
  mensaje: string
  estado: string
  fecha_postulacion: string
}

export default function PostulacionesPage() {
  const { rol } = useAuth()
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (rol && rol !== 'DIRECTOR') return
    const cargar = async () => {
      setLoading(true)
      try {
        const data = await obtenerPostulaciones()
        setPostulaciones((data ?? []) as Postulacion[])
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al cargar postulaciones'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [rol])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {rol && rol !== 'DIRECTOR' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-sm text-yellow-800">
          Acceso restringido. Solo directores pueden ver postulaciones.
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Postulaciones</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Solicitudes recibidas desde el formulario de empleo</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Tabla de postulaciones">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                {['Postulante', 'Puesto', 'Contacto', 'Fecha'].map((col) => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <td key={j} className="px-5 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : postulaciones.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-16 text-center">
                        <Briefcase size={40} className="text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-400 text-sm">No hay postulaciones registradas</p>
                      </td>
                    </tr>
                  )
                  : postulaciones.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-neutral-900">{p.apellido}, {p.nombre}</div>
                        <div className="text-xs text-neutral-500 mt-1 line-clamp-2">{p.mensaje}</div>
                      </td>
                      <td className="px-5 py-3 text-neutral-600">{p.puesto}</td>
                      <td className="px-5 py-3 text-neutral-600">
                        <div className="text-xs">{p.email}</div>
                        <div className="text-xs">{p.telefono}</div>
                      </td>
                      <td className="px-5 py-3 text-xs text-neutral-400">{formatFecha(p.fecha_postulacion)}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
