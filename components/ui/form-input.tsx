import React from 'react'
import { Input, type InputProps } from './input'
import { Label } from './label'
import { cn } from '@/lib/utils'

interface FormInputProps extends InputProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <Label>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Input
          ref={ref}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive/30',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
      </div>
    )
  }
)
FormInput.displayName = 'FormInput'
