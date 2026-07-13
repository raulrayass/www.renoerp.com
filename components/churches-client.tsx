'use client'

import { useState, useEffect, useTransition } from 'react'
import { getChurches, createChurch, updateChurch, deleteChurch } from '@/app/actions/churches'
import { Church } from '@/lib/db/schema'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  userId: string
}

export function ChurchesClient({ userId }: Props) {
  const [churches, setChurches] = useState<Church[]>([])
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [churchName, setChurchName] = useState('')

  useEffect(() => {
    loadChurches()
  }, [userId])

  async function loadChurches() {
    const data = await getChurches(userId)
    setChurches(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!churchName.trim()) {
      toast.error('El nombre de la iglesia es obligatorio')
      return
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateChurch(userId, editingId, churchName)
          toast.success('Iglesia actualizada')
        } else {
          await createChurch(userId, churchName)
          toast.success('Iglesia agregada')
        }
        setDialogOpen(false)
        setChurchName('')
        setEditingId(null)
        await loadChurches()
      } catch (error: any) {
        toast.error(error.message || 'Error al guardar la iglesia')
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteChurch(userId, id)
        toast.success('Iglesia eliminada')
        setDeleteDialogOpen(false)
        await loadChurches()
      } catch (error: any) {
        toast.error(error.message || 'Error al eliminar la iglesia')
      }
    })
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Iglesias</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Total: {churches.length}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4" />
          Agregar Iglesia
        </Button>
      </div>

      {/* Churches Grid */}
      {churches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay iglesias registradas. Agrega la primera iglesia.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {churches.map((church) => (
            <Card key={church.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{church.name}</h3>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-2">
                    <Button
                      onClick={() => {
                        setEditingId(church.id)
                        setChurchName(church.name)
                        setDialogOpen(true)
                      }}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      title="Editar iglesia"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        setDeletingId(church.id)
                        setDeleteDialogOpen(true)
                      }}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Eliminar iglesia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Creada: {new Date(church.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setChurchName('')
            setEditingId(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-lg font-semibold">{editingId ? 'Editar Iglesia' : 'Nueva Iglesia'}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{editingId ? 'Actualiza los datos de la iglesia' : 'Agrega una nueva iglesia a la lista'}</p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div>
              <Label htmlFor="church-name" className="text-sm font-medium">Nombre de la Iglesia *</Label>
              <Input
                id="church-name"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                placeholder="Ej: Iglesia del Evangelio"
                autoFocus
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="px-5">
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="px-5 bg-blue-600 hover:bg-blue-700">
                {editingId ? 'Guardar Cambios' : 'Agregar Iglesia'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="pb-3 border-b">
            <AlertDialogTitle className="text-lg font-semibold text-red-600">Eliminar Iglesia</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              ¿Estás seguro que deseas eliminar esta iglesia? Esta acción no se puede deshacer.
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
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
