'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  MINISTRIES,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  addStaffPayment,
  deleteStaffPayment,
  getStaffPayments,
} from '@/app/actions/staff'
import { getTransactions, createTransaction } from '@/app/actions/transactions'
import { Staff, StaffPayment, Transaction } from '@/lib/db/schema'
import { formatMXN as formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, DollarSign, Edit2, History } from 'lucide-react'
import { toast } from 'sonner'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface Props {
  userId: string
}

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const emptyForm = {
  name: '',
  category: '',
  sex: '',
  shirtSize: '',
  phone: '',
  church: '',
  age: '',
  totalAmount: '',
  notes: '',
}

export function StaffClient({ userId }: Props) {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: '',
  })
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [historyStaffId, setHistoryStaffId] = useState<number | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<StaffPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStaffData()
  }, [userId])

  async function loadStaffData() {
    setLoading(true)
    try {
      const staffData = await getStaff(userId)
      setStaffList(staffData)
    } catch (err) {
      console.error('Error loading staff:', err)
      toast.error('Error al cargar personal')
    } finally {
      setLoading(false)
    }
  }

  const totals = {
    total: staffList.reduce((sum, s) => sum + parseFloat(s.totalAmount as string || '0'), 0),
    paid: staffList.reduce((sum, s) => sum + parseFloat(s.amountPaid as string || '0'), 0),
    pending: staffList.reduce((sum, s) => sum + (parseFloat(s.totalAmount as string || '0') - parseFloat(s.amountPaid as string || '0')), 0),
  }

  function resetForm() {
    setForm({ ...emptyForm })
    setEditingId(null)
  }

  function openAddDialog() {
    resetForm()
    setDialogOpen(true)
  }

  function openEditDialog(s: Staff) {
    setForm({
      name: s.name,
      category: s.category || '',
      sex: s.sex || '',
      shirtSize: s.shirtSize || '',
      phone: s.phone || '',
      church: s.church || '',
      age: s.age?.toString() || '',
      totalAmount: s.totalAmount.toString(),
      notes: '',
    })
    setEditingId(s.id)
    setDialogOpen(true)
  }

  function handleSaveStaff() {
    if (!form.name || !form.category || !form.totalAmount) {
      toast.error('Completa los campos requeridos')
      return
    }

    startTransition(async () => {
      try {
        const amount = parseFloat(form.totalAmount)

        if (editingId) {
          await updateStaff(editingId, {
            name: form.name,
            category: form.category || null,
            sex: form.sex || null,
            shirtSize: form.shirtSize || null,
            phone: form.phone || null,
            church: form.church || null,
            age: form.age ? parseInt(form.age) : null,
            totalAmount: amount.toString(),
          })
          toast.success('Personal actualizado')
        } else {
          await createStaff(userId, {
            name: form.name,
            category: form.category || null,
            sex: form.sex || null,
            shirtSize: form.shirtSize || null,
            phone: form.phone || null,
            church: form.church || null,
            age: form.age ? parseInt(form.age) : null,
            totalAmount: amount.toString(),
            amountPaid: '0',
            status: 'pending',
          } as any)
          toast.success('Personal agregado')
        }

        await loadStaffData()
        resetForm()
        setDialogOpen(false)
      } catch (err) {
        console.error('Error saving staff:', err)
        toast.error('Error al guardar')
      }
    })
  }

  function handleDeleteClick(staffId: number) {
    setDeletingId(staffId)
    setDeleteDialogOpen(true)
  }

  function handleConfirmDelete() {
    if (!deletingId) return

    startTransition(async () => {
      try {
        await deleteStaff(deletingId)
        await loadStaffData()
        toast.success('Personal eliminado')
        setDeleteDialogOpen(false)
        setDeletingId(null)
      } catch (err) {
        console.error('Error deleting staff:', err)
        toast.error('Error al eliminar')
      }
    })
  }

  function handleOpenPaymentDialog(staffId: number) {
    setSelectedStaffId(staffId)
    setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'cash', notes: '' })
    setPaymentDialogOpen(true)
  }

  function handleAddPayment() {
    if (!selectedStaffId || !paymentForm.amount) {
      toast.error('Ingresa el monto del pago')
      return
    }

    startTransition(async () => {
      try {
        const amount = parseFloat(paymentForm.amount)
        const paymentDate = new Date(paymentForm.date)

        await addStaffPayment(userId, selectedStaffId, {
          staffId: selectedStaffId,
          userId,
          amount: amount.toString(),
          paymentDate: paymentDate.toISOString() as any,
          paymentMethod: paymentForm.paymentMethod as any,
          notes: paymentForm.notes || null,
        } as any)

        // Registrar en transacciones
        const staff = staffList.find(s => s.id === selectedStaffId)
        if (staff) {
          await createTransaction(userId, {
            categoryId: 1,
            type: 'income',
            amount: amount.toString(),
            description: `Pago de ${staff.name}`,
            date: paymentForm.date,
            paymentMethod: paymentForm.paymentMethod,
          } as any)
        }

        await loadStaffData()
        toast.success('Pago registrado')
        setPaymentDialogOpen(false)
        setSelectedStaffId(null)
      } catch (err) {
        console.error('Error adding payment:', err)
        toast.error('Error al registrar pago')
      }
    })
  }

  async function handleOpenHistory(staffId: number) {
    setHistoryStaffId(staffId)
    try {
      const history = await getStaffPayments(staffId)
      setPaymentHistory(history)
      setHistoryDialogOpen(true)
    } catch (err) {
      console.error('Error loading history:', err)
      toast.error('Error al cargar historial')
    }
  }

  function handleDeletePayment(paymentId: number) {
    startTransition(async () => {
      try {
        await deleteStaffPayment(paymentId)
        if (historyStaffId) {
          const history = await getStaffPayments(historyStaffId)
          setPaymentHistory(history)
        }
        await loadStaffData()
        toast.success('Pago eliminado')
      } catch (err) {
        console.error('Error deleting payment:', err)
        toast.error('Error al eliminar')
      }
    })
  }

  const getStatusColor = (status: string) => {
    if (status === 'paid') return 'bg-green-100 text-green-800'
    if (status === 'partial') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Card className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Monto Total</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(totals.total)}</p>
            </div>
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pagado</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600 mt-1">{formatCurrency(totals.paid)}</p>
            </div>
            <div className="bg-green-600/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pendiente</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 mt-1">{formatCurrency(totals.pending)}</p>
            </div>
            <div className="bg-red-600/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Personal
        </Button>
      </div>

      {/* Staff List */}
      {staffList.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Sin personal registrado
        </Card>
      ) : (
        <div className="space-y-2">
          {staffList.map((s) => (
            <Card key={s.id} className="p-3 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                    <Badge className={getStatusColor(s.status || 'pending')} variant="secondary">
                      {s.status === 'paid' ? 'Pagado' : s.status === 'partial' ? 'Parcial' : 'Pendiente'}
                    </Badge>
                  </div>
                  {s.category && <p className="text-xs text-muted-foreground">{s.category}</p>}
                  {s.phone && <p className="text-xs text-muted-foreground">Tel: {s.phone}</p>}
                  {s.church && <p className="text-xs text-muted-foreground">Iglesia: {s.church}</p>}
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{ width: `${(parseFloat(s.amountPaid as string || '0') / parseFloat(s.totalAmount as string || '1')) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(parseFloat(s.amountPaid as string || '0'))} / {formatCurrency(parseFloat(s.totalAmount as string || '0'))}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenPaymentDialog(s.id)}
                    className="h-8 w-8 p-0"
                  >
                    <DollarSign className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenHistory(s.id)}
                    className="h-8 w-8 p-0"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(s)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(s.id)}
                    className="h-8 w-8 p-0 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Personal' : 'Agregar Personal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre completo"
                className="text-xs h-8"
              />
            </div>

            <div>
              <Label className="text-xs">Ministerio *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Selecciona ministerio" />
                </SelectTrigger>
                <SelectContent>
                  {MINISTRIES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Sexo</Label>
                <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hombre">Hombre</SelectItem>
                    <SelectItem value="Mujer">Mujer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Talla</Label>
                <Select value={form.shirtSize} onValueChange={(v) => setForm({ ...form, shirtSize: v })}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Talla" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIRT_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Teléfono</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Teléfono"
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Edad</Label>
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Edad"
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Iglesia</Label>
              <Input
                value={form.church}
                onChange={(e) => setForm({ ...form, church: e.target.value })}
                placeholder="Iglesia"
                className="text-xs h-8"
              />
            </div>

            <div>
              <Label className="text-xs">Monto Total *</Label>
              <Input
                type="number"
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                placeholder="Monto"
                step="0.01"
                className="text-xs h-8"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-xs h-8">
                Cancelar
              </Button>
              <Button onClick={handleSaveStaff} disabled={isPending} className="text-xs h-8">
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Monto *</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="Monto"
                step="0.01"
                className="text-xs h-8"
              />
            </div>

            <div>
              <Label className="text-xs">Fecha</Label>
              <Input
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                className="text-xs h-8"
              />
            </div>

            <div>
              <Label className="text-xs">Método</Label>
              <Select value={paymentForm.paymentMethod} onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMethod: v })}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="deposit">Depósito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Notas</Label>
              <Input
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Notas (opcional)"
                className="text-xs h-8"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} className="text-xs h-8">
                Cancelar
              </Button>
              <Button onClick={handleAddPayment} disabled={isPending} className="text-xs h-8">
                {isPending ? 'Registrando...' : 'Registrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial de Pagos</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {paymentHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin pagos registrados</p>
            ) : (
              paymentHistory.map((p) => (
                <Card key={p.id} className="p-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-xs font-medium">{formatCurrency(parseFloat(p.amount as string))}</p>
                      <p className="text-xs text-muted-foreground">{p.paymentDate}</p>
                      <p className="text-xs text-muted-foreground">{p.paymentMethod}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePayment(p.id)}
                      className="h-6 w-6 p-0 text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar personal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los pagos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="text-xs h-8">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isPending} className="text-xs h-8 bg-red-600 hover:bg-red-700">
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
