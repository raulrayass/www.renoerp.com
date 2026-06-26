'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/actions/categories'
import { Plus, Pencil, Trash2, Tag, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react'
import { Category } from '@/lib/db/schema'
import { useEffect, useState, useTransition } from 'react'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#64748b',
]

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  income: { label: 'Ingreso', icon: <TrendingUp className="w-3 h-3" /> },
  expense: { label: 'Egreso', icon: <TrendingDown className="w-3 h-3" /> },
  both: { label: 'Ambos', icon: <ArrowLeftRight className="w-3 h-3" /> },
}

const defaultForm = {
  name: '',
  type: 'expense',
  color: '#6366f1',
  icon: 'tag',
}

interface Props {
  userId: string
}

export function CategoriesClient({ userId }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    getCategories(userId).then(setCategories)
  }, [userId])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState(defaultForm)

  function openCreate() {
    setEditingId(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(c: Category) {
    setEditingId(c.id)
    setForm({ name: c.name, type: c.type, color: c.color, icon: c.icon })
    setDialogOpen(true)
  }

  function openDelete(id: number) {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      if (editingId) {
        await updateCategory(userId, editingId, form)
      } else {
        await createCategory(userId, form)
      }
      setDialogOpen(false)
      const updated = await getCategories(userId)
      setCategories(updated)
    })
  }

  async function handleDelete() {
    if (!deletingId) return
    startTransition(async () => {
      await deleteCategory(userId, deletingId)
      setDeleteDialogOpen(false)
      const updated = await getCategories(userId)
      setCategories(updated)
    })
  }

  const grouped = {
    income: categories.filter((c) => c.type === 'income'),
    expense: categories.filter((c) => c.type === 'expense'),
    both: categories.filter((c) => c.type === 'both'),
  }

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorías</h1>
          <p className="text-muted-foreground text-sm mt-1">Administra las categorías de tus transacciones</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva categoría
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[oklch(0.55_0.17_160)]/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-[oklch(0.55_0.17_160)]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ingresos</p>
            <p className="text-lg font-bold text-foreground">{grouped.income.length + grouped.both.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[oklch(0.55_0.20_25)]/10 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4 text-[oklch(0.55_0.20_25)]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Egresos</p>
            <p className="text-lg font-bold text-foreground">{grouped.expense.length + grouped.both.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-foreground">{categories.length}</p>
          </div>
        </Card>
      </div>

      {categories.length === 0 ? (
        <Card className="p-12 text-center">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">Sin categorías</p>
          <p className="text-muted-foreground text-sm mb-4">
            Crea categorías para organizar tus transacciones
          </p>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Crear primera categoría
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {categories.map((c) => {
            const typeInfo = TYPE_LABELS[c.type]
            return (
              <Card key={c.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${c.color}20` }}
                  >
                    <Tag className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{c.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge
                        variant="secondary"
                        className="text-xs gap-1 px-1.5 py-0"
                        style={{
                          backgroundColor: `${c.color}15`,
                          color: c.color,
                          borderColor: `${c.color}30`,
                        }}
                      >
                        {typeInfo.icon}
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => openEdit(c)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-destructive hover:text-destructive"
                    onClick={() => openDelete(c.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                placeholder="Ej: Alimentación, Salario..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="expense">Egreso</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    style={{
                      backgroundColor: color,
                      outline: form.color === color ? `3px solid ${color}` : undefined,
                      outlineOffset: form.color === color ? '2px' : undefined,
                    }}
                    onClick={() => setForm({ ...form, color })}
                    aria-label={`Color ${color}`}
                  />
                ))}
                <div className="flex items-center gap-1 ml-1">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border border-input"
                    title="Color personalizado"
                  />
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: form.color, backgroundColor: `${form.color}10`, color: form.color }}
              >
                <Tag className="w-4 h-4" />
                Vista previa: {form.name || 'Categoría'}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las transacciones asociadas perderán su categoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
