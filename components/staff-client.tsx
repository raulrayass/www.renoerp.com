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
  MINISTRIES,
} from '@/app/actions/staff'
import { Staff, StaffPayment } from '@/lib/db/schema'
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
import { Plus, Trash2, DollarSign, Upload, Download, Edit2, Users, History, Search, CheckCircle2, Circle, CreditCard, UserCheck, Users2, LogIn } from 'lucide-react'
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

const emptyForm = {
  name: '',
  age: '',
  shirtSize: '',
  sex: '',
  phone: '',
  church: '',
  category: '',
  totalAmount: '',
  discount: 0,
  notes: '',
}

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

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
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  async function loadStaff() {
    const allData = await getAllStaff(userId)
    setStaffList(allData)
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
    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto total debe ser mayor a 0')
      return
    }

    const payload = {
      name: form.name,
      age: form.age ? parseInt(form.age, 10) : null,
      shirtSize: form.shirtSize,
      sex: form.sex,
      phone: form.phone,
      church: form.church,
      category: form.category,
      totalAmount: amount,
      discount: form.discount,
      notes: form.notes,
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateStaff(userId, editingId, payload)
          toast.success('Personal actualizado correctamente')
        } else {
          await createStaff(userId, payload)
          toast.success('Personal agregado correctamente')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        await loadStaff()
      } catch (error) {
        toast.error('Error al guardar el personal')
        console.error(error)
      }
    })
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStaffId) return

    const amount = parseFloat(paymentForm.amount)
    const staffMember = staffList.find((s) => s.id === selectedStaffId)
    if (!staffMember) return

    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    const originalTotal = parseFloat(staffMember.totalAmount as string)
    const discount = staffMember.discount || 0
    const totalAmount = originalTotal * (1 - discount / 100)
    const alreadyPaid = parseFloat(staffMember.amountPaid as string)
    const remaining = totalAmount - alreadyPaid

    if (amount > remaining) {
      toast.error(`El monto excede lo pendiente. Faltan $${remaining.toFixed(2)}`)
      return
    }

    startTransition(async () => {
      try {
        await addStaffPayment(userId, selectedStaffId, amount, paymentForm.date, paymentForm.paymentMethod, paymentForm.notes)
        toast.success(`Pago de $${amount.toFixed(2)} registrado para ${staffMember.name}`)
        setPaymentDialogOpen(false)
        setPaymentForm({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
          notes: '',
        })
        setSelectedStaffId(null)
        await loadStaff()
      } catch (error) {
        toast.error('Error al registrar el pago')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteStaff(userId, id)
        toast.success('Personal eliminado')
        await loadStaff()
      } catch (error) {
        toast.error('Error al eliminar el personal')
        console.error(error)
      }
    })
  }

  async function handleToggleCheckIn(staffMember: Staff) {
    const next = !staffMember.checkedIn
    startTransition(async () => {
      try {
        await toggleCheckIn(userId, staffMember.id, next)
        toast.success(next ? `${staffMember.name} registró Check-in` : `Check-in cancelado para ${staffMember.name}`)
        await loadStaff()
      } catch (error) {
        toast.error('Error al actualizar el check-in')
        console.error(error)
      }
    })
  }

  async function openHistory(staffId: number) {
    setHistoryStaffId(staffId)
    setHistoryDialogOpen(true)
    setLoadingHistory(true)
    try {
      const data = await getStaffPayments(userId, staffId)
      setPaymentHistory(data)
    } catch (error) {
      toast.error('Error al cargar el historial de pagos')
      console.error(error)
    } finally {
      setLoadingHistory(false)
    }
  }

  async function handleDeletePayment(paymentId: number) {
    startTransition(async () => {
      try {
        await deleteStaffPayment(userId, paymentId)
        toast.success('Pago eliminado')
        if (historyStaffId) {
          const data = await getStaffPayments(userId, historyStaffId)
          setPaymentHistory(data)
        }
        await loadStaff()
      } catch (error) {
        toast.error('Error al eliminar el pago')
        console.error(error)
      }
    })
  }

  function downloadTemplate() {
    const headers = [
      'Nombre',
      'Edad',
      'Sexo',
      'Talla Camisa',
      'Teléfono',
      'Iglesia',
      'Ministerio',
      'Monto Total ($)',
      'Pago Inicial ($)',
      'Estado',
      'Check-in',
      'Notas',
    ]

    const rows = [
      headers,
      [
        'Enrique Medina',
        '35',
        'H',
        'M',
        '3334001726',
        'NC Zapopan',
        'Pastor',
        '1200',
        '100',
        'Pendiente',
        'No',
        '',
      ],
    ]

    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Staff')
    XLSX.writeFile(wb, 'Plantilla_Staff.xlsx')
    toast.success('Plantilla descargada')
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const workbook = XLSX.read(event.target?.result, { type: 'binary' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

        if (rows.length < 2) {
          toast.error('El archivo debe contener al menos una fila de datos')
          return
        }

        const staffToImport = rows.slice(1).map((row) => ({
          name: String(row[0] || '').trim(),
          age: row[1] ? parseInt(String(row[1])) : undefined,
          sex: String(row[2] || '').trim() || undefined,
          shirtSize: String(row[3] || '').trim() || undefined,
          phone: String(row[4] || '').trim() || undefined,
          church: String(row[5] || '').trim() || undefined,
          category: String(row[6] || '').trim() || undefined,
          totalAmount: parseFloat(String(row[7] || '0')),
          initialPayment: parseFloat(String(row[8] || '0')) || 0,
          notes: String(row[11] || '').trim() || undefined,
        }))

        if (
          staffToImport.every(
            (s) =>
              s.name &&
              s.totalAmount > 0
          )
        ) {
          await bulkCreateStaff(userId, staffToImport)
          toast.success(`${staffToImport.length} personal importado correctamente`)
          await loadStaff()
        } else {
          toast.error('Verifica que todos los registros tengan Nombre y Monto Total válidos.')
        }
      }
      reader.readAsBinaryString(file)
    } catch (error) {
      toast.error('Error al procesar el archivo')
      console.error(error)
    }
    e.target.value = ''
  }

  function exportCurrentData() {
    if (staffList.length === 0) {
      toast.error('No hay personal para exportar')
      return
    }
    const data = staffList.map((s) => {
      const originalTotal = parseFloat(s.totalAmount as string)
      const discount = s.discount || 0
      const total = originalTotal * (1 - discount / 100)
      const paid = parseFloat(s.amountPaid as string)
      const remaining = total - paid
      return {
        Nombre: s.name,
        Edad: s.age || '',
        Sexo: s.sex || '',
        'Talla Camisa': s.shirtSize || '',
        Teléfono: s.phone || '',
        Iglesia: s.church || '',
        Ministerio: s.category || '',
        'Monto Original ($)': originalTotal.toFixed(2),
        'Descuento (%)': discount,
        'Monto Total ($)': total.toFixed(2),
        'Pagado ($)': paid.toFixed(2),
        'Falta Pagar ($)': remaining.toFixed(2),
        Estado: s.status === 'paid' ? 'Pagado' : s.status === 'partial' ? 'Parcial' : 'Pendiente',
        'Check-in': s.checkedIn ? 'Sí' : 'No',
        Notas: s.notes || '',
      }
    })
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Staff')
    XLSX.writeFile(wb, `Staff_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Reporte exportado correctamente')
  }

  const filteredStaff = staffList.filter((s) => {
    const searchLower = search.toLowerCase()
    const matchesSearch = !search || 
      s.name.toLowerCase().includes(searchLower) ||
      (s.phone && s.phone.includes(search)) ||
      (s.church && s.church.toLowerCase().includes(searchLower))

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    const matchesCategory = !categoryFilter || s.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const summary = staffList.reduce(
    (acc, s) => {
      const originalTotal = parseFloat(s.totalAmount as string)
      const discount = s.discount || 0
      const total = originalTotal * (1 - discount / 100)
      acc.expected += total
      acc.collected += parseFloat(s.amountPaid as string)
      return acc
    },
    { expected: 0, collected: 0 }
  )
  const pendingAmount = summary.expected - summary.collected
  const checkedInCount = staffList.filter((s) => s.checkedIn).length
  const paidCount = staffList.filter((s) => s.status === 'paid').length
  const partialCount = staffList.filter((s) => s.status === 'partial').length

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
      <PageHeader title="Staff">
        <Button onClick={downloadTemplate} variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
          <Download className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Plantilla</span>
        </Button>
        <label className="relative inline-block">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 pointer-events-none">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Importar</span>
          </Button>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <Button onClick={exportCurrentData} variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
          <Download className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Exportar</span>
        </Button>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Agregar</span>
        </Button>
      </PageHeader>

      {!loading && staffList.length > 0 && (
        <StatsBar
          items={[
            { label: 'Total Personal', value: staffList.length, icon: <Users2 className="w-3 sm:w-4 h-3 sm:h-4" />, color: 'primary' },
            { label: 'Pagados', value: paidCount, icon: <CreditCard className="w-3 sm:w-4 h-3 sm:h-4" />, color: 'success' },
            { label: 'Check-in', value: checkedInCount, icon: <LogIn className="w-3 sm:w-4 h-3 sm:h-4" />, color: 'primary' },
          ]}
        />
      )}

      {!loading && staffList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-1.5">
          <StatCard
            label="Esperado"
            value={formatMXN(summary.expected)}
            color="blue"
            icon={DollarSign}
          />
          <StatCard
            label="Recaudado"
            value={formatMXN(summary.collected)}
            color="green"
            icon={CreditCard}
          />
          <StatCard
            label="Pendiente"
            value={formatMXN(pendingAmount)}
            color="red"
            icon={History}
          />
          <StatCard
            label="Check-in"
            value={`${checkedInCount}/${staffList.length}`}
            color="primary"
            icon={UserCheck}
            subtitle={`${paidCount} pagados • ${partialCount} parciales`}
          />
        </div>
      )}

      {!loading && staffList.length > 0 && (
        <SmartFilter
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categories={MINISTRIES}
          label="Ministerio"
        />
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay personal registrado. Haz clic en "Agregar" para comenzar.</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No se encontraron resultados con los filtros aplicados</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredStaff.map((s) => {
            const originalTotal = parseFloat(s.totalAmount as string)
            const discount = s.discount || 0
            const total = originalTotal * (1 - discount / 100)
            const paid = parseFloat(s.amountPaid as string)
            const remaining = total - paid
            const progressPercent = (paid / total) * 100

            return (
              <Card key={s.id} className={cn(
                'p-1.5 sm:p-2.5 border-l-4 transition-colors hover:bg-muted/50',
                s.status === 'paid' ? 'border-l-green-600' : s.status === 'partial' ? 'border-l-yellow-600' : 'border-l-red-600'
              )}>
                <CardContent className="p-0 space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{s.name}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5 text-xs text-muted-foreground">
                        {s.age && <span>{s.age} años</span>}
                        {s.sex && <span>•</span>}
                        {s.sex && <span>{s.sex === 'M' ? 'Mujer' : 'Hombre'}</span>}
                        {s.shirtSize && <span>•</span>}
                        {s.shirtSize && <span>Talla {s.shirtSize}</span>}
                        {s.phone && <span>•</span>}
                        {s.phone && <span>{s.phone}</span>}
                      </div>
                      {(s.church || s.category) && (
                        <div className="flex flex-wrap gap-1 mt-0.5 text-xs text-muted-foreground">
                          {s.church && <span>Iglesia: {s.church}</span>}
                          {s.category && <span>•</span>}
                          {s.category && <span>Ministerio: {s.category}</span>}
                        </div>
                      )}
                    </div>
                    <Badge variant={s.status === 'paid' ? 'default' : s.status === 'partial' ? 'secondary' : 'destructive'} className="text-xs shrink-0">
                      {s.status === 'paid' ? 'Pagado' : s.status === 'partial' ? 'Parcial' : 'Pendiente'}
                    </Badge>
                  </div>

                  <Progress value={progressPercent} className="h-1.5" />

                  <div className="flex justify-between items-end gap-2 text-xs">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-semibold">{formatMXN(total)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pagado</p>
                        <p className="font-semibold text-green-600">{formatMXN(paid)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Falta</p>
                        <p className="font-semibold text-red-600">{formatMXN(remaining)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleCheckIn(s)}
                        className="h-8 w-8 p-0"
                        title={s.checkedIn ? 'Desmarcar check-in' : 'Registrar check-in'}
                      >
                        {s.checkedIn ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStaffId(s.id)
                          setPaymentDialogOpen(true)
                        }}
                        className="h-8 w-8 p-0"
                        title="Registrar pago"
                      >
                        <DollarSign className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openHistory(s.id)}
                        className="h-8 w-8 p-0"
                        title="Ver historial"
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(s.id)
                          setForm({
                            name: s.name,
                            age: s.age?.toString() || '',
                            shirtSize: s.shirtSize || '',
                            sex: s.sex || '',
                            phone: s.phone || '',
                            church: s.church || '',
                            category: s.category || '',
                            totalAmount: (parseFloat(s.totalAmount as string) / (1 - (s.discount || 0) / 100)).toString(),
                            discount: s.discount || 0,
                            notes: s.notes || '',
                          })
                          setDialogOpen(true)
                        }}
                        className="h-8 w-8 p-0"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingId(s.id)
                          setDeleteDialogOpen(true)
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Personal' : 'Agregar Personal'}</DialogTitle>
            <DialogDescription>Completa los datos del personal</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-xs sm:text-sm">Nombre *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-8 text-xs" required />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="age" className="text-xs sm:text-sm">Edad</Label>
                <Input id="age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="h-8 text-xs" />
              </div>
              <div>
                <Label htmlFor="sex" className="text-xs sm:text-sm">Sexo</Label>
                <Select value={form.sex} onValueChange={(value) => setForm({ ...form, sex: value })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguno</SelectItem>
                    <SelectItem value="H">Hombre</SelectItem>
                    <SelectItem value="M">Mujer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="shirtSize" className="text-xs sm:text-sm">Talla</Label>
                <Select value={form.shirtSize} onValueChange={(value) => setForm({ ...form, shirtSize: value })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguna</SelectItem>
                    {SHIRT_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs sm:text-sm">Teléfono *</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-8 text-xs" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="church" className="text-xs sm:text-sm">Iglesia</Label>
                <Input id="church" value={form.church} onChange={(e) => setForm({ ...form, church: e.target.value })} className="h-8 text-xs" />
              </div>
              <div>
                <Label htmlFor="category" className="text-xs sm:text-sm">Ministerio</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguno</SelectItem>
                    {MINISTRIES.map((ministry) => (
                      <SelectItem key={ministry} value={ministry}>{ministry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="totalAmount" className="text-xs sm:text-sm">Monto Total ($) *</Label>
                <Input id="totalAmount" type="number" step="0.01" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} className="h-8 text-xs" required />
              </div>
              <div>
                <Label htmlFor="discount" className="text-xs sm:text-sm">Descuento (%)</Label>
                <Select value={form.discount.toString()} onValueChange={(value) => setForm({ ...form, discount: parseInt(value) })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Ninguno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs sm:text-sm">Notas</Label>
              <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="h-8 text-xs" />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingId(null); setForm({ ...emptyForm }); }} className="text-xs h-8">
                Cancelar
              </Button>
              <Button type="submit" className="text-xs h-8 bg-green-600 hover:bg-green-700" disabled={isPending}>
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>Ingresa los detalles del pago</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-3">
            <div>
              <Label htmlFor="amount" className="text-xs sm:text-sm">Monto ($) *</Label>
              <Input id="amount" type="number" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="h-8 text-xs" required />
            </div>
            <div>
              <Label htmlFor="date" className="text-xs sm:text-sm">Fecha *</Label>
              <Input id="date" type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} className="h-8 text-xs" required />
            </div>
            <div>
              <Label htmlFor="method" className="text-xs sm:text-sm">Método</Label>
              <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="deposit">Depósito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes" className="text-xs sm:text-sm">Notas</Label>
              <Input id="notes" value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} className="h-8 text-xs" />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)} className="text-xs h-8">
                Cancelar
              </Button>
              <Button type="submit" className="text-xs h-8 bg-green-600 hover:bg-green-700" disabled={isPending}>
                {isPending ? 'Registrando...' : 'Registrar Pago'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Historial de Pagos</DialogTitle>
            <DialogDescription>Pagos registrados para este personal</DialogDescription>
          </DialogHeader>
          {loadingHistory ? (
            <div className="text-center py-6 text-muted-foreground">Cargando...</div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">Sin pagos registrados</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {paymentHistory.map((payment) => (
                <Card key={payment.id} className="p-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 text-xs">
                      <p className="font-semibold">{formatMXN(parseFloat(payment.amount as string))}</p>
                      <p className="text-muted-foreground">{payment.paymentDate}</p>
                      <p className="text-muted-foreground capitalize">{payment.paymentMethod === 'cash' ? 'Efectivo' : payment.paymentMethod === 'transfer' ? 'Transferencia' : 'Depósito'}</p>
                      {payment.notes && <p className="text-muted-foreground">{payment.notes}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePayment(payment.id)}
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar personal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el personal y todos sus pagos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="text-xs h-8">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDelete(deletingId)
                  setDeleteDialogOpen(false)
                  setDeletingId(null)
                }
              }}
              className="text-xs h-8 bg-red-600 hover:bg-red-700"
              disabled={isPending}
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
