'use client'

import { useEffect, useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  getTransactions, createTransaction, updateTransaction, deleteTransaction,
} from '@/app/actions/transactions'
import { getCategories } from '@/app/actions/categories'
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, FileDown, Filter } from 'lucide-react'
import type { Category } from '@/lib/db/schema'
import * as XLSX from 'xlsx'

type TransactionRow = Awaited<ReturnType<typeof getTransactions>>[number]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

const defaultForm = {
  type: 'expense',
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  categoryId: '',
}

export function TransactionsClient({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')

  async function reload() {
    const [txs, cats] = await Promise.all([
      getTransactions(userId),
      getCategories(userId),
    ])
    setTransactions(txs)
    setCategories(cats)
  }

  useEffect(() => {
    setLoading(true)
    reload().finally(() => setLoading(false))
  }, [userId])

  const filteredCategories = categories.filter(
    (c) => c.type === 'both' || c.type === form.type
  )

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterCat !== 'all' && t.categoryId !== parseInt(filterCat)) return false
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totals = filtered.reduce(
    (acc, t) => {
      const amt = parseFloat(t.amount as string)
      return t.type === 'income'
        ? { ...acc, income: acc.income + amt }
        : { ...acc, expense: acc.expense + amt }
    },
    { income: 0, expense: 0 }
  )

  function openCreate() {
    setEditingId(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(t: TransactionRow) {
    setEditingId(t.id)
    setForm({
      type: t.type,
      amount: t.amount as string,
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
        await updateTransaction(userId, editingId, {
          categoryId: parseInt(form.categoryId),
          type: form.type,
          amount: form.amount,
          description: form.description,
          date: form.date,
        })
      } else {
        await createTransaction(userId, {
          categoryId: parseInt(form.categoryId),
          type: form.type,
          amount: form.amount,
          description: form.description,
          date: form.date,
        })
      }
      setDialogOpen(false)
      await reload()
    })
  }

  async function handleDelete() {
    if (!deletingId) return
    startTransition(async () => {
      await deleteTransaction(userId, deletingId)
      setDeleteDialogOpen(false)
      await reload()
    })
  }

  function exportToExcel() {
    const data = filtered.map((t) => {
      const amount = parseFloat(t.amount as string)
      const signedAmount = t.type === 'income' ? amount : -amount
      return {
        Fecha: t.date,
        Tipo: t.type === 'income' ? 'Ingreso' : 'Egreso',
        Categoria: t.categoryName ?? 'Sin categoria',
        Descripcion: t.description,
        'Monto ($)': signedAmount,
      }
    })
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Transacciones')
    XLSX.writeFile(wb, `Transacciones_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
            Nueva
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ingresos</p>
          <p className="text-lg font-bold mt-0.5" style={{ color: 'oklch(0.55 0.17 160)' }}>{formatCurrency(totals.income)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Egresos</p>
          <p className="text-lg font-bold mt-0.5" style={{ color: 'oklch(0.55 0.20 25)' }}>{formatCurrency(totals.expense)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className={`text-lg font-bold mt-0.5 ${totals.income - totals.expense >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            {formatCurrency(totals.income - totals.expense)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-muted-foreground">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Buscar descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-sm"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Egresos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="h-9 text-sm">
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
            <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => { setFilterType('all'); setFilterCat('all'); setSearch('') }}>
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
              ? 'No hay transacciones aun. Haz clic en "Nueva" para comenzar.'
              : 'No se encontraron transacciones con los filtros actuales.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Fecha</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Descripcion</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Categoria</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Tipo</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Monto</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3 text-sm text-foreground max-w-[200px] truncate">{t.description}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.categoryColor ?? '#888' }} />
                        <span className="text-sm text-foreground">{t.categoryName ?? 'Sin categoria'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="secondary" className="text-xs gap-1"
                        style={{
                          backgroundColor: t.type === 'income' ? 'oklch(0.55 0.17 160 / 0.1)' : 'oklch(0.55 0.20 25 / 0.1)',
                          color: t.type === 'income' ? 'oklch(0.45 0.17 160)' : 'oklch(0.45 0.20 25)',
                        }}
                      >
                        {t.type === 'income'
                          ? <><ArrowUpRight className="w-3 h-3" /> Ingreso</>
                          : <><ArrowDownRight className="w-3 h-3" /> Egreso</>}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold" style={{ color: t.type === 'income' ? 'oklch(0.55 0.17 160)' : 'oklch(0.55 0.20 25)' }}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount as string))}
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
            <DialogTitle>{editingId ? 'Editar transaccion' : 'Nueva transaccion'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v, categoryId: '' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount" type="number" step="0.01" min="0.01" placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="desc">Descripcion</Label>
              <Input
                id="desc" placeholder="Descripcion de la transaccion"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Categoria</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length === 0
                      ? <SelectItem value="none" disabled>Sin categorias disponibles</SelectItem>
                      : filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                            {c.name}
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
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
            <AlertDialogTitle>Eliminar transaccion</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. La transaccion sera eliminada permanentemente.
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
