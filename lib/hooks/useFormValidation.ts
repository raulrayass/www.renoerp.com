import { useState, useCallback } from 'react'
import { ZodSchema, z } from 'zod'

interface ValidationError {
  [key: string]: string
}

export function useFormValidation<T>(schema: ZodSchema) {
  const [errors, setErrors] = useState<ValidationError>({})
  const [isValidating, setIsValidating] = useState(false)

  const validate = useCallback(
    async (data: unknown): Promise<{ success: boolean; data?: T; errors?: ValidationError }> => {
      setIsValidating(true)
      setErrors({})

      try {
        const validatedData = schema.parse(data)
        setIsValidating(false)
        return { success: true, data: validatedData as T }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: ValidationError = {}
          error.errors.forEach((err) => {
            const path = err.path.join('.')
            newErrors[path] = err.message
          })
          setErrors(newErrors)
          setIsValidating(false)
          return { success: false, errors: newErrors }
        }
        setIsValidating(false)
        return { success: false, errors: { general: 'Error de validación' } }
      }
    },
    [schema]
  )

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const updated = { ...prev }
      delete updated[field]
      return updated
    })
  }, [])

  return {
    errors,
    isValidating,
    validate,
    clearErrors,
    clearError,
    hasErrors: Object.keys(errors).length > 0,
  }
}
