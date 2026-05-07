'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/services/supabase'
import { loginSchema, LoginFormData } from '@/lib/validations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  const onSubmit = async ({ email, password }: LoginFormData) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(
        error.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : error.message
      )
      return
    }
    toast.success('Bienvenido al sistema')
    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input
        label="Email institucional"
        type="email"
        required
        placeholder="usuario@institucion.edu.ar"
        autoComplete="email"
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        label="Contraseña"
        type="password"
        required
        placeholder="••••••••"
        autoComplete="current-password"
        {...register('password')}
        error={errors.password?.message}
      />
      <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
        Ingresar al sistema
      </Button>
    </form>
  )
}
