'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createEvent } from '@/app/actions/events'
import { useUser } from '@/components/user-provider'
import { useEventContext } from '@/lib/contexts/event-context'
import { toast } from 'sonner'

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useUser()
  const { setCurrentEventId, refetchEvents } = useEventContext()
  
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateEvent = async () => {
    if (!name.trim()) {
      toast.error('El nombre del campamento es requerido')
      return
    }

    if (!user?.id) {
      toast.error('No estás autenticado')
      return
    }

    try {
      setLoading(true)
      const newEvent = await createEvent(user.id, {
        name: name.trim(),
        status: 'active',
      })

      if (!newEvent?.id) {
        toast.error('Error al crear el campamento')
        return
      }

      toast.success(`Campamento "${name}" creado exitosamente`)
      
      // Actualizar la lista de eventos y seleccionar el nuevo
      await refetchEvents()
      setCurrentEventId(newEvent.id)

      router.push('/')
    } catch (error) {
      console.error('[v0] Error creating event:', error)
      toast.error('Error al crear el campamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with back button */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-border flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-base sm:text-lg font-bold text-foreground">Crear Campamento</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        
        {/* Decorative Header */}
        <div className="w-full mb-8 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-transparent p-5 sm:p-6 border border-primary/25 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-foreground text-sm sm:text-base">Nuevo Campamento</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Crea un espacio para organizar tu próximo evento
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border space-y-5">
          
          {/* Name Input */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Nombre del Campamento
            </label>
            <Input
              placeholder="Ej: Campamento Verano 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="h-11 sm:h-12 rounded-xl px-4 text-sm font-medium bg-secondary/50 border-primary/20 hover:border-primary/40 focus:border-primary transition-colors"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading && name.trim()) {
                  handleCreateEvent()
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Este nombre identificará tu campamento en toda la plataforma
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-semibold border-primary/20 hover:bg-muted transition-colors"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={loading || !name.trim()}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/80 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Creando...</span>
                </div>
              ) : (
                <span>Crear Campamento</span>
              )}
            </Button>
          </div>
        </div>

        {/* Info text */}
        <p className="text-xs text-muted-foreground mt-6 text-center max-w-xs">
          Podrás invitar miembros y gestionar toda la información del campamento después de crearlo
        </p>
      </div>
    </div>
  )
}
