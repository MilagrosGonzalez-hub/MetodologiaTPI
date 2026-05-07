# Educar para Transformar — Documentacion Completa del Proyecto

Documento tecnico para uso con IAs al hacer cambios.
Ultima actualizacion: mayo 2026. Estado: produccion / desarrollo activo.

---

## 1. Resumen del Proyecto

Sistema de gestion y sitio web institucional para el Centro Educativo "Educar para Transformar"
(Resistencia, Chaco, Argentina), con inicio de clases en marzo 2027.

Arquitectura de 3 capas:
- Presentacion: Next.js 16 (App Router) + Tailwind CSS v4
- Logica de negocio: Servicios TypeScript + Zod
- Persistencia: Supabase (PostgreSQL) con RLS

Equipo: LAMA - UTN-FRRE

---

## 2. Stack Tecnologico

| Tecnologia            | Version  | Uso                                |
|-----------------------|----------|------------------------------------|
| Next.js               | 16.2.5   | Framework principal (App Router)   |
| React                 | 19.2.4   | UI                                 |
| TypeScript            | ^5       | Tipado estatico                    |
| Tailwind CSS          | ^4       | Estilos (@tailwindcss/postcss)     |
| Supabase JS           | ^2.105   | Cliente de base de datos           |
| @supabase/ssr         | ^0.10    | Auth SSR + cookies                 |
| Zod                   | ^4.4     | Validacion de formularios          |
| react-hook-form       | ^7.75    | Manejo de formularios              |
| @hookform/resolvers   | ^5.2     | Integracion Zod + react-hook-form  |
| date-fns              | ^4.1     | Formateo de fechas (locale es)     |
| framer-motion         | ^12.38   | Animaciones                        |
| @phosphor-icons/react | ^2.1     | Iconografia                        |
| sonner                | ^2.0     | Notificaciones toast               |

IMPORTANTE - Tailwind v4:
- NO usar tailwind.config.js. La config va en globals.css con @theme {}
- NO agregar tailwindcss como plugin en postcss.config.js, usar @tailwindcss/postcss

IMPORTANTE - Phosphor Icons:
- En Server Components importar desde @phosphor-icons/react/dist/ssr
- En Client Components desde @phosphor-icons/react
- El icono Activity NO existe, usar Pulse
- El icono Fork NO existe, usar ForkKnife

---

## 3. Estructura de Carpetas

```
educar-para-transformar/
src/
  app/
    (public)/                    <- Route group publico (con Navbar + Footer)
      layout.tsx                 <- Wrapper con Navbar y Footer
      page.tsx                   <- Home /
      quienes-somos/page.tsx
      niveles/page.tsx
      bienestar/page.tsx
      noticias/
        page.tsx                 <- Server Component (fetch Supabase)
        NoticiasClient.tsx       <- 'use client' con buscador
        [id]/page.tsx            <- Detalle de noticia
      galeria/
        page.tsx                 <- Server Component
        GaleriaClient.tsx        <- 'use client' con filtros + lightbox
      contacto/page.tsx          <- 'use client' con formulario -> Supabase
      empleo/page.tsx            <- 'use client' con formulario de postulacion
      inscripcion/page.tsx       <- Multi-step form -> Supabase
    dashboard/                   <- Protegido por middleware (requiere auth)
      layout.tsx                 <- Sidebar con roles
      page.tsx                   <- Dashboard home con quick links
      asistencias/page.tsx
      cupos/page.tsx
      legajos/page.tsx
      solicitudes/page.tsx
    login/
      page.tsx                   <- Server Component (split-screen layout)
      LoginForm.tsx              <- 'use client' con Supabase auth
    layout.tsx                   <- Root layout (AuthProvider + Sonner)
    globals.css                  <- Design system completo
  components/
    layout/
      Navbar.tsx                 <- 'use client', glassmorphism, mobile menu
      Footer.tsx                 <- Links + info institucional
    ui/
      Button.tsx                 <- Variantes: primary, outline, accent, ghost
      Input.tsx                  <- Input + Select + Textarea con error states
      Badge.tsx                  <- Badge + Skeleton components
  context/
    AuthContext.tsx               <- 'use client', AuthProvider, useAuth hook
  lib/
    utils.ts                     <- cn(), formatFecha(), calcularPorcentajeLocal()
    validations.ts               <- Schemas Zod (inscripcion, login, opinion, perfil)
  services/
    supabase.ts                  <- createClient() browser
    supabase.server.ts           <- createServerSupabaseClient() con cookies
    asistencias.service.ts
    actividades.service.ts
    perfiles.service.ts
    noticias.service.ts          <- Tambien: galeria, menu, opiniones
    inscripciones.service.ts
  types/
    database.types.ts            <- Tipos manuales del schema SQL
  middleware.ts                  <- Protege /dashboard/*, redirige /login si auth
supabase/
  migrations/
    001_initial_schema.sql       <- Migracion completa (ya ejecutada en Supabase)
.env.local                       <- Variables de entorno (NO commitear)
package.json
```

---

## 4. Variables de Entorno

Archivo: .env.local (en la raiz del proyecto)

```
NEXT_PUBLIC_SUPABASE_URL=https://ycvrpmrogvjnntnoosbh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_del_dashboard_de_supabase>
```

Proyecto Supabase ref: ycvrpmrogvjnntnoosbh

---

## 5. Comandos

```bash
npm run dev          # Inicia servidor en http://localhost:3000
npx tsc --noEmit     # Verifica tipos TypeScript (debe dar 0 errores)
npm run build        # Build de produccion
```

Si el dev server falla con errores ENOENT, simplemente ejecutar npm run dev de nuevo.
El cache .next se regenera automaticamente.

---

## 6. Base de Datos - Schema Completo

### Tablas

#### roles
- id: SERIAL PRIMARY KEY
- nombre: VARCHAR(50) UNIQUE  -- Valores: DIRECTOR, DOCENTE, PADRE, ESTUDIANTE, PERSONAL

#### perfiles (Legajos)
- id: UUID PRIMARY KEY (uuid_generate_v4())
- user_id: UUID UNIQUE -- FK a auth.users de Supabase Auth
- rol_id: INTEGER -- FK a roles.id
- nombre: VARCHAR(100) NOT NULL
- apellido: VARCHAR(100) NOT NULL
- dni: VARCHAR(20) UNIQUE NOT NULL
- direccion: TEXT
- telefono: VARCHAR(20)
- legajo_nro: VARCHAR(50) UNIQUE
- fecha_nacimiento: DATE
- fecha_creacion: TIMESTAMPTZ DEFAULT NOW()

#### niveles
- id: SERIAL PRIMARY KEY
- nombre: VARCHAR(50)  -- INICIAL, PRIMARIO, SECUNDARIO

#### actividades
- id: SERIAL PRIMARY KEY
- nombre: VARCHAR(100)
- tipo: VARCHAR(50)  -- CURRICULAR, DEPORTE, TALLER
- cupo_maximo: INTEGER DEFAULT 30
- nivel_id: INTEGER  -- FK a niveles.id

Seed data: Futbol, Natacion, Atletismo, Artes Marciales, Voley, Danza, Basquet, Ajedrez,
Lab. Ciencias, Ingles Avanzado

#### inscripciones
- id: UUID PRIMARY KEY
- estudiante_id: UUID  -- FK a perfiles.id
- actividad_id: INTEGER  -- FK a actividades.id
- fecha_inscripcion: TIMESTAMPTZ DEFAULT NOW()
- estado: VARCHAR(20)  -- ACTIVO, BAJA
- UNIQUE(estudiante_id, actividad_id)

IMPORTANTE: Tiene un TRIGGER llamado trigger_verificar_cupo que lanza una excepcion
si el cupo de la actividad esta lleno. El servicio captura este error y lo relanza
con el mensaje "El cupo para esta actividad esta completo."

#### asistencias
- id: UUID PRIMARY KEY
- estudiante_id: UUID  -- FK a perfiles.id
- fecha: DATE DEFAULT CURRENT_DATE
- estado: VARCHAR(20)  -- PRESENTE, AUSENTE, JUSTIFICADO
- docente_id: UUID  -- FK a perfiles.id (quien registra)
- UNIQUE(estudiante_id, fecha)

#### solicitudes_inscripcion (Formulario web publico)
- id: UUID PRIMARY KEY
- datos_aspirante: JSONB NOT NULL  -- Todos los campos del formulario multi-step
- estado: VARCHAR(20)  -- PENDIENTE, REVISADO, ACEPTADO
- fecha_solicitud: TIMESTAMPTZ DEFAULT NOW()

INSERT es publico (anonimo). Solo directores pueden SELECT/UPDATE.

#### noticias
- id: SERIAL PRIMARY KEY
- titulo: VARCHAR(200)
- contenido: TEXT
- imagen_url: TEXT
- fecha_publicacion: TIMESTAMPTZ DEFAULT NOW()

Seed data: 3 noticias de ejemplo sobre el centro educativo.

#### galeria
- id: SERIAL PRIMARY KEY
- url: TEXT
- descripcion: VARCHAR(255)
- categoria: VARCHAR(50)  -- INSTALACIONES, EVENTOS

Seed data: 6 imagenes de ejemplo (3 INSTALACIONES, 3 EVENTOS).

#### menu_escolar
- id: SERIAL PRIMARY KEY
- dia_semana: VARCHAR(20)
- descripcion: TEXT
- fecha_vigencia: DATE

#### opiniones
- id: SERIAL PRIMARY KEY
- nombre_usuario: VARCHAR(100) DEFAULT 'Anonimo'
- comentario: TEXT
- fecha: TIMESTAMPTZ DEFAULT NOW()

INSERT y SELECT son publicos (sin auth). Usado en el formulario de Contacto.

### Funciones SQL

calcular_porcentaje_asistencia(p_estudiante_id UUID) RETURNS NUMERIC
  Calcula el porcentaje de asistencia de un alumno.
  Llamar con: supabase.rpc('calcular_porcentaje_asistencia', { p_estudiante_id: 'uuid' })

### Politicas RLS

| Tabla                    | Operacion        | Quienes pueden                       |
|--------------------------|------------------|--------------------------------------|
| perfiles                 | SELECT           | El propio usuario O directores/doc.  |
| perfiles                 | INSERT           | Solo directores                      |
| asistencias              | ALL              | Directores y docentes                |
| asistencias              | SELECT           | El propio estudiante/padre           |
| solicitudes_inscripcion  | INSERT           | Publico (anon)                       |
| solicitudes_inscripcion  | SELECT/UPDATE    | Solo directores                      |
| noticias, galeria, menu  | SELECT           | Publico                              |
| opiniones                | SELECT + INSERT  | Publico                              |

---

## 7. Servicios - API de Funciones

Todos los servicios usan /* eslint-disable @typescript-eslint/no-explicit-any */ porque
el cliente Supabase no tiene el tipo generico inyectado. Todos hacen cast (supabase as any).

### asistencias.service.ts
- registrarAsistencia(datos: { estudiante_id, fecha?, estado, docente_id? })
- actualizarAsistencia(id, estado: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO')
- obtenerAsistenciasPorAlumno(estudianteId)
- obtenerTodasAsistencias(fecha?) -- join con perfiles del estudiante y docente
- calcularPorcentajeAsistencia(estudianteId): Promise<number>  -- via RPC

### actividades.service.ts
- obtenerActividadesConCupos()  -- retorna actividades + inscriptos actuales + % ocupacion
- inscribirAlumno(estudianteId, actividadId)
  PUEDE LANZAR: 'El cupo para esta actividad esta completo.'
- darBajaInscripcion(inscripcionId)
- obtenerInscripcionesDeAlumno(estudianteId)

### perfiles.service.ts
- obtenerPerfiles(rolId?)          -- con join a roles
- obtenerPerfilPorId(id)
- obtenerPerfilPorUserId(userId)   -- usado por AuthContext
- crearPerfil(perfil)
- actualizarPerfil(id, updates)
- buscarPerfiles(query)            -- OR: nombre, apellido, dni, legajo_nro ILIKE

### noticias.service.ts
- obtenerNoticias(limit = 10)
- obtenerNoticiaPorId(id)
- crearNoticia({ titulo, contenido, imagen_url? })
- actualizarNoticia(id, updates)
- eliminarNoticia(id)
- obtenerGaleria(categoria?)       -- filtra: 'INSTALACIONES' | 'EVENTOS'
- obtenerMenuSemana()
- crearOpinion(nombre, comentario)
- obtenerOpiniones()

### inscripciones.service.ts
- crearSolicitudInscripcion(datosAspirante)
- obtenerSolicitudes(estado?)
- actualizarEstadoSolicitud(id, estado: 'PENDIENTE' | 'REVISADO' | 'ACEPTADO')

---

## 8. Autenticacion

Flujo:
1. /login -> LoginForm.tsx llama supabase.auth.signInWithPassword()
2. Exito -> redirect a /dashboard (o al parametro redirect de la URL)
3. middleware.ts protege /dashboard/*: sin sesion -> redirect a /login?redirect=...
4. AuthContext.tsx carga el perfil de la tabla perfiles (join con roles)
5. Hook useAuth() expone:
   - user, session, perfil, rol (string)
   - isDirector, isDocente, isPadre, isEstudiante (booleans)
   - isLoading, signOut()

Para crear usuarios manualmente:
1. Ir a Supabase Dashboard -> Authentication -> Users -> Invite user
2. Copiar el UUID del usuario creado
3. Insertar en tabla perfiles con user_id = ese UUID

Roles del sidebar del dashboard:
- DIRECTOR  -> ve: Inicio, Legajos, Asistencias, Cupos, Solicitudes
- DOCENTE   -> ve: Inicio, Legajos, Asistencias, Cupos
- PADRE     -> ve: Inicio, Asistencias
- ESTUDIANTE -> ve: Inicio, Asistencias

---

## 9. Design System

### Paleta de Colores (OKLCH - Tailwind v4 en globals.css)

Azul Institucional (brand-*):
- brand-50:  oklch(0.97 0.018 250)
- brand-100: oklch(0.93 0.035 250)
- brand-300: oklch(0.73 0.095 250)
- brand-500: oklch(0.48 0.140 250)  <- Color principal
- brand-700: oklch(0.32 0.120 250)
- brand-900: oklch(0.18 0.075 250)  <- Fondo heroes oscuros

Dorado para CTAs (accent-*):
- accent-400: oklch(0.80 0.120 85)
- accent-500: oklch(0.72 0.140 85)  <- Boton "Inscribirse"
- accent-600: oklch(0.62 0.140 85)

Neutros tintados (neutral-*):
- neutral-50:  oklch(0.985 0.006 250)
- neutral-200: oklch(0.90 0.012 250)
- neutral-600: oklch(0.45 0.018 250)
- neutral-900: oklch(0.15 0.006 250)

### Tipografia
- Principal: Outfit (Google Fonts, cargada via <link> en src/app/layout.tsx)
- Mono: Geist Mono
- Clases Tailwind: font-display, font-body, font-mono

### Easing (Emil Kowalski - en globals.css)
- --ease-out:    cubic-bezier(0.23, 1, 0.32, 1)
- --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)
- --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)
- --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)

### Componentes UI disponibles

Button (src/components/ui/Button.tsx):
  variant: 'primary' | 'outline' | 'accent' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  Props adicionales: loading (boolean), fullWidth (boolean)

Input (src/components/ui/Input.tsx):
  Props: label (string), error (string | undefined), type, placeholder
  Soporta {...register('campo')} de react-hook-form

Badge (src/components/ui/Badge.tsx):
  variant: 'default' | 'success' | 'warning' | 'info' | 'danger'
  dot: boolean (muestra punto pulsante)

Skeleton (src/components/ui/Badge.tsx):
  className para controlar tamano

Clase especial CSS:
  className="glass"
  Equivale a: backdrop-blur(12px) + fondo blanco 75% + borde blanco/20
  Usada en el Navbar al hacer scroll y en elementos glassmorphism

---

## 10. Rutas Disponibles

### Paginas Publicas (tienen Navbar + Footer via route group (public))

| Ruta            | Archivo                                    | Tipo          | Datos Supabase |
|-----------------|--------------------------------------------|---------------|----------------|
| /               | (public)/page.tsx                          | Server        | No             |
| /quienes-somos  | (public)/quienes-somos/page.tsx            | Server        | No             |
| /niveles        | (public)/niveles/page.tsx                  | Server        | No             |
| /bienestar      | (public)/bienestar/page.tsx                | Server        | No             |
| /noticias       | (public)/noticias/page.tsx + Client        | Server->Client| Si (noticias)  |
| /noticias/[id]  | (public)/noticias/[id]/page.tsx            | Server        | Si             |
| /galeria        | (public)/galeria/page.tsx + GaleriaClient  | Server->Client| Si (galeria)   |
| /contacto       | (public)/contacto/page.tsx                 | Client        | Si (opiniones) |
| /empleo         | (public)/empleo/page.tsx                   | Client        | No (pendiente) |
| /inscripcion    | (public)/inscripcion/page.tsx              | Client        | Si (solicitudes)|
| /login          | login/page.tsx + LoginForm.tsx             | Server+Client | Auth           |

### Dashboard (protegido - requiere auth)

| Ruta                     | Roles permitidos              |
|--------------------------|-------------------------------|
| /dashboard               | Todos los roles               |
| /dashboard/asistencias   | Todos                         |
| /dashboard/cupos         | DIRECTOR, DOCENTE             |
| /dashboard/legajos       | DIRECTOR, DOCENTE             |
| /dashboard/solicitudes   | DIRECTOR                      |

---

## 11. Patrones y Convenciones

### Server vs Client Components

Server Component (sin 'use client'):
- Puede hacer fetch directo a Supabase con createServerSupabaseClient()
- Puede exportar metadata (export const metadata)
- NO puede usar useState, useEffect, useAuth, ni ninguna API del browser

Client Component ('use client' al tope del archivo):
- Puede usar hooks React (useState, useEffect, etc.)
- Puede usar useAuth()
- Para formularios y logica interactiva

### Patron Server -> Client (usado en Noticias y Galeria)

// page.tsx (Server Component)
export default async function Page() {
  let datos = []
  try {
    datos = await obtenerDatos() ?? []
  } catch {
    datos = []
  }
  return <ClientComponent datos={datos} />
}

// ClientComponent.tsx (Client Component)
'use client'
export function ClientComponent({ datos }) { /* logica interactiva */ }

### Importar Supabase correctamente

// En Client Components:
import { createClient } from '@/services/supabase'
const supabase = createClient()

// En Server Components o Route Handlers:
import { createServerSupabaseClient } from '@/services/supabase.server'
const supabase = await createServerSupabaseClient()

### Manejo de errores en servicios

const { data, error } = await (supabase as any).from('tabla')...
if (error) throw new Error(error.message)
return data

### Formularios (patron estandar)

const { register, handleSubmit, watch, formState: { errors, isSubmitting } } =
  useForm<TipoForm>({ resolver: zodResolver(esquemaZod), mode: 'onTouched' })

// Mostrar errores en inputs:
error={errors.campo?.message}

### Notificaciones

import { toast } from 'sonner'
toast.success('Mensaje de exito')
toast.error('Mensaje de error')

---

## 12. Validaciones Zod Disponibles (src/lib/validations.ts)

inscripcionSchema - Formulario multi-step publico:
  Step 1: nombre, apellido, dni, fecha_nacimiento, nivel (INICIAL|PRIMARIO|SECUNDARIO)
  Step 2: email, telefono, direccion
  Step 3: nombre_responsable, apellido_responsable, dni_responsable, telefono_responsable,
          relacion_responsable (PADRE|MADRE|TUTOR), actividades_interes (array optional),
          informacion_adicional (optional), acepta_terminos (debe ser true literal)

loginSchema: email, password (min 6 chars)

opinionSchema: nombre_usuario (optional), comentario (10-500 chars)

perfilSchema: nombre, apellido, dni, fecha_nacimiento?, telefono?, direccion?,
              legajo_nro?, rol_id (number)

---

## 13. Problemas Conocidos y Limitaciones

1. EMPLEO SIN BASE DE DATOS:
   El formulario en /empleo simula el submit con setTimeout.
   Falta crear tabla postulaciones en Supabase y conectar el servicio.

2. MIDDLEWARE DEPRECADO:
   Next.js 16 muestra advertencia: "The middleware file convention is deprecated."
   Para migrar, renombrar middleware.ts a proxy.ts. Por ahora no afecta el funcionamiento.

3. TIPOS MANUALES:
   src/types/database.types.ts tiene tipos manuales que pueden estar desincronizados.
   Los servicios usan (supabase as any) como workaround para evitar errores de TS.

4. SIN UI PARA GESTION DE USUARIOS:
   No hay pantalla para crear usuarios internos (docentes, directivos) desde el dashboard.
   Se deben crear manualmente: Supabase Auth -> Invite user + INSERT en tabla perfiles.

---

## 14. Cosas que NO Hacer

- NO importar Activity de @phosphor-icons/react -- no existe, usar Pulse
- NO importar Fork de @phosphor-icons/react -- no existe, usar ForkKnife
- NO usar h-screen -- usar min-h-[100dvh] para evitar bugs en iOS Safari
- NO agregar @import url(...) en globals.css despues de @import "tailwindcss" -- rompe el build
  Las fuentes (Outfit) van en <link> en src/app/layout.tsx
- NO usar el cliente browser (createClient()) en Server Components
- NO usar errorMap en Zod v4 -- usar message directamente
- NO usar Inter como fuente -- el proyecto usa Outfit
- NO usar purple/neon gradients -- el design system usa azul cobalto (brand-*) y dorado (accent-*)
- NO spammear z-50 arbitrariamente -- usar z-index solo para Navbar, Modals, Overlays

---

## 15. Como Hacer Cambios Comunes

### Agregar una nueva pagina publica
1. Crear src/app/(public)/nueva-ruta/page.tsx
2. Agregar link en src/components/layout/Navbar.tsx en el array navLinks
3. Agregar link en src/components/layout/Footer.tsx

### Agregar una nueva tabla en Supabase
1. Ejecutar CREATE TABLE en Supabase SQL Editor
2. Actualizar src/types/database.types.ts con el nuevo tipo
3. Crear src/services/nueva-tabla.service.ts

### Agregar campo al formulario de inscripcion
1. Editar inscripcionSchema en src/lib/validations.ts
2. Agregar el <Input> en el step correspondiente de inscripcion/page.tsx
3. El campo se guarda automaticamente en datos_aspirante (JSONB)

### Modificar roles del sidebar del dashboard
1. Editar el array navItems en src/app/dashboard/layout.tsx
2. Cada item tiene roles: string[] que define quienes lo ven

### Cambiar colores del design system
1. Editar src/app/globals.css en el bloque @theme { }
2. Los colores brand-* y accent-* son los que se usan en todo el proyecto

### Agregar un nuevo rol
1. INSERT INTO roles (nombre) VALUES ('NUEVO_ROL') en Supabase
2. Agregar el tipo en AuthContext.tsx (linea type RolNombre)
3. Agregar las politicas RLS correspondientes en Supabase

---

## 16. Proximos Pasos Sugeridos

- Conectar formulario de Empleo a Supabase (crear tabla postulaciones)
- Crear UI para gestion de usuarios desde el Dashboard (crear/editar perfiles)
- Implementar detalle de solicitud con generacion automatica de legajo
- Agregar paginacion en /noticias y /legajos
- Implementar menu semanal dinamico en /bienestar
- Agregar seccion Opiniones/Testimonios en la home usando tabla opiniones
- Configurar envio de email al aceptar solicitudes (Supabase Edge Functions + Resend)
- Migrar middleware.ts a proxy.ts (Next.js 16 deprecation)
- Agregar tests E2E con Playwright
- Deploy en Vercel con variables de entorno

---

## 17. Datos del Proyecto

- Supabase Project Ref: ycvrpmrogvjnntnoosbh
- Supabase URL: https://ycvrpmrogvjnntnoosbh.supabase.co
- WhatsApp institucional: +54 362 4000000
- Email: info@educarparatransformar.edu.ar
- Instagram: @educarparatransformar
- Facebook: /educarparatransformar
- Inicio de clases: Marzo 2027
- Localidad: Resistencia, Chaco, Argentina
