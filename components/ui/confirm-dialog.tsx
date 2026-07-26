import React from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  actionText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  actionText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={isDestructive ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isLoading ? 'Procesando...' : actionText}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook para usar confirmación
export function useConfirmDialog() {
  const [open, setOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>>({
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const confirm = React.useCallback((newConfig: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) => {
    setConfig(newConfig)
    setOpen(true)
  }, [])

  return {
    open,
    setOpen,
    config,
    confirm,
  }
}
