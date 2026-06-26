'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  getAttendees,
  createAttendee,
  updateAttendee,
  deleteAttendee,
  addAttendeePayment,
  deleteAttendeePayment,
  getAttendeePayments,
  bulkCreateAttendees,
  generateExcelTemplate,
} from '@/app/actions/attendees'
import { Attendee, AttendeePayment } from '@/lib/db/schema'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Trash2, DollarSign, Upload, Download, Edit2, Eye } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Props {
  userId: string
}

export function AttendeesClient({ userId }: Props) {
  const [attendeeList, setAttendeeList] = useState<Attendee[]>([])
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', totalAmount: '', notes: '' })
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' })

  useEffect(() => {
    loadAttendees()
  }, [userId])

  async function loadAttendees() {
    const data = await getAttendees(userId)
    setAttendeeList(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const amount = parseFloat(form.totalAmount)
      if (!form.name.trim() || isNaN(amount) || amount <= 0) {
        alert('Por favor completa los campos correctamente')
        return
      }

      try {
        if (editingId) {
          await updateAttendee(userId, editingId, {
            name: form.name,
            email: form.email,
            phone: form.phone,
            totalAmount: amount,
            notes: form.notes,
          })
        } else {
          await createAttendee(userId, {
            name: form.name,
            email: form.email,
            phone: form.phone,
            totalAmount: amount,
            notes: form.notes,
          })
        }
        setDialogOpen(false)
        setForm({ name: '', email: '', phone: '', totalAmount: '', notes: '' })
        setEditingId(null)
        await loadAttendees()
      } catch (error) {
        alert('Error al guardar asistente')
        console.error(error)
      }
    })
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAttendeeId) return

    startTransition(async () => {
      const amount = parseFloat(paymentForm.amount)
      if (isNaN(amount) || amount <= 0) {
        alert('El monto debe ser mayor a 0')
        return
      }

      try {
        await addAttendeePayment(userId, selectedAttendeeId, amount, paymentForm.date, paymentForm.notes)
        setPaymentDialogOpen(false)
        setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' })
        setSelectedAttendeeId(null)
        await loadAttendees()
      } catch (error) {
        alert('Error al registrar pago')
        console.error(error)
      }
    })
  }

  async function handleDelete() {
    if (!deletingId) return
    startTransition(async () => {
      try {
        await deleteAttendee(userId, deletingId)
        setDeleteDialogOpen(false)
        setDeletingId(null)
        await loadAttendees()
      } catch (error) {
        alert('Error al eliminar asistente')
        console.error(error)
      }
    })
  }

  async function handleDeletePayment(paymentId: number) {
    startTransition(async () => {
      try {
        await deleteAttendeePayment(userId, paymentId)
        await loadAttendees()
      } catch (error) {
        alert('Error al eliminar pago')
        console.error(error)
      }
    })
  }

  async function downloadTemplate() {
    const template = await generateExcelTemplate()
    const ws = XLSX.utils.aoa_to_sheet([template.columns, ...template.data])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Asistentes')
    XLSX.writeFile(wb, 'Plantilla_Asistentes.xlsx')
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    startTransition(async () => {
      try {
        const reader = new FileReader()
        reader.onload = async (event) => {
          const data = event.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[]

          if (rows.length < 2) {
            alert('El archivo debe tener al menos una fila de datos')
            return
          }

          const attendeesToImport = rows.slice(1).map((row) => ({
            name: String(row[0] || '').trim(),
            email: String(row[1] || '').trim(),
            phone: String(row[2] || '').trim(),
            totalAmount: parseFloat(row[3]) || 0,
            notes: String(row[4] || '').trim(),
          }))

          const valid = attendeesToImport.filter((a) => a.name && a.totalAmount > 0)
          if (valid.length === 0) {
            alert('No hay asistentes válidos para importar')
            return
          }

          await bulkCreateAttendees(userId, valid)
          await loadAttendees()
          alert(`Se importaron ${valid.length} asistentes correctamente`)
        }
        reader.readAsBinaryString(file)
      } catch (error) {
        alert('Error al importar archivo')
        console.error(error)
      }
    })
  }

  async function exportCurrentData() {
    if (attendeeList.length === 0) {
      alert('No hay asistentes para exportar')
      return
    }

    const data = attendeeList.map((a) => [
      a.name,
      a.email || '',
      a.phone || '',
      parseFloat(a.totalAmount as string),
      parseFloat(a.amountPaid as string),
      a.status,
      a.notes || '',
    ])

    const ws = XLSX.utils.aoa_to_sheet([
      ['Nombre', 'Correo', 'Teléfono', 'Monto Total', 'Monto Pagado', 'Estado', 'Notas'],
      ...data,
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Asistentes')
    XLSX.writeFile(wb, `Asistentes_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Asistentes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Total: {attendeeList.length} | Pagados: {attendeeList.filter((a) => a.status === 'paid').length}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={downloadTemplate} variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Plantilla
          </Button>
          <label className="relative inline-block">
            <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
              <Upload className="w-4 h-4" />
              Importar
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
          <Button onClick={exportCurrentData} variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Attendees List */}
      {attendeeList.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No hay asistentes registrados</p>
            <Button onClick={() => setDialogOpen(true)} variant="link" className="mt-2">
              Crear el primero
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {attendeeList.map((attendee) => {
            const paid = parseFloat(attendee.amountPaid as string)
            const total = parseFloat(attendee.totalAmount as string)
            const percentage = (paid / total) * 100
            return (
              <Card key={attendee.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{attendee.name}</h3>
                        <Badge
                          variant={attendee.status === 'paid' ? 'default' : attendee.status === 'partial' ? 'secondary' : 'outline'}
                          className="shrink-0"
                        >
                          {attendee.status === 'paid' ? 'Pagado' : attendee.status === 'partial' ? 'Parcial' : 'Pendiente'}
                        </Badge>
                      </div>
                      {attendee.email && <p className="text-xs text-muted-foreground">{attendee.email}</p>}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progreso de pago</span>
                          <span className="font-semibold">
                            ${paid.toFixed(2)} / ${total.toFixed(2)}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={() => {
                          setSelectedAttendeeId(attendee.id)
                          setPaymentDialogOpen(true)
                        }}
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span className="hidden sm:inline">Pago</span>
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(attendee.id)
                          setForm({
                            name: attendee.name,
                            email: attendee.email || '',
                            phone: attendee.phone || '',
                            totalAmount: total.toString(),
                            notes: attendee.notes || '',
                          })
                          setDialogOpen(true)
                        }}
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      <Button
                        onClick={() => {
                          setDeletingId(attendee.id)
                          setDeleteDialogOpen(true)
                        }}
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Asistente' : 'Agregar Asistente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Juan García"
              />
            </div>
            <div>
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="juan@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="5551234567"
              />
            </div>
            <div>
              <Label htmlFor="amount">Monto Total ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                placeholder="2000"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Joven participante"
              />
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {editingId ? 'Actualizar' : 'Guardar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div>
              <Label htmlFor="payment-amount">Monto del Pago ($) *</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="payment-date">Fecha de Pago</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="payment-notes">Notas</Label>
              <Input
                id="payment-notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Primera mitad del pago"
              />
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              Registrar Pago
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Asistente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los pagos registrados del asistente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
