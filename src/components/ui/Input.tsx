'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-neutral-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 px-3 rounded-lg border bg-white text-neutral-900',
            'text-sm placeholder:text-neutral-400',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
            error
              ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
              : 'border-neutral-200 hover:border-neutral-300',
            props.disabled && 'bg-neutral-50 cursor-not-allowed opacity-60',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-neutral-500">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-neutral-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 px-3 rounded-lg border bg-white text-neutral-900',
            'text-sm appearance-none',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
            error
              ? 'border-red-400 focus:ring-red-500/20'
              : 'border-neutral-200 hover:border-neutral-300',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-600" role="alert">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-neutral-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'px-3 py-2.5 rounded-lg border bg-white text-neutral-900',
            'text-sm placeholder:text-neutral-400 resize-none',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
            error ? 'border-red-400' : 'border-neutral-200 hover:border-neutral-300',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
