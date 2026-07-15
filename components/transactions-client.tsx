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
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, FileDown, Filter, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import type { Category } from '@/lib/db/schema'
import { RESPONSIVE_SIZES } from '@/lib/responsive-config'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { TransactionSmartFilter } from '@/components/transaction-smart-filter'

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
  paymentMethod: 'cash',
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
  const [filterMethod, setFilterMethod] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

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
    if (filterMethod !== 'all' && t.paymentMethod !== filterMethod) return false
    if (dateFrom && t.date < dateFrom) return false
    if (dateTo && t.date > dateTo) return false
    if (search) {
      const searchLower = search.toLowerCase()
      const amount = parseFloat(t.amount as string)
      if (!t.description.toLowerCase().includes(searchLower) && 
          !formatCurrency(amount).includes(search)) return false
    }
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
      paymentMethod: t.paymentMethod || 'cash',
    })
    setDialogOpen(true)
  }

  function openDelete(id: number) {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.categoryId) {
      toast.error('Selecciona una categoría')
      return
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }
    if (!form.description.trim()) {
      toast.error('La descripción es obligatoria')
      return
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateTransaction(userId, editingId, {
            categoryId: parseInt(form.categoryId),
            type: form.type,
            amount: form.amount,
            description: form.description,
            date: form.date,
            paymentMethod: form.paymentMethod,
          })
          toast.success('Transacción actualizada')
        } else {
          await createTransaction(userId, {
            categoryId: parseInt(form.categoryId),
            type: form.type,
            amount: form.amount,
            description: form.description,
            date: form.date,
            paymentMethod: form.paymentMethod,
          })
          toast.success('Transacción registrada')
        }
        setDialogOpen(false)
        await reload()
      } catch (error) {
        toast.error('Error al guardar la transacción')
        console.error(error)
      }
    })
  }

  async function handleDelete() {
    if (!deletingId) return
    startTransition(async () => {
      try {
        await deleteTransaction(userId, deletingId)
        toast.success('Transacción eliminada')
        setDeleteDialogOpen(false)
        await reload()
      } catch (error) {
        toast.error('Error al eliminar la transacción')
        console.error(error)
      }
    })
  }

  function exportToExcel() {
    if (filtered.length === 0) {
      toast.error('No hay transacciones para exportar')
      return
    }
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
    toast.success('Transacciones exportadas correctamente')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Transacciones</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Registra y gestiona ingresos y egresos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} className="gap-2 hover:bg-slate-100">
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button onClick={openCreate} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4" />
            Nueva
          </Button>
        </div>
      </div>

      {/* Summary - Like Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Card className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Ingresos</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(totals.income)}</p>
            </div>
            <div className="bg-emerald-600/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Egresos</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(totals.expense)}</p>
            </div>
            <div className="bg-orange-600/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Balance General</p>
              <p className={`text-lg sm:text-2xl font-bold mt-1 ${totals.income - totals.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.income - totals.expense)}
              </p>
            </div>
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <TransactionSmartFilter
        search={search}
        onSearchChange={setSearch}
        typeFilter={filterType}
        onTypeChange={setFilterType}
        categoryFilter={filterCat}
        onCategoryChange={setFilterCat}
        categories={categories}
        methodFilter={filterMethod}
        onMethodChange={setFilterMethod}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        onClearFilters={() => {
          setFilterType('all')
          setFilterCat('all')
          setFilterMethod('all')
          setSearch('')
          setDateFrom('')
          setDateTo('')
        }}
      />

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-sm">
            {transactions.length === 0
              ? 'No hay transacciones aun. Haz clic en "Nueva" para comenzar.'
              : 'No se encontraron transacciones con los filtros actuales.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-1">
          {filtered.map((t) => {
            let borderColor = 'border-l-slate-400'
            if (t.paymentMethod === 'cash') borderColor = 'border-l-green-600'
            else if (t.paymentMethod === 'transfer') borderColor = 'border-l-blue-600'
            else if (t.paymentMethod === 'deposit') borderColor = 'border-l-purple-600'
            
            return (
            <div key={t.id} className={`p-1.5 sm:p-2.5 border border-l-4 border-border ${borderColor} rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 hover:bg-muted/50 transition-colors`}>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {t.type === 'income' ? (
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-xs truncate">{t.description}</p>
                  <div className="hidden sm:flex gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{t.date}</span>
                    <span>•</span>
                    <span>{t.categoryName ?? 'Sin categoría'}</span>
                    <span>•</span>
                    <span>{!t.paymentMethod || t.paymentMethod === 'cash' ? 'Efectivo' : t.paymentMethod === 'transfer' ? 'Transferencia' : 'Depósito'}</span>
                  </div>
                  <div className="sm:hidden flex gap-1.5 mt-0.5 text-xs text-muted-foreground">
                    <span className="text-xs">{t.date}</span>
                    <span>•</span>
                    <span className="truncate text-xs">{t.categoryName ?? 'Sin categoría'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-1.5">
                <p className={`text-xs sm:text-sm font-bold whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount as string))}
                </p>
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="icon" className="w-6 h-6 sm:w-7 sm:h-7" onClick={() => openEdit(t)}>
                    <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-6 h-6 sm:w-7 sm:h-7" onClick={() => openDelete(t.id)}>
                    <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base">{editingId ? 'Editar transacción' : 'Nueva transacción'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-3 mt-1 sm:mt-2">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs sm:text-sm">Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v, categoryId: '' })}>
                  <SelectTrigger className="h-6 sm:h-8 text-xs">
                    <span className="text-foreground text-xs">
                      {form.type === 'income' ? 'Ingreso' : form.type === 'expense' ? 'Egreso' : 'Tipo'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="amount" className="text-xs sm:text-sm">Monto</Label>
                <Input
                  id="amount" type="number" step="0.01" min="0.01" placeholder="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="h-6 sm:h-8 text-xs"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="desc" className="text-xs sm:text-sm">Descripción</Label>
              <Input
                id="desc" placeholder="Ej: Compra de suministros"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="h-6 sm:h-8 text-xs"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs sm:text-sm">Categoría</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger className="h-6 sm:h-8 text-xs">
                    <span className="text-xs truncate">
                      {form.categoryId && form.categoryId !== 'none' 
                        ? (() => {
                            const selected = filteredCategories.find(c => String(c.id) === form.categoryId)
                            return selected ? (
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: selected.color }} />
                                <span className="truncate">{selected.name}</span>
                              </div>
                            ) : 'Cat.'
                          })()
                        : 'Cat.'
                      }
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length === 0
                      ? <SelectItem value="none" disabled>Sin categorías disponibles</SelectItem>
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
              <div className="flex flex-col gap-1">
                <Label htmlFor="date" className="text-xs sm:text-sm">Fecha</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-6 sm:h-7 text-xs" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs sm:text-sm">Método de Pago</Label>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {[
                  { value: 'cash', label: 'Efectivo' },
                  { value: 'transfer', label: 'Transferencia' },
                  { value: 'deposit', label: 'Depósito' },
                ].map((option) => (
                  <label key={option.value} className={`flex items-center gap-1 cursor-pointer p-1.5 sm:p-2 rounded-lg border transition-all text-xs sm:text-sm ${form.paymentMethod === option.value ? 'bg-primary/10 border-primary' : 'border-border'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={form.paymentMethod === option.value}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-1.5 sm:gap-2 mt-1 sm:mt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="h-7 sm:h-8 text-xs sm:text-sm hover:bg-slate-100">Cancelar</Button>
              <Button type="submit" disabled={isPending || !form.categoryId || form.categoryId === 'none'} className="h-7 sm:h-8 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-400">
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
            <AlertDialogTitle>Eliminar transacción</AlertDialogTitle>
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
