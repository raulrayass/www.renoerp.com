'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  getAllStaff,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  addStaffPayment,
  deleteStaffPayment,
  getStaffPayments,
  bulkCreateStaff,
  toggleCheckIn,
} from '@/app/actions/staff'
import { getChurches } from '@/app/actions/churches'
import { Staff, StaffPayment, Church } from '@/lib/db/schema'
import { formatMXN } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, DollarSign, Upload, Download, Edit2, Briefcase, History, Search, CheckCircle2, Circle, CreditCard, LogIn } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { SmartFilter } from '@/components/smart-filter'
import { SectionHeader } from '@/components/section-header'
import { StatCard } from '@/components/stat-card'
import { PageHeader } from '@/components/page-header'
import { StatsBar } from '@/components/stats-bar'

interface Props {
  userId: string
}

const MINISTRIES = ['Deportes', 'Cocina', 'Pastor@', 'Lider de equipo', 'Logistica', 'Administración', 'Multimendia']
const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const SEX_OPTIONS = [
  { value: 'H', label: 'Hombre' },
  { value: 'M', label: 'Mujer' },
]

const emptyForm = {
  name: '',
  age: '',
  shirtSize: '',
  sex: '',
  phone: '',
  church: '',
  category: '',
  totalAmount: '',
  notes: '',
}

export function StaffClient({ userId }: Props) {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [churches, setChurches] = useState<Church[]>([])
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
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    initializeDefaults()
  }, [userId])

  async function initializeDefaults() {
    setLoading(true)
    try {
      await loadStaff()
      await loadChurches()
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  async function loadStaff() {
    const allData = await getAllStaff(userId)
    setStaffList(allData)
  }

  async function loadChurches() {
    const data = await getChurches(userId)
    setChurches(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.totalAmount)
    
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    if (!form.phone.trim()) {
      toast.error('El teléfono es obligatorio')
      return
    }
    if (!form.church.trim()) {
      toast.error('Selecciona una iglesia')
      return
    }
    if (!form.category.trim()) {
      toast.error('Selecciona un ministerio')
      return
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto total debe ser mayor a 0')
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateStaff(userId, editingId, {
            name: form.name,
            age: form.age ? parseInt(form.age) : null,
            shirtSize: form.shirtSize || null,
            sex: form.sex || null,
            phone: form.phone,
            church: form.church,
            category: form.category,
            totalAmount: amount,
            notes: form.notes,
          })
          toast.success('Personal actualizado')
        } else {
          await createStaff(userId, {
            name: form.name,
            age: form.age ? parseInt(form.age) : null,
            shirtSize: form.shirtSize || null,
            sex: form.sex || null,
            phone: form.phone,
            church: form.church,
            category: form.category,
            totalAmount: amount,
            notes: form.notes,
          })
          toast.success('Personal agregado')
        }
        setForm({ ...emptyForm })
        setEditingId(null)
        setDialogOpen(false)
        await loadStaff()
      } catch (error) {
        toast.error('Error al guardar')
      }
    })
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStaffId) return

    const amount = parseFloat(paymentForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    startTransition(async () => {
      try {
        await addStaffPayment(userId, selectedStaffId, amount, paymentForm.date, paymentForm.paymentMethod, paymentForm.notes)
        toast.success('Pago registrado')
        setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'cash', notes: '' })
        setPaymentDialogOpen(false)
        await loadStaff()
      } catch (error: any) {
        toast.error(error.message || 'Error al registrar pago')
      }
    })
  }

  async function handleDelete() {
    if (!deletingId) return
    startTransition(async () => {
      try {
        await deleteStaff(userId, deletingId)
        toast.success('Personal eliminado')
        setDeleteDialogOpen(false)
        setDeletingId(null)
        await loadStaff()
      } catch (error) {
        toast.error('Error al eliminar')
      }
    })
  }

  async function openPaymentDialog(staffId: number) {
    setSelectedStaffId(staffId)
    setPaymentDialogOpen(true)
  }

  async function openHistoryDialog(staffId: number) {
    setHistoryStaffId(staffId)
    setHistoryDialogOpen(true)
    setLoadingHistory(true)
    try {
      const history = await getStaffPayments(userId, staffId)
      setPaymentHistory(history)
    } catch (error) {
      toast.error('Error al cargar historial')
    }
    setLoadingHistory(false)
  }

  async function handleDeletePayment(paymentId: number) {
    if (!historyStaffId) return
    try {
      await deleteStaffPayment(userId, paymentId)
      toast.success('Pago eliminado')
      const history = await getStaffPayments(userId, historyStaffId)
      setPaymentHistory(history)
      await loadStaff()
    } catch (error) {
      toast.error('Error al eliminar pago')
    }
  }

  async function handleToggleCheckIn(staffId: number, currentStatus: boolean) {
    startTransition(async () => {
      try {
        await toggleCheckIn(userId, staffId, !currentStatus)
        await loadStaff()
        toast.success(currentStatus ? 'Check-in removido' : 'Check-in registrado')
      } catch (error) {
        toast.error('Error al actualizar check-in')
      }
    })
  }

  async function handleExport() {
    try {
      const data = staffList.map((s) => ({
        Nombre: s.name,
        Sexo: s.sex === 'H' ? 'Hombre' : s.sex === 'M' ? 'Mujer' : s.sex,
        'Talla Camisa': s.shirtSize,
        Teléfono: s.phone,
        Iglesia: s.church,
        Ministerio: s.category,
        'Monto Total': parseFloat(s.totalAmount as string),
        Pagado: parseFloat(s.amountPaid as string),
        'Falta Pagar': parseFloat(s.totalAmount as string) - parseFloat(s.amountPaid as string),
        Estado: s.status,
        'Check-in': s.checkedIn ? 'Sí' : 'No',
        Notas: s.notes,
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Staff')
      XLSX.writeFile(wb, 'staff.xlsx')
      toast.success('Archivo exportado')
    } catch (error) {
      toast.error('Error al exportar')
    }
  }

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.toLowerCase().includes(search.toLowerCase()) ||
      s.church?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    const matchesCategory = !categoryFilter || s.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const totalAmount = staffList.reduce((sum, s) => sum + parseFloat(s.totalAmount as string), 0)
  const totalPaid = staffList.reduce((sum, s) => sum + parseFloat(s.amountPaid as string), 0)
  const totalPending = totalAmount - totalPaid

  return (
    <div className="space-y-6">
      <PageHeader title="Personal" description="Gestiona el personal de los diferentes ministerios" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monto Total"
          value={formatMXN(totalAmount)}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Pagado"
          value={formatMXN(totalPaid)}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Pendiente"
          value={formatMXN(totalPending)}
          icon={Circle}
          color="red"
        />
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nombre, teléfono o iglesia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => { setEditingId(null); setForm({ ...emptyForm }); setDialogOpen(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Ministerio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {MINISTRIES.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Cargando...
          </CardContent>
        </Card>
      ) : filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No hay personal registrado
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredStaff.map((member) => {
            const totalAmount = parseFloat(member.totalAmount as string)
            const amountPaid = parseFloat(member.amountPaid as string)
            const percentage = totalAmount > 0 ? (amountPaid / totalAmount) * 100 : 0
            
            return (
              <Card key={member.id} className="overflow-hidden">
                <CardContent className="pt-4 pb-3">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{member.name}</h3>
                          <Badge variant={member.status === 'paid' ? 'default' : member.status === 'partial' ? 'secondary' : 'destructive'}>
                            {member.status === 'paid' ? 'Pagado' : member.status === 'partial' ? 'Parcial' : 'Pendiente'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <p>{member.age ? `${member.age} años` : ''} {member.sex === 'H' ? 'Hombre' : member.sex === 'M' ? 'Mujer' : ''} {member.shirtSize ? `- Talla ${member.shirtSize}` : ''}</p>
                          <p>{member.phone}</p>
                          <p>{member.church} • {member.category}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleCheckIn(member.id, member.checkedIn)}
                          title={member.checkedIn ? 'Remove check-in' : 'Mark check-in'}
                        >
                          <LogIn className={`w-4 h-4 ${member.checkedIn ? 'text-green-600' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openHistoryDialog(member.id)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditingId(member.id); setForm({ name: member.name, age: member.age?.toString() || '', shirtSize: member.shirtSize || '', sex: member.sex || '', phone: member.phone || '', church: member.church || '', category: member.category || '', totalAmount: member.totalAmount.toString(), notes: member.notes || '' }); setDialogOpen(true) }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setDeletingId(member.id); setDeleteDialogOpen(true) }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progreso de pago</span>
                        <span className="font-semibold">{formatMXN(amountPaid)} / {formatMXN(totalAmount)}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>

                    {/* Buttons */}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => openPaymentDialog(member.id)}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Registrar Pago
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Monto</Label>
              <Input
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fecha</Label>
              <Input
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Método</Label>
              <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}>
                <SelectTrigger className="h-8 text-xs">
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
              <Label className="text-xs text-muted-foreground">Notas</Label>
              <Input
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Notas adicionales"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar Pago'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Personal' : 'Agregar Personal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Edad</Label>
                <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sexo</Label>
                <Select value={form.sex} onValueChange={(value) => setForm({ ...form, sex: value })}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEX_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Talla</Label>
                <Select value={form.shirtSize} onValueChange={(value) => setForm({ ...form, shirtSize: value })}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Talla" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIRT_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Teléfono *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10 dígitos" required />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Iglesia *</Label>
              <Select value={form.church} onValueChange={(value) => setForm({ ...form, church: value })}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecciona iglesia" />
                </SelectTrigger>
                <SelectContent>
                  {churches.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ministerio *</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecciona ministerio" />
                </SelectTrigger>
                <SelectContent>
                  {MINISTRIES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Monto Total ($) *</Label>
              <Input type="number" step="0.01" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} placeholder="0.00" required />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Notas</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas adicionales" />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historial de Pagos</DialogTitle>
          </DialogHeader>
          {loadingHistory ? (
            <p className="text-center text-muted-foreground">Cargando...</p>
          ) : paymentHistory.length === 0 ? (
            <p className="text-center text-muted-foreground">Sin pagos registrados</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="text-sm">
                    <p className="font-semibold">{formatMXN(parseFloat(payment.amount as string))}</p>
                    <p className="text-xs text-muted-foreground">{payment.paymentDate} • {payment.paymentMethod}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeletePayment(payment.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar personal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará todo el historial de pagos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
