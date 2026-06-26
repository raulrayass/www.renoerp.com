'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  getAttendees,
  createAttendee,
  updateAttendee,
  deleteAttendee,
  addAttendeePayment,
  deleteAttendeePayment,
  getAttendeePayments,
  bulkCreateAttendees,
} from '@/app/actions/attendees'
import { Attendee, AttendeePayment } from '@/lib/db/schema'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, DollarSign, Upload, Download, Edit2, Eye } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Props {
  userId: string
}

export function AttendeesClient({ userId }: Props) {
  const router = useRouter()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [payments, setPayments] = useState<Record<number, AttendeePayment[]>>({})
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewPaymentsDialogOpen, setViewPaymentsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', totalAmount: '', notes: '' })
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' })

  useEffect(() => {
    getAttendees(userId).then(setAttendees)
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const totalAmount = parseFloat(form.totalAmount)
      if (isNaN(totalAmount) || totalAmount <= 0) {
        alert('El monto debe ser mayor a 0')
        return
      }

      if (editingId) {
        await updateAttendee(userId, editingId, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          totalAmount,
          notes: form.notes,
        })
      } else {
        await createAttendee(userId, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          totalAmount,
          notes: form.notes,
        })
      }

      setDialogOpen(false)
      setForm({ name: '', email: '', phone: '', totalAmount: '', notes: '' })
      setEditingId(null)
      const updated = await getAttendees(userId)
      setAttendees(updated)
    })
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAttendeeId) return

    startTransition(async () => {
      const amount = parseFloat(paymentForm.amount)
      if (isNaN(amount) || amount <= 0) {
        alert('El monto debe ser mayor a 0')
        return
      }

      await addAttendeePayment(userId, selectedAttendeeId, amount, paymentForm.paymentDate, paymentForm.notes)

      setPaymentDialogOpen(false)
      setPaymentForm({ amount: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' })
      const updated = await getAttendees(userId)
      setAttendees(updated)

      const attendeePayments = await getAttendeePayments(userId, selectedAttendeeId)
      setPayments((prev) => ({ ...prev, [selectedAttendeeId]: attendeePayments }))
    })
  }

  const handleDelete = async () => {
    if (!deletingId) return
    startTransition(async () => {
      await deleteAttendee(userId, deletingId)
      setDeleteDialogOpen(false)
      setDeletingId(null)
      const updated = await getAttendees(userId)
      setAttendees(updated)
    })
  }

  const handleEdit = (attendee: Attendee) => {
    setEditingId(attendee.id)
    setForm({
      name: attendee.name,
      email: attendee.email || '',
      phone: attendee.phone || '',
      totalAmount: attendee.totalAmount as string,
      notes: attendee.notes || '',
    })
    setDialogOpen(true)
  }

  const handleExportExcel = () => {
    const data = attendees.map((a) => ({
      Nombre: a.name,
      Email: a.email || '',
      Teléfono: a.phone || '',
      'Monto Total': parseFloat(a.totalAmount as string),
      'Monto Pagado': parseFloat(a.amountPaid as string),
      'Monto Faltante': Math.max(0, parseFloat(a.totalAmount as string) - parseFloat(a.amountPaid as string)),
      Estatus: a.status,
      Notas: a.notes || '',
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, 'Asistentes')

    // Format currency columns
    ws['D1'].z = '$#,##0.00'
    ws['E1'].z = '$#,##0.00'
    ws['F1'].z = '$#,##0.00'

    XLSX.writeFile(wb, `asistentes-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const data = event.target?.result as ArrayBuffer
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        const attendeesList = jsonData.map((row) => ({
          name: row.Nombre || '',
          email: row.Email || '',
          phone: row.Teléfono || '',
          totalAmount: parseFloat(row['Monto Total'] || 0),
          notes: row.Notas || '',
        })).filter((a) => a.name && a.totalAmount > 0)

        if (attendeesList.length === 0) {
          alert('No se encontraron asistentes válidos en el archivo')
          return
        }

        startTransition(async () => {
          const created = await bulkCreateAttendees(userId, attendeesList)
          const updated = await getAttendees(userId)
          setAttendees(updated)
          alert(`Se agregaron ${created.length} asistentes exitosamente`)
        })
      } catch (error) {
        alert('Error al procesar el archivo Excel')
        console.error(error)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'destructive',
      partial: 'secondary',
      paid: 'default',
    }
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      partial: 'Parcial',
      paid: 'Pagado',
    }
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>
  }

  const getProgressPercent = (attendee: Attendee) => {
    const total = parseFloat(attendee.totalAmount as string)
    if (total === 0) return 0
    return Math.min(100, (parseFloat(attendee.amountPaid as string) / total) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asistentes</h1>
          <p className="text-muted-foreground">Gestiona los asistentes y su control de pagos</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </Button>

          <label className="relative inline-block">
            <Button variant="outline" size="sm" className="flex items-center gap-2 pointer-events-none">
              <Upload className="w-4 h-4" />
              Importar Excel
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportExcel}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>

          <Button onClick={() => {
            setEditingId(null)
            setForm({ name: '', email: '', phone: '', totalAmount: '', notes: '' })
            setDialogOpen(true)
          }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Tabla de asistentes */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Asistentes</CardTitle>
          <CardDescription>Total: {attendees.length} | Pagados: {attendees.filter(a => a.status === 'paid').length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendees.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No hay asistentes registrados</p>
            ) : (
              <div className="space-y-3">
                {attendees.map((attendee) => (
                  <div key={attendee.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{attendee.name}</h3>
                          {getStatusBadge(attendee.status)}
                        </div>
                        {attendee.email && <p className="text-xs text-muted-foreground">{attendee.email}</p>}
                        {attendee.notes && <p className="text-xs text-muted-foreground italic">{attendee.notes}</p>}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            setSelectedAttendeeId(attendee.id)
                            const attnPayments = await getAttendeePayments(userId, attendee.id)
                            setPayments((prev) => ({ ...prev, [attendee.id]: attnPayments }))
                            setViewPaymentsDialogOpen(true)
                          }}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(attendee)}
                          className="gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAttendeeId(attendee.id)
                            setPaymentForm({
                              amount: '',
                              paymentDate: new Date().toISOString().split('T')[0],
                              notes: '',
                            })
                            setPaymentDialogOpen(true)
                          }}
                          className="gap-1"
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingId(attendee.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="gap-1 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progreso de Pago</span>
                        <span className="font-medium">
                          ${parseFloat(attendee.amountPaid as string).toFixed(2)} / ${parseFloat(attendee.totalAmount as string).toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${getProgressPercent(attendee)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Faltante: ${Math.max(0, parseFloat(attendee.totalAmount as string) - parseFloat(attendee.amountPaid as string)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (open) {
            // Reset form when opening dialog for new attendee (not editing)
            if (!editingId) {
              setForm({ name: '', email: '', phone: '', totalAmount: '', notes: '' })
            }
          } else {
            // Reset form when closing dialog
            setForm({ name: '', email: '', phone: '', totalAmount: '', notes: '' })
            setEditingId(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Asistente' : 'Agregar Asistente'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="totalAmount">Monto Total (MXN)</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Información adicional"
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            {selectedAttendeeId && (
              <DialogDescription>
                {attendees.find((a) => a.id === selectedAttendeeId)?.name}
              </DialogDescription>
            )}
          </DialogHeader>

          <form onSubmit={handleAddPayment} className="space-y-4">
            <div>
              <Label htmlFor="amount">Monto del Pago (MXN)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="paymentDate">Fecha de Pago</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="paymentNotes">Notas</Label>
              <Input
                id="paymentNotes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Referencia, método de pago, etc."
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewPaymentsDialogOpen} onOpenChange={setViewPaymentsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Historial de Pagos</DialogTitle>
            {selectedAttendeeId && (
              <DialogDescription>
                {attendees.find((a) => a.id === selectedAttendeeId)?.name}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedAttendeeId && payments[selectedAttendeeId]?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay pagos registrados</p>
            ) : (
              selectedAttendeeId && payments[selectedAttendeeId]?.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-3 flex justify-between items-start gap-2">
                  <div>
                    <p className="font-medium">${parseFloat(payment.amount as string).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{payment.paymentDate}</p>
                    {payment.notes && <p className="text-xs text-muted-foreground">{payment.notes}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      startTransition(async () => {
                        await deleteAttendeePayment(userId, payment.id)
                        const updated = await getAttendees(userId)
                        setAttendees(updated)
                        if (selectedAttendeeId) {
                          const attnPayments = await getAttendeePayments(userId, selectedAttendeeId)
                          setPayments((prev) => ({ ...prev, [selectedAttendeeId]: attnPayments }))
                        }
                      })
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este asistente? Se eliminarán todos sus pagos también.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            Eliminar
          </AlertDialogAction>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
