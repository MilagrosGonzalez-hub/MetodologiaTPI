# Educar para Transformar

Sistema de gestion y sitio web institucional para el Centro Educativo "Educar para Transformar".
Stack principal: Next.js (App Router) + Tailwind v4 + Supabase.

## Requisitos

- Node.js 18+
- Variables de entorno en `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ycvrpmrogvjnntnoosbh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts utiles

```bash
npm run build
npm run lint
npm run test:e2e
```

## Deploy en Vercel (checklist)

1. Crear proyecto en Vercel e importar el repo.
2. Configurar variables de entorno:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Build command: `npm run build`.
4. Output: Next.js default.
5. Verificar rutas protegidas (`/dashboard`) y formularios publicos.
6. Ejecutar `npm run test:e2e` antes del deploy si es posible.

## Base de datos

Migraciones en `supabase/migrations/`.
Se debe ejecutar la migracion de Postulaciones si no esta aplicada.
