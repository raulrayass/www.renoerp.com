'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, ChevronDown, Users } from 'lucide-react'
import { toast } from 'sonner'
import { createTeam, updateTeam, deleteTeam, getTeams, getTeamMembers, getTeamMemberCounts } from '@/app/actions/teams'
import { Team, Attendee } from '@/lib/db/schema'

interface Props {
  userId: string
}

export function TeamsClient({ userId }: Props) {
  const [teamList, setTeamList] = useState<Team[]>([])
  const [memberCounts, setMemberCounts] = useState<Record<number, number>>({})
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null)
  const [expandedMembers, setExpandedMembers] = useState<Record<number, Attendee[]>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', color: '#4a9d67' })
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  const emptyForm = { name: '', color: '#4a9d67' }

  const PRESET_COLORS = [
    { name: 'Verde', value: '#4a9d67' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Rojo', value: '#dc2626' },
    { name: 'Amarillo', value: '#eab308' },
    { name: 'Púrpura', value: '#9333ea' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Naranja', value: '#ea580c' },
    { name: 'Cian', value: '#06b6d4' },
  ]

  useState(() => {
    loadTeams()
  })

  async function loadTeams() {
    setLoading(true)
    try {
      const data = await getTeams(userId)
      const counts = await getTeamMemberCounts(userId)
      setTeamList(data)
      setMemberCounts(counts)
    } catch (error) {
      toast.error('Error al cargar equipos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleTeamMembers(teamId: number) {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null)
    } else {
      setExpandedTeamId(teamId)
      if (!expandedMembers[teamId]) {
        try {
          const members = await getTeamMembers(userId, teamId)
          setExpandedMembers({ ...expandedMembers, [teamId]: members })
        } catch (error) {
          toast.error('Error al cargar integrantes del equipo')
          console.error(error)
        }
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre del equipo es obligatorio')
      return
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateTeam(userId, editingId, form)
          toast.success('Equipo actualizado')
        } else {
          await createTeam(userId, form)
          toast.success('Equipo creado')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        await loadTeams()
      } catch (error) {
        toast.error('Error al guardar el equipo')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteTeam(userId, id)
        toast.success('Equipo eliminado')
        setDeleteDialogOpen(false)
        await loadTeams()
      } catch (error) {
        toast.error('Error al eliminar el equipo')
        console.error(error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Equipos</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Total: {teamList.length}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar equipo
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4 animate-pulse">
                <div className="h-4 w-40 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teamList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <p className="text-sm text-muted-foreground">No hay equipos registrados</p>
            <Button onClick={() => setDialogOpen(true)} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Crear primer equipo
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {teamList.map((team) => (
            <div key={team.id}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleTeamMembers(team.id)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left hover:opacity-80 transition-opacity"
                    >
                      <div
                        className="w-8 h-8 rounded-full shrink-0 border-2 border-border"
                        style={{ backgroundColor: team.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate">{team.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {memberCounts[team.id] || 0} integrante{(memberCounts[team.id] || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        onClick={() => toggleTeamMembers(team.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title={expandedTeamId === team.id ? 'Contraer' : 'Expandir'}
                      >
                        <ChevronDown
                          className="w-4 h-4 transition-transform"
                          style={{
                            transform: expandedTeamId === team.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(team.id)
                          setForm({ name: team.name, color: team.color })
                          setDialogOpen(true)
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                        title="Editar equipo"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        onClick={() => {
                          setDeletingId(team.id)
                          setDeleteDialogOpen(true)
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-100"
                        title="Eliminar equipo"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expanded Members List */}
              {expandedTeamId === team.id && expandedMembers[team.id] && (
                <div className="mt-1 ml-4 border-l-2 border-muted pl-4 space-y-1">
                  {expandedMembers[team.id]?.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">Sin integrantes</p>
                  ) : (
                    expandedMembers[team.id]?.map((member) => (
                      <div key={member.id} className="text-xs py-1">
                        <p className="font-medium text-foreground">{member.name}</p>
                        {member.phone && <p className="text-muted-foreground">{member.phone}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Team Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setForm({ ...emptyForm })
          setEditingId(null)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar equipo' : 'Agregar equipo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Grupo A, Equipo Principal, etc."
                />
            </div>
            <div>
              <Label>Color *</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setForm({ ...form, color: preset.value })}
                    className="relative flex items-center justify-center h-10 rounded-lg border-2 transition-all hover:scale-105"
                    style={{
                      backgroundColor: preset.value,
                      borderColor: form.color === preset.value ? '#000' : 'transparent',
                    }}
                    title={preset.name}
                  >
                    {form.color === preset.value && (
                      <span className="text-white font-bold text-lg">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="#4a9d67"
                  className="text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {editingId ? 'Guardar cambios' : 'Crear equipo'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el equipo pero los camperos asignados a este equipo no serán eliminados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={isPending}
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
