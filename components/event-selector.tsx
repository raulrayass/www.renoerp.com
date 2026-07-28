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
  const { currentEventId, events, isLoading, setCurrentEventId } = useEventContext()
  const router = useRouter()
  
  const currentEvent = events.find(e => e.id === currentEventId)

  if (isLoading || !currentEvent || events.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Trigger Button - Clean Card Style */}
        <Button
          variant="ghost"
          className="flex items-center justify-between gap-2.5 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 hover:to-transparent transition-all duration-300 border border-primary/20 h-10 sm:h-11 shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            </div>
            <span className="hidden xs:inline truncate text-xs sm:text-sm font-semibold text-foreground">
              {currentEvent.name}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown Menu */}
      <DropdownMenuContent align="start" className="w-60 mt-3 rounded-2xl shadow-lg">
        {/* Header */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal px-4 py-3 bg-primary/5 rounded-t-xl border-b border-primary/10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Tus Campamentos</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        {/* Events List */}
        <div className="max-h-72 overflow-y-auto">
          {events.map((event) => (
            <DropdownMenuItem
              key={event.id}
              onClick={() => setCurrentEventId(event.id)}
              className={`gap-3 cursor-pointer py-3 px-4 transition-all duration-200 rounded-none ${
                currentEvent?.id === event.id
                  ? 'bg-primary/15 text-primary'
                  : 'hover:bg-secondary/50'
              }`}
            >
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${currentEvent?.id === event.id ? 'bg-primary' : 'bg-muted'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{event.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ✓ {event.role}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        {/* Divider */}
        <DropdownMenuSeparator className="my-2" />

        {/* Create Button */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push('/events/create')}
            className="gap-3 cursor-pointer py-3 px-4 transition-all duration-200 hover:bg-orange-50 group rounded-b-xl"
          >
            <div className="w-5 h-5 rounded-lg bg-[--action]/20 flex items-center justify-center group-hover:bg-[--action]/30 transition-colors flex-shrink-0">
              <Plus className="w-3 h-3 text-[--action]" />
            </div>
            <span className="text-sm font-semibold text-[--action] group-hover:text-[--action]">Crear Campamento</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
