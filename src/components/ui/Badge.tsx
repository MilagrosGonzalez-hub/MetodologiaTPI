'use client'

import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-700',
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-brand-50 text-brand-700 border border-brand-200',
  outline: 'border border-neutral-300 text-neutral-600',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-green-500',
            variant === 'warning' && 'bg-yellow-500',
            variant === 'danger' && 'bg-red-500',
            variant === 'info' && 'bg-brand-500',
            variant === 'default' && 'bg-neutral-400',
          )}
        />
      )}
      {children}
    </span>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-md shimmer', className)}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border border-neutral-200 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  )
}
