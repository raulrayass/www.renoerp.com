'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, ChevronDown, Users } from 'lucide-react'
import { toast } from 'sonner'
import { createTeam, updateTeam, deleteTeam, getTeams, getTeamMembers } from '@/app/actions/teams'
import { Team, Attendee } from '@/lib/db/schema'

interface Props {
  userId: string
}

export function TeamsClient({ userId }: Props) {
  const [teamList, setTeamList] = useState<Team[]>([])
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

  useEffect(() => {
    loadTeams()
  }, [])

  async function loadTeams() {
    const data = await getTeams(userId)
    setTeamList(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateTeam(editingId, form.name, form.color)
          toast.success('Equipo actualizado')
        } else {
          await createTeam(userId, form.name, form.color)
          toast.success('Equipo creado')
        }
        await loadTeams()
        setDialogOpen(false)
        setForm(emptyForm)
        setEditingId(null)
      } catch (error) {
        toast.error('Error al guardar equipo')
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteTeam(id)
        toast.success('Equipo eliminado')
        await loadTeams()
        setDeleteDialogOpen(false)
        setDeletingId(null)
      } catch (error) {
        toast.error('Error al eliminar equipo')
      }
    })
  }

  async function toggleExpanded(teamId: number) {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null)
    } else {
      setExpandedTeamId(teamId)
      if (!expandedMembers[teamId]) {
        const members = await getTeamMembers(teamId)
        setExpandedMembers({ ...expandedMembers, [teamId]: members })
      }
    }
  }

  function handleEdit(team: Team) {
    setEditingId(team.id)
    setForm({ name: team.name, color: team.color || '#4a9d67' })
    setDialogOpen(true)
  }

  function handleDeleteClick(team: Team) {
    setDeletingId(team.id)
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando equipos...</div>
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Equipos</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Total: {teamList.length} equipos
          </p>
        </div>
        <Button onClick={() => {
          setEditingId(null)
          setForm(emptyForm)
          setDialogOpen(true)
        }} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Equipo
        </Button>
      </div>

      {/* Teams List */}
      <div className="space-y-3">
        {teamList.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-muted-foreground">No hay equipos aún. Crea uno para empezar.</p>
          </Card>
        ) : (
          teamList.map((team) => {
            const members = expandedMembers[team.id] || []
            const isExpanded = expandedTeamId === team.id

            return (
              <Card key={team.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: team.color || '#4a9d67' }}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(team.id)}
                        className="gap-2"
                      >
                        <Users className="w-4 h-4" />
                        <span>{members.length}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(team)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(team)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Team Members */}
                {isExpanded && (
                  <CardContent className="pt-0 border-t">
                    {members.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">Sin camperos asignados</p>
                    ) : (
                      <div className="space-y-2 py-3">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                          >
                            <span>{member.name}</span>
                            {member.phone && (
                              <span className="text-muted-foreground text-xs">{member.phone}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-lg font-semibold">
              {editingId ? 'Editar Equipo' : 'Nuevo Equipo'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {editingId ? 'Actualiza los datos del equipo' : 'Crea un nuevo equipo para organizar camperos'}
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div>
              <Label htmlFor="team-name" className="text-sm font-medium">
                Nombre del Equipo *
              </Label>
              <Input
                id="team-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Equipo Alabanza"
                autoFocus
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setForm({ ...form, color: color.value })}
                    className={`w-full h-10 rounded border-2 transition-all ${
                      form.color === color.value
                        ? 'border-foreground'
                        : 'border-muted'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="px-5"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="px-5 bg-blue-600 hover:bg-blue-700">
                {isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="pb-3 border-b">
            <AlertDialogTitle className="text-lg font-semibold text-red-600">Eliminar Equipo</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              ¿Estás seguro que deseas eliminar este equipo? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <AlertDialogCancel className="px-4">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDelete(deletingId)
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4"
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
