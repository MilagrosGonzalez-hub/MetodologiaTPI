'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ChatCenteredText, Trash } from '@phosphor-icons/react'
import { obtenerOpiniones, eliminarOpinion } from '@/services/noticias.service'
import { formatFecha } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'

type Opinion = {
  id: number
  nombre_usuario: string
  comentario: string
  fecha: string
}

export default function TestimoniosPage() {
  const { rol } = useAuth()
  const [opiniones, setOpiniones] = useState<Opinion[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await obtenerOpiniones()
      setOpiniones((data ?? []) as Opinion[])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar testimonios'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (rol && rol !== 'DIRECTOR') return
    cargar()
  }, [rol])

  const eliminar = async (id: number) => {
    setDeletingId(id)
    try {
      await eliminarOpinion(id)
      setOpiniones((prev) => prev.filter((o) => o.id !== id))
      toast.success('Testimonio eliminado')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar'
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {rol && rol !== 'DIRECTOR' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-sm text-yellow-800">
          Acceso restringido. Solo directores pueden moderar testimonios.
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Testimonios</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Moderacion de opiniones publicadas</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Tabla de testimonios">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                {['Autor', 'Comentario', 'Fecha', 'Acciones'].map((col) => (
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
                : opiniones.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-16 text-center">
                        <ChatCenteredText size={40} className="text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-400 text-sm">No hay testimonios registrados</p>
                      </td>
                    </tr>
                  )
                  : opiniones.map((op) => (
                    <tr key={op.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3 text-neutral-800 font-medium">{op.nombre_usuario}</td>
                      <td className="px-5 py-3 text-neutral-600">{op.comentario}</td>
                      <td className="px-5 py-3 text-xs text-neutral-400">{formatFecha(op.fecha)}</td>
                      <td className="px-5 py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          loading={deletingId === op.id}
                          onClick={() => eliminar(op.id)}
                        >
                          <Trash size={14} />
                          Eliminar
                        </Button>
                      </td>
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
