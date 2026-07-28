'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { createEvent, updateEvent, deleteEvent, getUserEvents } from '@/app/actions/events'
import { useUser } from '@/components/user-provider'

interface Event {
  id: number
  name: string
  startDate?: Date | null
  endDate?: Date | null
  country?: string
  city?: string
  status: string
  adminId: string
}

export function EventsClient() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [events, setEvents] = useState<Event[]>([])
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    country: '',
    city: '',
  })
  const [isLoading, setIsLoading] = useState(true)

  const emptyForm = { name: '', startDate: '', endDate: '', country: '', city: '' }

  // Load events on mount
  const loadEvents = async () => {
    if (!user?.email) return
    try {
      const result = await getUserEvents(user.email)
      setEvents(result as any)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Error al cargar campamentos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.email) {
      loadEvents()
    }
  }, [user?.email])

  // Handle create/edit submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre del campamento es obligatorio')
      return
    }
    if (!user?.email) {
      toast.error('Sesión no válida')
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateEvent(user.email, editingId, {
            name: form.name,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            country: form.country || undefined,
            city: form.city || undefined,
          })
          toast.success('Campamento actualizado')
        } else {
          await createEvent(user.email, {
            name: form.name,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            country: form.country || undefined,
            city: form.city || undefined,
          })
          toast.success('Campamento creado')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        await loadEvents()
      } catch (error: any) {
        toast.error(error.message || 'Error al guardar campamento')
      }
    })
  }

  // Handle delete
  async function handleDelete() {
    if (!deletingId || !user?.email) return
    startTransition(async () => {
      try {
        await deleteEvent(user.email, deletingId)
        toast.success('Campamento eliminado')
        setDeleteDialogOpen(false)
        await loadEvents()
      } catch (error: any) {
        toast.error(error.message || 'Error al eliminar campamento')
      }
    })
  }

  // Handle edit
  function handleEdit(event: Event) {
    setEditingId(event.id)
    setForm({
      name: event.name,
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      country: event.country || '',
      city: event.city || '',
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona tus eventos</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null)
            setForm({ ...emptyForm })
            setDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Campamento
        </Button>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-40 bg-muted rounded" />
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No hay campamentos</p>
            <p className="text-sm text-muted-foreground mt-1">Crea tu primer campamento para empezar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(event => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="flex-1 truncate">{event.name}</span>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(event.id)
                        setDeleteDialogOpen(true)
                      }}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.startDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.startDate).toLocaleDateString()}
                    {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                  </div>
                )}
                {(event.city || event.country) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {[event.city, event.country].filter(Boolean).join(', ')}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Estado: <span className="font-medium">{event.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Campamento' : 'Nuevo Campamento'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre del campamento"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })}
                  placeholder="País"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="Ciudad"
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
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Campamento</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar este campamento? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
