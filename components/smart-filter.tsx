'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface SmartFilterProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  churchFilter: string
  onChurchChange: (value: string) => void
  churches: Array<{ id: number; name: string }>
  teamFilter?: string
  onTeamChange?: (value: string) => void
  teams?: Array<{ id: number; name: string }>
  roomFilter?: string
  onRoomChange?: (value: string) => void
  rooms?: Array<{ id: number; name: string }>
  onClearFilters: () => void
}

export function SmartFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  churchFilter,
  onChurchChange,
  churches,
  teamFilter,
  onTeamChange,
  teams = [],
  roomFilter,
  onRoomChange,
  rooms = [],
  onClearFilters,
}: SmartFilterProps) {
  const activeFiltersCount = [
    search ? 1 : 0,
    statusFilter !== 'all' ? 1 : 0,
    churchFilter ? 1 : 0,
    teamFilter ? 1 : 0,
    roomFilter ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-1 bg-background border border-border rounded-lg p-2 sm:p-2.5">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar..."
          className="pl-7 h-6 text-xs"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Quick filters - Row 1: Status */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-0.5">
        {/* Status quick filters */}
        <Button
          variant={statusFilter === 'paid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(statusFilter === 'paid' ? 'all' : 'paid')}
          className="h-6 text-xs py-0 px-1"
        >
          Pagado
        </Button>
        <Button
          variant={statusFilter === 'partial' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(statusFilter === 'partial' ? 'all' : 'partial')}
          className="h-6 text-xs py-0 px-1"
        >
          Parcial
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(statusFilter === 'pending' ? 'all' : 'pending')}
          className="h-6 text-xs py-0 px-1"
        >
          Pendiente
        </Button>
      </div>

      {/* Quick filters - Row 2: Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5">
        {/* Church filter */}
        <Select value={churchFilter} onValueChange={onChurchChange}>
          <SelectTrigger className="text-xs h-6 py-0 px-1">
            <SelectValue placeholder="Iglesia">
              {churchFilter 
                ? churches.find(c => c.id.toString() === churchFilter)?.name || 'Iglesia'
                : 'Iglesia'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las iglesias</SelectItem>
            {churches.map((church) => (
              <SelectItem key={church.id} value={church.id.toString()}>
                {church.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Team filter */}
        {teams.length > 0 && onTeamChange && (
          <Select value={teamFilter || ''} onValueChange={onTeamChange}>
            <SelectTrigger className="text-xs h-6 py-0 px-1">
              <SelectValue placeholder="Equipo">
                {teamFilter 
                  ? teams.find(t => t.id.toString() === teamFilter)?.name || 'Equipo'
                  : 'Equipo'
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los equipos</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Room filter */}
        {rooms.length > 0 && onRoomChange && (
          <Select value={roomFilter || ''} onValueChange={onRoomChange}>
            <SelectTrigger className="text-xs h-6 py-0 px-1">
              <SelectValue placeholder="Habitación">
                {roomFilter 
                  ? rooms.find(r => r.id.toString() === roomFilter)?.name || 'Habitación'
                  : 'Habitación'
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las habitaciones</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id.toString()}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active filters indicator */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 text-xs"
          >
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  )
}
