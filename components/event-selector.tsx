'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEvents } from '@/lib/hooks'
import { useEventContext } from '@/lib/contexts/event-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EventSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { events, isLoading } = useEvents()
  const { currentEventId } = useEventContext()

  const selectedEvent = events.find((e) => e.id === currentEventId)

  const handleEventChange = (eventId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('eventId', eventId)
    router.push(`?${params.toString()}`)
  }

  const handleCreateEvent = () => {
    router.push('/events/new')
  }

  if (isLoading) {
    return (
      <div className="px-3 py-2 space-y-2">
        <div className="h-4 bg-sidebar-accent/20 rounded animate-pulse" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="px-3 py-3 flex flex-col gap-2">
        <p className="text-xs text-sidebar-foreground/60 font-semibold">Sin eventos</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateEvent}
          className="w-full justify-start gap-2 h-8"
        >
          <Plus className="w-4 h-4" />
          <span>Crear evento</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="px-3 py-3 border-b border-sidebar-border">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-sidebar-foreground/60" />
        <label className="text-xs font-semibold text-sidebar-foreground/60">EVENTO</label>
      </div>

      <div className="flex gap-1">
        <Select value={currentEventId?.toString() || ''} onValueChange={handleEventChange}>
          <SelectTrigger className="h-8 text-xs bg-sidebar-accent/40 border-sidebar-border">
            <SelectValue placeholder="Selecciona un evento" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{event.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.startDate).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={handleCreateEvent}
          className="h-8 w-8 shrink-0"
          title="Crear nuevo evento"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {selectedEvent && (
        <p className="text-xs text-sidebar-foreground/60 mt-2 truncate">
          {new Date(selectedEvent.startDate).toLocaleDateString('es-ES', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          -{' '}
          {new Date(selectedEvent.endDate).toLocaleDateString('es-ES', {
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}
    </div>
  )
}
