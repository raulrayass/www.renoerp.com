'use client'

import { useState, useTransition } from 'react'
import { useAttendees } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import { Attendee, Church, Team, Room } from '@/lib/db/schema'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MobileSheet } from '@/components/mobile'
import { Plus, DownloadCloud, Users } from 'lucide-react'
import { toast } from 'sonner'
import { AttendeesList } from '@/components/attendees/attendees-list'
import { AttendeeForm } from '@/components/attendees/attendee-form'
import { PageHeader } from '@/components/page-header'
import { SmartFilter } from '@/components/smart-filter'

interface Props {
  userId: string
  churches: Church[]
  teams: Team[]
  rooms: Room[]
}

export function AttendeesRefactored({ userId, churches, teams, rooms }: Props) {
  const router = useRouter()
  const { attendees, isLoading, isPending } = useAttendees()
  const [isPendingAction, startTransition] = useTransition()
  
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterChurch, setFilterChurch] = useState<string>('')
  const [filterTeam, setFilterTeam] = useState<string>('')

  // Filter attendees based on search and filters
  const filteredAttendees = attendees.filter(att => {
    const matchesSearch = att.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChurch = !filterChurch || att.churchId === filterChurch
    const matchesTeam = !filterTeam || att.teamId === filterTeam
    return matchesSearch && matchesChurch && matchesTeam
  })

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Edad', 'Iglesia', 'Equipo', 'Habitación', 'Teléfono']
    const rows = filteredAttendees.map(att => [
      att.name,
      att.age || '-',
      churches.find(c => c.id === att.churchId)?.name || '-',
      teams.find(t => t.id === att.teamId)?.name || '-',
      rooms.find(r => r.id === att.roomId)?.name || '-',
      att.phone || '-',
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asistentes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Archivo CSV descargado')
  }

  const stats = {
    total: attendees.length,
    checked: attendees.filter(a => a.checkedIn).length,
    byTeam: teams.map(t => ({
      name: t.name,
      count: attendees.filter(a => a.teamId === t.id).length,
    })),
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-4">
        <PageHeader 
          title="Asistentes"
          description="Gestiona todos los asistentes, pagos y registros de entrada"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Dentro</p>
            <p className="text-2xl font-bold text-green-600">{stats.checked}</p>
          </Card>
          {stats.byTeam.slice(0, 2).map(team => (
            <Card key={team.name} className="p-4">
              <p className="text-xs text-muted-foreground truncate">{team.name}</p>
              <p className="text-2xl font-bold">{team.count}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <SmartFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: 'Iglesia',
            value: filterChurch,
            onChange: setFilterChurch,
            options: [
              { value: '', label: 'Todas' },
              ...churches.map(c => ({ value: c.id, label: c.name })),
            ],
          },
          {
            label: 'Equipo',
            value: filterTeam,
            onChange: setFilterTeam,
            options: [
              { value: '', label: 'Todos' },
              ...teams.map(t => ({ value: t.id, label: t.name })),
            ],
          },
        ]}
      />

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={() => {
            setEditingId(null)
            setFormOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Asistente
        </Button>
        <Button 
          onClick={handleExportCSV}
          variant="outline"
          className="gap-2"
        >
          <DownloadCloud className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Attendees List */}
      {isLoading ? (
        <Card className="p-8 text-center animate-pulse">
          <p className="text-muted-foreground">Cargando asistentes...</p>
        </Card>
      ) : filteredAttendees.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No hay asistentes que coincidan con los filtros</p>
        </Card>
      ) : (
        <AttendeesList
          attendees={filteredAttendees}
          churches={churches}
          teams={teams}
          rooms={rooms}
          onEdit={(attendee) => {
            setEditingId(attendee.id)
            setFormOpen(true)
          }}
        />
      )}

      {/* Form Modal */}
      <MobileSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingId ? 'Editar Asistente' : 'Nuevo Asistente'}
        size="lg"
      >
        <AttendeeForm
          editingId={editingId}
          churches={churches}
          teams={teams}
          rooms={rooms}
          onSuccess={() => {
            setFormOpen(false)
            setEditingId(null)
            toast.success(editingId ? 'Asistente actualizado' : 'Asistente creado')
          }}
          onError={(error) => {
            toast.error(error)
          }}
        />
      </MobileSheet>
    </div>
  )
}
