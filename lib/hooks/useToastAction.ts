'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface UseToastActionOptions {
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useToastAction(options: UseToastActionOptions = {}) {
  const {
    loadingMessage = 'Guardando...',
    successMessage = 'Guardado exitosamente',
    errorMessage = 'Error en la operación',
    onSuccess,
    onError,
  } = options

  const [isPending, setIsPending] = useState(false)

  const execute = async <T,>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    setIsPending(true)
    const loadingToast = toast.loading(loadingMessage)

    try {
      const result = await asyncFn()
      toast.dismiss(loadingToast)
      toast.success(successMessage)
      onSuccess?.()
      return result
    } catch (error) {
      toast.dismiss(loadingToast)
      const message = error instanceof Error ? error.message : errorMessage
      toast.error(message)
      onError?.(error instanceof Error ? error : new Error(String(error)))
      return null
    } finally {
      setIsPending(false)
    }
  }

  return { execute, isPending }
}
