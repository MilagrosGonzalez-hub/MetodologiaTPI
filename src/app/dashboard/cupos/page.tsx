'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Pulse, UserPlus, Warning } from '@phosphor-icons/react'
import { obtenerActividadesConCupos, inscribirAlumno } from '@/services/actividades.service'
import { obtenerRoles } from '@/services/roles.service'
import { obtenerPerfiles } from '@/services/perfiles.service'
import { getCupoColor, cn } from '@/lib/utils'
import { Badge, Skeleton } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'

type ActividadConCupo = {
  id: number
  nombre: string
  tipo: string | null
  cupo_maximo: number
  inscriptos: number
  cupo_disponible: number
  porcentaje_ocupacion: number
  nivel: { nombre: string } | null
}

type Estudiante = { id: string; nombre: string; apellido: string; legajo_nro: string | null }
type Rol = { id: number; nombre: string }

const tipoBadge: Record<string, 'info' | 'success' | 'warning'> = {
  DEPORTE: 'success',
  CURRICULAR: 'info',
  TALLER: 'warning',
}

export default function CuposPage() {
  const { rol } = useAuth()
  const [actividades, setActividades] = useState<ActividadConCupo[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS')
  const [inscribiendoId, setInscribiendoId] = useState<number | null>(null)
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [selectedEstudiante, setSelectedEstudiante] = useState<string>('')

  const cargarActividades = async () => {
    setLoading(true)
    try {
      const data = await obtenerActividadesConCupos()
      setActividades(data as ActividadConCupo[])
    } catch {
      toast.error('Error al cargar actividades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarActividades() }, [])

  useEffect(() => {
    if (rol !== 'DIRECTOR' && rol !== 'DOCENTE') return
    const cargarEstudiantes = async () => {
      try {
        const rolesData = await obtenerRoles()
        const rolEstudiante = (rolesData as Rol[]).find((r) => r.nombre === 'ESTUDIANTE')
        if (!rolEstudiante) return
        const data = await obtenerPerfiles(rolEstudiante.id)
        setEstudiantes((data ?? []) as Estudiante[])
      } catch {
        setEstudiantes([])
      }
    }
    cargarEstudiantes()
  }, [rol])

  const filtradas = actividades.filter(
    (a) => filtroTipo === 'TODOS' || a.tipo === filtroTipo
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
            Gestión de Cupos
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            Disponibilidad en tiempo real por actividad
          </p>
        </div>
        <Button variant="secondary" onClick={cargarActividades} size="sm">
          Actualizar
        </Button>
      </div>

      {(rol === 'DIRECTOR' || rol === 'DOCENTE') && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <Select
            label="Alumno"
            placeholder="Seleccionar alumno"
            options={estudiantes.map((e) => ({
              value: e.id,
              label: `${e.apellido}, ${e.nombre} ${e.legajo_nro ? `(${e.legajo_nro})` : ''}`.trim(),
            }))}
            value={selectedEstudiante}
            onChange={(e) => setSelectedEstudiante(e.target.value)}
          />
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['TODOS', 'DEPORTE', 'CURRICULAR', 'TALLER'].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150',
              filtroTipo === tipo
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-neutral-600 border-neutral-300 hover:border-brand-400 hover:text-brand-600'
            )}
          >
            {tipo === 'TODOS' ? 'Todas' : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))
          : filtradas.length === 0
            ? (
              <div className="col-span-full py-16 text-center">
                <Pulse size={40} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-400 text-sm">No hay actividades para este filtro</p>
              </div>
            )
            : filtradas.map((act) => {
                const lleno = act.cupo_disponible <= 0
                const colorBar = getCupoColor(act.porcentaje_ocupacion)
                const urgente = act.porcentaje_ocupacion >= 90 && !lleno

                return (
                  <div
                    key={act.id}
                    className={cn(
                      'bg-white rounded-2xl border p-5 space-y-4 transition-all duration-200',
                      lleno
                        ? 'border-red-200 bg-red-50/30'
                        : urgente
                          ? 'border-yellow-200'
                          : 'border-neutral-200 hover:border-brand-300 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-neutral-900 text-sm">{act.nombre}</h3>
                        {act.nivel && (
                          <p className="text-xs text-neutral-400 mt-0.5">{act.nivel.nombre}</p>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {act.tipo && (
                          <Badge variant={tipoBadge[act.tipo] ?? 'default'}>
                            {act.tipo}
                          </Badge>
                        )}
                        {lleno && <Badge variant="danger">Completo</Badge>}
                        {urgente && <Badge variant="warning"><Warning size={12} />Casi lleno</Badge>}
                      </div>
                    </div>

                    {/* Barra de cupo */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-neutral-500 font-medium">
                          {act.inscriptos} / {act.cupo_maximo} inscriptos
                        </span>
                        <span className={cn(
                          'text-xs font-bold font-mono',
                          lleno ? 'text-red-600' : urgente ? 'text-yellow-600' : 'text-green-600'
                        )}>
                          {act.cupo_disponible > 0 ? `${act.cupo_disponible} disponibles` : 'Sin cupo'}
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-700', colorBar)}
                          style={{ width: `${Math.min(act.porcentaje_ocupacion, 100)}%` }}
                          role="progressbar"
                          aria-valuenow={act.porcentaje_ocupacion}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${act.porcentaje_ocupacion}% de cupo utilizado`}
                        />
                      </div>
                    </div>

                    <Button
                      variant={lleno ? 'secondary' : 'outline'}
                      size="sm"
                      fullWidth
                      disabled={
                        lleno ||
                        inscribiendoId === act.id ||
                        (rol !== 'DIRECTOR' && rol !== 'DOCENTE') ||
                        !selectedEstudiante
                      }
                      loading={inscribiendoId === act.id}
                      onClick={async () => {
                        if (!selectedEstudiante) {
                          toast.error('Seleccioná un alumno')
                          return
                        }
                        setInscribiendoId(act.id)
                        try {
                          await inscribirAlumno(selectedEstudiante, act.id)
                          toast.success('Alumno inscripto')
                          await cargarActividades()
                        } catch (error) {
                          const message = error instanceof Error ? error.message : 'No se pudo inscribir'
                          toast.error(message)
                        } finally {
                          setInscribiendoId(null)
                        }
                      }}
                    >
                      <UserPlus size={14} />
                      {lleno ? 'Cupo agotado' : 'Inscribir alumno'}
                    </Button>
                  </div>
                )
              })
        }
      </div>
    </div>
  )
}
