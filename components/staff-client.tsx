'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  addStaffPayment,
  deleteStaffPayment,
  getStaffPayments,
  getMinistries,
  createDefaultMinistries,
} from '@/app/actions/staff'
import { getTransactions, createTransaction } from '@/app/actions/transactions'
import { Staff, StaffPayment, Ministry, Transaction } from '@/lib/db/schema'
import { formatMXN as formatCurrency, cn } from '@/lib/utils'
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
import { PageHeader } from '@/components/page-header'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface Props {
  userId: string
}

const emptyForm = {
  name: '',
  ministryId: '',
  sex: '',
  shirtSize: '',
  phone: '',
  church: '',
  totalAmount: '',
  discount: 0,
  notes: '',
}

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export function StaffClient({ userId }: Props) {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [ministries, setMinistries] = useState<Ministry[]>([])
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
    initializeDefaults()
  }, [userId])

  async function initializeDefaults() {
    setLoading(true)
    try {
      const ministryList = await createDefaultMinistries(userId)
      setMinistries(ministryList)
      const staffData = await getStaff(userId)
      setStaffList(staffData)
    } catch (err) {
      console.error('Error loading data:', err)
      toast.error('Error al cargar datos')
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

  function openEditDialog(staff: Staff) {
    setForm({
      name: staff.name,
      ministryId: staff.ministryId.toString(),
      sex: staff.sex || '',
      shirtSize: staff.shirtSize || '',
      phone: staff.phone || '',
      church: staff.church || '',
      totalAmount: staff.totalAmount.toString(),
      discount: staff.discount,
      notes: staff.notes || '',
    })
    setEditingId(staff.id)
    setDialogOpen(true)
  }

  function handleSaveStaff() {
    if (!form.name || !form.ministryId || !form.totalAmount) {
      toast.error('Completa los campos requeridos')
      return
    }

    startTransition(async () => {
      try {
        const amount = parseFloat(form.totalAmount)
        const discount = form.discount || 0
        const discountAmount = (amount * discount) / 100
        const finalAmount = amount - discountAmount

        if (editingId) {
          await updateStaff(editingId, {
            name: form.name,
            ministryId: parseInt(form.ministryId),
            sex: form.sex || null,
            shirtSize: form.shirtSize || null,
            phone: form.phone || null,
            church: form.church || null,
            totalAmount: finalAmount.toString(),
            discount: form.discount,
            notes: form.notes || null,
          })
          toast.success('Personal actualizado')
        } else {
          await createStaff(userId, {
            name: form.name,
            ministryId: parseInt(form.ministryId),
            sex: form.sex || null,
            shirtSize: form.shirtSize || null,
            phone: form.phone || null,
            church: form.church || null,
            totalAmount: finalAmount.toString(),
            discount: form.discount,
            notes: form.notes || null,
            status: 'pending',
            amountPaid: '0',
          })
          toast.success('Personal agregado')
        }
        setDialogOpen(false)
        const updated = await getStaff(userId)
        setStaffList(updated)
      } catch (err) {
        toast.error('Error al guardar')
      }
    })
  }

  async function handleOpenPaymentDialog(staffId: number) {
    setSelectedStaffId(staffId)
    setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'cash', notes: '' })
    setPaymentDialogOpen(true)
  }

  function handleAddPayment() {
    if (!paymentForm.amount || !selectedStaffId) {
      toast.error('Ingresa el monto de pago')
      return
    }

    startTransition(async () => {
      try {
        const staffRecord = staffList.find(s => s.id === selectedStaffId)
        if (!staffRecord) return

        const paymentAmount = parseFloat(paymentForm.amount)
        await addStaffPayment(userId, selectedStaffId, {
          amount: paymentAmount.toString(),
          paymentDate: paymentForm.date,
          paymentMethod: paymentForm.paymentMethod,
          notes: paymentForm.notes || null,
        })

        // Create transaction entry
        const categoryId = 1 // Ingresos
        await createTransaction(userId, {
          categoryId,
          type: 'income',
          amount: paymentAmount.toString(),
          description: `Pago de ${staffRecord.name} (${ministries.find(m => m.id === staffRecord.ministryId)?.name || 'Personal'})`,
          date: paymentForm.date,
          paymentMethod: paymentForm.paymentMethod,
        })

        const updated = await getStaff(userId)
        setStaffList(updated)
        setPaymentDialogOpen(false)
        toast.success('Pago registrado')
      } catch (err) {
        toast.error('Error al registrar pago')
      }
    })
  }

  async function openPaymentHistory(staffId: number) {
    setHistoryStaffId(staffId)
    try {
      const history = await getStaffPayments(staffId)
      setPaymentHistory(history)
      setHistoryDialogOpen(true)
    } catch (err) {
      toast.error('Error al cargar historial')
    }
  }

  function openDeleteDialog(staff: Staff) {
    setDeletingId(staff.id)
    setDeleteDialogOpen(true)
  }

  function handleDelete() {
    if (deletingId === null) return
    startTransition(async () => {
      try {
        await deleteStaff(deletingId)
        const updated = await getStaff(userId)
        setStaffList(updated)
        setDeleteDialogOpen(false)
        toast.success('Personal eliminado')
      } catch (err) {
        toast.error('Error al eliminar')
      }
    })
  }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Personal de Ministerios"
        description="Gestiona al personal de los diferentes ministerios"
        buttons={[
          { label: 'Agregar', onClick: openAddDialog, icon: Plus },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Card className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Monto Total</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(totals.total)}</p>
            </div>
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
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
              <p className="text-lg sm:text-2xl font-bold text-orange-600 mt-1">{formatCurrency(totals.pending)}</p>
            </div>
            <div className="bg-orange-600/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Staff List */}
      <div className="space-y-1">
        {staffList.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">Sin personal registrado</Card>
        ) : (
          staffList.map((s) => {
            const ministry = ministries.find(m => m.id === s.ministryId)
            const remaining = parseFloat(s.totalAmount as string) - parseFloat(s.amountPaid as string)
            let borderColor = 'border-l-slate-400'
            if (s.status === 'paid') borderColor = 'border-l-green-600'
            else if (s.status === 'partial') borderColor = 'border-l-yellow-600'
            else borderColor = 'border-l-red-600'

            return (
              <div key={s.id} className={`p-2 sm:p-3 border border-l-4 border-border ${borderColor} rounded-lg hover:bg-muted/50 transition-colors`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base">{s.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">{ministry?.name}</Badge>
                      {s.sex && <Badge variant="outline" className="text-xs">{s.sex}</Badge>}
                      {s.shirtSize && <Badge variant="outline" className="text-xs">Talla: {s.shirtSize}</Badge>}
                      <Badge className={cn('text-xs', {
                        'bg-green-600': s.status === 'paid',
                        'bg-yellow-600': s.status === 'partial',
                        'bg-red-600': s.status === 'pending',
                      })}>{s.status === 'paid' ? 'Pagado' : s.status === 'partial' ? 'Parcial' : 'Pendiente'}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:text-right gap-1">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-semibold">{formatCurrency(s.totalAmount)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Pagado: </span>
                      <span className="font-semibold text-green-600">{formatCurrency(s.amountPaid)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Falta: </span>
                      <span className="font-semibold text-orange-600">{formatCurrency(remaining)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 sm:flex-col">
                    <Button size="sm" variant="outline" onClick={() => handleOpenPaymentDialog(s.id)} className="h-8">
                      <DollarSign className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openPaymentHistory(s.id)} className="h-8">
                      <History className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(s)} className="h-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openDeleteDialog(s)} className="h-8 text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Personal' : 'Agregar Personal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre completo" />
            </div>
            <div>
              <Label>Ministerio *</Label>
              <Select value={form.ministryId} onValueChange={(value) => setForm({ ...form, ministryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona ministerio" />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Sexo</Label>
                <Select value={form.sex} onValueChange={(value) => setForm({ ...form, sex: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    <SelectItem value="Hombre">Hombre</SelectItem>
                    <SelectItem value="Mujer">Mujer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Talla</Label>
                <Select value={form.shirtSize} onValueChange={(value) => setForm({ ...form, shirtSize: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Talla" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-</SelectItem>
                    {SHIRT_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Teléfono</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Teléfono" />
              </div>
              <div>
                <Label>Iglesia</Label>
                <Input value={form.church} onChange={(e) => setForm({ ...form, church: e.target.value })} placeholder="Iglesia" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Monto Total *</Label>
                <Input type="number" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <Label>Descuento (%)</Label>
                <Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: parseInt(e.target.value) || 0 })} placeholder="0" />
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveStaff} disabled={isPending}>Guardar</Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
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
          <div className="space-y-3">
            <div>
              <Label>Monto *</Label>
              <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} />
            </div>
            <div>
              <Label>Método de Pago</Label>
              <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}>
                <SelectTrigger>
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
              <Label>Notas</Label>
              <Input value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} placeholder="Notas (opcional)" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddPayment} disabled={isPending}>Guardar Pago</Button>
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historial de Pagos</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {paymentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
            ) : (
              paymentHistory.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-2 border rounded">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">{payment.paymentDate} - {payment.paymentMethod === 'cash' ? 'Efectivo' : payment.paymentMethod === 'transfer' ? 'Transferencia' : 'Depósito'}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => startTransition(async () => {
                    await deleteStaffPayment(payment.id)
                    const history = await getStaffPayments(historyStaffId!)
                    setPaymentHistory(history)
                    const updated = await getStaff(userId)
                    setStaffList(updated)
                    toast.success('Pago eliminado')
                  })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Personal</AlertDialogTitle>
            <AlertDialogDescription>¿Estás seguro? Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
