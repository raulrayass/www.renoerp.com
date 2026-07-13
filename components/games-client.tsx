'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { createGame, updateGame, deleteGame, getGames, getGameScores } from '@/app/actions/games'
import { Game } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface GamesClientProps {
  userId: string
}

export function GamesClient({ userId }: GamesClientProps) {
  const [gameList, setGameList] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: '' })

  const emptyForm = { name: '' }

  useEffect(() => {
    loadGames()
  }, [])

  async function loadGames() {
    setLoading(true)
    try {
      const data = await getGames(userId)
      setGameList(data || [])
    } catch (error) {
      console.error('Error loading games:', error)
      toast.error('Error al cargar juegos')
    }
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
          await updateGame(editingId, form.name.trim())
          toast.success('Juego actualizado')
        } else {
          await createGame(userId, form.name.trim())
          toast.success('Juego creado')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        await loadGames()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error')
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteGame(id)
        toast.success('Juego eliminado')
        setDeleteDialogOpen(false)
        setDeletingId(null)
        await loadGames()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error')
      }
    })
  }

  function openEdit(game: Game) {
    setForm({ name: game.name })
    setEditingId(game.id)
    setDialogOpen(true)
  }

  function openDelete(id: number) {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Juegos</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Total: {gameList.length} juegos
          </p>
        </div>
        <Button onClick={() => { setForm({ ...emptyForm }); setEditingId(null); setDialogOpen(true) }} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo juego
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando juegos...</div>
      ) : gameList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No hay juegos. Crea uno para comenzar.</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-20 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gameList.map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium">{game.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(game)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDelete(game.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-lg font-semibold">{editingId ? 'Editar Juego' : 'Nuevo Juego'}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{editingId ? 'Actualiza el nombre del juego' : 'Crea un nuevo juego'}</p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div>
              <label className="text-sm font-medium">Nombre del Juego *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Carreras"
                autoFocus
                className="mt-1.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="px-5">
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="px-5 bg-blue-600 hover:bg-blue-700">
                {isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="pb-3 border-b">
            <AlertDialogTitle className="text-lg font-semibold text-red-600">Eliminar Juego</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              ¿Estás seguro de que deseas eliminar este juego? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 border-t">
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
