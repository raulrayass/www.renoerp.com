'use client'

import { useState, useTransition } from 'react'
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
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/app/actions/transactions'
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, FileDown, Filter } from 'lucide-react'
import { Category } from '@/lib/db/schema'
import * as XLSX from 'xlsx'

type TransactionRow = {
  id: number
  type: string
  amount: string
  date: string
  description: string
  categoryId: number
  categoryName: string | null
  categoryColor: string | null
  categoryIcon: string | null
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

interface Props {
  transactions: TransactionRow[]
  categories: Category[]
}

const defaultForm = {
  type: 'expense',
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  categoryId: '',
}

export function TransactionsClient({ transactions, categories }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')

  const filteredCategories = categories.filter(
    (c) => c.type === 'both' || c.type === form.type
  )

  const availableCategories = categories.filter((c) => {
    if (filterCat === 'all') return true
    return c.id === parseInt(filterCat)
  })

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterCat !== 'all' && t.categoryId !== parseInt(filterCat)) return false
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalFiltered = filtered.reduce((acc, t) => {
    return t.type === 'income'
      ? { ...acc, income: acc.income + parseFloat(t.amount) }
      : { ...acc, expense: acc.expense + parseFloat(t.amount) }
  }, { income: 0, expense: 0 })

  function openCreate() {
    setEditingId(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(t: TransactionRow) {
    setEditingId(t.id)
    setForm({
      type: t.type,
      amount: t.amount,
      description: t.description,
      date: t.date,
      categoryId: String(t.categoryId),
    })
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
        await updateTransaction(editingId, {
          categoryId: parseInt(form.categoryId),
          type: form.type,
          amount: form.amount,
          description: form.description,
          date: form.date,
        })
      } else {
        await createTransaction({
          categoryId: parseInt(form.categoryId),
          type: form.type,
          amount: form.amount,
          description: form.description,
          date: form.date,
        })
      }
      setDialogOpen(false)
      router.refresh()
    })
  }

  async function handleDelete() {
    if (!deletingId) return
    startTransition(async () => {
      await deleteTransaction(deletingId)
      setDeleteDialogOpen(false)
      router.refresh()
    })
  }

  function exportToExcel() {
    const data = filtered.map((t) => ({
      Fecha: t.date,
      Tipo: t.type === 'income' ? 'Ingreso' : 'Egreso',
      Categoría: t.categoryName ?? 'Sin categoría',
      Descripción: t.description,
      Monto: parseFloat(t.amount),
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Transacciones')
    XLSX.writeFile(wb, 'transacciones.xlsx')
  }

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transacciones</h1>
          <p className="text-muted-foreground text-sm mt-1">Registra y gestiona tus ingresos y egresos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} className="gap-2">
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva transacción
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ingresos</p>
          <p className="text-lg font-bold text-[oklch(0.55_0.17_160)] mt-0.5">{formatCurrency(totalFiltered.income)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Egresos</p>
          <p className="text-lg font-bold text-[oklch(0.55_0.20_25)] mt-0.5">{formatCurrency(totalFiltered.expense)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className={`text-lg font-bold mt-0.5 ${totalFiltered.income - totalFiltered.expense >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            {formatCurrency(totalFiltered.income - totalFiltered.expense)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Buscar por descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 h-8 text-sm"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Egresos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-44 h-8 text-sm">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filterType !== 'all' || filterCat !== 'all' || search) && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setFilterType('all'); setFilterCat('all'); setSearch('') }}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            {transactions.length === 0
              ? 'No hay transacciones aún. Haz clic en "Nueva transacción" para comenzar.'
              : 'No se encontraron transacciones con los filtros actuales.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Fecha</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Descripción</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Categoría</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tipo</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Monto</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{t.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: t.categoryColor ?? '#888' }}
                        />
                        <span className="text-sm text-foreground">{t.categoryName ?? 'Sin categoría'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={`text-xs gap-1 ${t.type === 'income' ? 'bg-[oklch(0.55_0.17_160)]/10 text-[oklch(0.45_0.17_160)]' : 'bg-[oklch(0.55_0.20_25)]/10 text-[oklch(0.45_0.20_25)]'}`}
                      >
                        {t.type === 'income'
                          ? <><ArrowUpRight className="w-3 h-3" /> Ingreso</>
                          : <><ArrowDownRight className="w-3 h-3" /> Egreso</>
                        }
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-[oklch(0.55_0.17_160)]' : 'text-[oklch(0.55_0.20_25)]'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount))}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => openEdit(t)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive" onClick={() => openDelete(t.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar transacción' : 'Nueva transacción'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v, categoryId: '' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="Descripción de la transacción"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Categoría</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length === 0 ? (
                      <SelectItem value="none" disabled>Sin categorías disponibles</SelectItem>
                    ) : (
                      filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                            {c.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || !form.categoryId || form.categoryId === 'none'}>
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
            <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La transacción será eliminada permanentemente.
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
