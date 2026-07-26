'use client'

import { useEventContext } from '@/lib/contexts/event-context'
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function EventSelector() {
  const { currentEvent, events, selectEvent, isLoading } = useEventContext()
  const router = useRouter()

  if (isLoading || !currentEvent || events.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-all duration-200 group h-9"
        >
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span className="hidden sm:inline truncate text-sm font-medium text-foreground max-w-[140px]">
            {currentEvent.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 mt-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal px-2 py-2 bg-muted/30 rounded-t-lg">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Campamentos</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <div className="max-h-64 overflow-y-auto">
          {events.map((event) => (
            <DropdownMenuItem
              key={event.id}
              onClick={() => selectEvent(event.id)}
              className={`gap-2.5 cursor-pointer py-2.5 px-3 transition-all duration-200 ${
                currentEvent.id === event.id
                  ? 'bg-primary/10 text-primary focus:bg-primary/10 focus:text-primary'
                  : 'hover:bg-muted/50'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{event.name}</p>
                <p className="text-xs text-muted-foreground">
                  {event.status === 'active' ? 'Activo' : 'Inactivo'}
                </p>
              </div>
              {currentEvent.id === event.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push('/events/create')}
            className="gap-2.5 cursor-pointer py-2.5 px-3 transition-all duration-200 hover:bg-primary/5 text-primary focus:text-primary focus:bg-primary/5 group"
          >
            <div className="w-4 h-4 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
              <Plus className="w-3 h-3" />
            </div>
            <span className="text-sm font-medium">Crear campamento</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
