'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/page-header'
import { createEvent } from '@/app/actions/events'
import { useUser } from '@/components/user-provider'
import { useEventContext } from '@/lib/contexts/event-context'
import { toast } from 'sonner'

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useUser()
  const { selectEvent, setEvents } = useEventContext()
  
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

      toast.success(`Campamento "${name}" creado exitosamente`)
      
      // Actualizar eventos y seleccionar el nuevo
      const events = await (await import('@/app/actions/events')).getUserEvents(user.id)
      setEvents(events || [])
      
      if (newEvent?.id) {
        selectEvent(newEvent.id)
      }

      router.push('/')
    } catch (error) {
      console.error('[v0] Error creating event:', error)
      toast.error('Error al crear el campamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader title="Crear Campamento" />
      </div>

      {/* Form */}
      <div className="clay-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Nombre del Campamento
          </label>
          <Input
            placeholder="Ej: Campamento 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="h-10 sm:h-11 rounded-lg"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleCreateEvent()
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Este nombre identificará tu campamento en toda la plataforma
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1 rounded-lg h-10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateEvent}
            disabled={loading || !name.trim()}
            className="flex-1 rounded-lg h-10"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-transparent border-t-current border-r-current rounded-full animate-spin" />
                Creando...
              </div>
            ) : (
              'Crear Campamento'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
