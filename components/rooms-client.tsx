'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { createRoom, updateRoom, deleteRoom, getRooms } from '@/app/actions/rooms'
import { Room } from '@/lib/db/schema'

interface Props {
  userId: string
}

export function RoomsClient({ userId }: Props) {
  const [roomList, setRoomList] = useState<Room[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', capacity: '' })
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  const emptyForm = { name: '', capacity: '' }

  useState(() => {
    loadRooms()
  })

  async function loadRooms() {
    setLoading(true)
    try {
      const data = await getRooms(userId)
      setRoomList(data)
    } catch (error) {
      toast.error('Error al cargar habitaciones')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre de la habitación es obligatorio')
      return
    }
    const capacity = form.capacity ? parseInt(form.capacity, 10) : null
    startTransition(async () => {
      try {
        if (editingId) {
          await updateRoom(userId, editingId, { name: form.name, capacity })
          toast.success('Habitación actualizada')
        } else {
          await createRoom(userId, { name: form.name, capacity })
          toast.success('Habitación creada')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        await loadRooms()
      } catch (error) {
        toast.error('Error al guardar la habitación')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteRoom(userId, id)
        toast.success('Habitación eliminada')
        setDeleteDialogOpen(false)
        await loadRooms()
      } catch (error) {
        toast.error('Error al eliminar la habitación')
        console.error(error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Habitaciones</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Total: {roomList.length}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar habitación
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
      ) : roomList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Users className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay habitaciones registradas</p>
            <Button onClick={() => setDialogOpen(true)} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Crear primera habitación
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {roomList.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{room.name}</h3>
                    {room.capacity && (
                      <p className="text-xs text-muted-foreground">Capacidad: {room.capacity} personas</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      onClick={() => {
                        setEditingId(room.id)
                        setForm({ name: room.name, capacity: room.capacity ? String(room.capacity) : '' })
                        setDialogOpen(true)
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                      title="Editar habitación"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      onClick={() => {
                        setDeletingId(room.id)
                        setDeleteDialogOpen(true)
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-red-100"
                      title="Eliminar habitación"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Room Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setForm({ ...emptyForm })
          setEditingId(null)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar habitación' : 'Agregar habitación'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Pieza A"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacidad (personas)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                placeholder="8"
              />
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
                {editingId ? 'Guardar cambios' : 'Crear habitación'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar habitación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la habitación pero los camperos asignados no serán eliminados.
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
