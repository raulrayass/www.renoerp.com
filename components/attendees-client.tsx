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
} from '@/app/actions/attendees'
import { getChurches, initializeDefaultChurches } from '@/app/actions/churches'
import { Attendee, AttendeePayment, Church } from '@/lib/db/schema'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, DollarSign, Upload, Download, Edit2, Users } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Props {
  userId: string
}

export function AttendeesClient({ userId }: Props) {
  const [attendeeList, setAttendeeList] = useState<Attendee[]>([])
  const [churches, setChurches] = useState<Church[]>([])
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    church: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    totalAmount: '',
    notes: '',
  })
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    initializeDefaults()
  }, [userId])

  async function initializeDefaults() {
    try {
      await initializeDefaultChurches(userId)
    } catch (error) {
      console.error('Error initializing default churches:', error)
    }
    await loadAttendees()
    await loadChurches()
  }

  async function loadAttendees() {
    const data = await getAttendees(userId)
    setAttendeeList(data)
  }

  async function loadChurches() {
    const data = await getChurches(userId)
    setChurches(data)
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
            phone: form.phone,
            church: form.church,
            emergencyContactName: form.emergencyContactName,
            emergencyContactPhone: form.emergencyContactPhone,
            totalAmount: amount,
            notes: form.notes,
          })
        } else {
          await createAttendee(userId, {
            name: form.name,
            phone: form.phone,
            church: form.church,
            emergencyContactName: form.emergencyContactName,
            emergencyContactPhone: form.emergencyContactPhone,
            totalAmount: amount,
            notes: form.notes,
          })
        }
        setDialogOpen(false)
        setForm({
          name: '',
          phone: '',
          church: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          totalAmount: '',
          notes: '',
        })
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
      const attendee = attendeeList.find((a) => a.id === selectedAttendeeId)
      if (!attendee) return

      if (isNaN(amount) || amount <= 0) {
        alert('El monto debe ser mayor a 0')
        return
      }

      const totalAmount = parseFloat(attendee.totalAmount as string)
      const alreadyPaid = parseFloat(attendee.amountPaid as string)
      const remaining = totalAmount - alreadyPaid

      if (amount > remaining) {
        alert(
          `No puedes registrar más de $${remaining.toFixed(2)}. El asistente aún debe $${remaining.toFixed(2)} de $${totalAmount.toFixed(2)}`
        )
        return
      }

      try {
        await addAttendeePayment(userId, selectedAttendeeId, amount, paymentForm.date, paymentForm.notes)
        setPaymentDialogOpen(false)
        setPaymentForm({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        })
        setSelectedAttendeeId(null)
        await loadAttendees()
      } catch (error) {
        alert('Error al registrar pago')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteAttendee(userId, id)
        await loadAttendees()
      } catch (error) {
        alert('Error al eliminar asistente')
        console.error(error)
      }
    })
  }

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      [
        'Nombre',
        'Teléfono',
        'Iglesia',
        'Contacto Emergencia',
        'Teléfono Emergencia',
        'Monto Total ($)',
        'Pago Inicial ($)',
        'Notas',
      ],
      [
        'Juan García',
        '5551234567',
        'Iglesia Central',
        'Maria García',
        '5559876543',
        '2000',
        '0',
        'Ejemplo',
      ],
      [
        'María López',
        '5559876543',
        'Iglesia del Calvario',
        'Carlos López',
        '5551111111',
        '1800',
        '500',
        'Con pago inicial',
      ],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Asistentes')
    XLSX.writeFile(wb, 'Plantilla_Asistentes.xlsx')
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
          alert('El archivo debe contener al menos una fila de datos')
          return
        }

        const attendeesToImport = rows.slice(1).map((row) => ({
          name: String(row[0] || '').trim(),
          phone: String(row[1] || '').trim(),
          church: String(row[2] || '').trim(),
          emergencyContactName: String(row[3] || '').trim(),
          emergencyContactPhone: String(row[4] || '').trim(),
          totalAmount: parseFloat(String(row[5] || '0')),
          initialPayment: parseFloat(String(row[6] || '0')) || 0,
          notes: String(row[7] || '').trim(),
        }))

        if (
          attendeesToImport.every(
            (a) =>
              a.name &&
              a.totalAmount > 0 &&
              a.church &&
              a.emergencyContactName &&
              a.emergencyContactPhone
          )
        ) {
          await bulkCreateAttendees(userId, attendeesToImport)
          alert(`${attendeesToImport.length} asistentes importados exitosamente`)
          await loadAttendees()
        } else {
          alert('Algunos registros están incompletos. Verifica todos los campos requeridos.')
        }
      }
      reader.readAsBinaryString(file)
    } catch (error) {
      alert('Error al procesar el archivo')
      console.error(error)
    }
  }

  function exportCurrentData() {
    const data = attendeeList.map((a) => {
      const total = parseFloat(a.totalAmount as string)
      const paid = parseFloat(a.amountPaid as string)
      const remaining = total - paid
      return {
        Nombre: a.name,
        Teléfono: a.phone || '',
        Iglesia: a.church || 'Sin iglesia',
        'Contacto Emergencia': a.emergencyContactName || '',
        'Teléfono Emergencia': a.emergencyContactPhone || '',
        'Monto Total ($)': total.toFixed(2),
        'Pagado ($)': paid.toFixed(2),
        'Falta Pagar ($)': remaining.toFixed(2),
        Estado: a.status === 'paid' ? 'Pagado' : a.status === 'partial' ? 'Parcial' : 'Pendiente',
        Notas: a.notes || '',
      }
    })
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Asistentes')
    XLSX.writeFile(wb, `Asistentes_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-4 px-0">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Asistentes</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Total: {attendeeList.length} | Pagados: {attendeeList.filter((a) => a.status === 'paid').length}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={downloadTemplate} variant="outline" size="sm" className="gap-1 text-xs sm:text-sm hover:bg-slate-100">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Plantilla</span>
          </Button>
          <label className="relative inline-block">
            <Button variant="outline" size="sm" className="gap-1 text-xs sm:text-sm hover:bg-slate-100 pointer-events-none">
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Importar</span>
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
          <Button onClick={exportCurrentData} variant="outline" size="sm" className="gap-1 text-xs sm:text-sm hover:bg-slate-100">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1 text-xs sm:text-sm ml-auto bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </div>
      </div>

      {/* Attendees List */}
      {attendeeList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Users className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Sin asistentes registrados</h3>
              <p className="text-sm text-muted-foreground">Comienza agregando asistentes usando el botón "Agregar" o importando un archivo Excel</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Agregar primer asistente
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {attendeeList
            .sort((a, b) => {
              const statusOrder: { [key: string]: number } = { paid: 0, partial: 1, pending: 2 }
              const statusDiff = (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3)
              if (statusDiff !== 0) return statusDiff
              return a.name.localeCompare(b.name)
            })
            .map((attendee) => {
              const total = parseFloat(attendee.totalAmount as string)
              const paid = parseFloat(attendee.amountPaid as string)
              const percentage = (paid / total) * 100

              return (
                <Card key={attendee.id} className="overflow-hidden">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{attendee.name}</h3>
                            <Badge
                              variant={attendee.status === 'paid' ? 'default' : attendee.status === 'partial' ? 'secondary' : 'outline'}
                              className="shrink-0 text-xs"
                            >
                              {attendee.status === 'paid' ? 'Pagado' : attendee.status === 'partial' ? 'Parcial' : 'Pendiente'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {attendee.church && <p>Iglesia: {attendee.church}</p>}
                            {attendee.phone && <p>Tel: {attendee.phone}</p>}
                            {attendee.emergencyContactName && (
                              <p>Emergencia: {attendee.emergencyContactName} ({attendee.emergencyContactPhone})</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            onClick={() => {
                              setSelectedAttendeeId(attendee.id)
                              setPaymentDialogOpen(true)
                            }}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            title="Registrar pago"
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingId(attendee.id)
                              setForm({
                                name: attendee.name,
                                phone: attendee.phone || '',
                                church: attendee.church || '',
                                emergencyContactName: attendee.emergencyContactName || '',
                                emergencyContactPhone: attendee.emergencyContactPhone || '',
                                totalAmount: total.toString(),
                                notes: attendee.notes || '',
                              })
                              setDialogOpen(true)
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                            title="Editar asistente"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            onClick={() => {
                              setDeletingId(attendee.id)
                              setDeleteDialogOpen(true)
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-100"
                            title="Eliminar asistente"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Progreso de pago</span>
                          <span className="font-semibold">
                            ${paid.toFixed(2)} / ${total.toFixed(2)}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (open) {
            if (!editingId) {
              setForm({
                name: '',
                phone: '',
                church: '',
                emergencyContactName: '',
                emergencyContactPhone: '',
                totalAmount: '',
                notes: '',
              })
            }
          } else {
            setForm({
              name: '',
              phone: '',
              church: '',
              emergencyContactName: '',
              emergencyContactPhone: '',
              totalAmount: '',
              notes: '',
            })
            setEditingId(null)
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar asistente' : 'Agregar asistente'}</DialogTitle>
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
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="5551234567"
              />
            </div>
            <div>
              <Label htmlFor="church">Iglesia *</Label>
              <Select value={form.church} onValueChange={(value) => setForm({ ...form, church: value })}>
                <SelectTrigger id="church">
                  <SelectValue placeholder="Selecciona una iglesia" />
                </SelectTrigger>
                <SelectContent>
                  {churches.length > 0 ? (
                    churches.map((church) => (
                      <SelectItem key={church.id} value={church.name}>
                        {church.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-muted-foreground text-center">
                      Agrega iglesias en la sección de Iglesias
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="emergencyContactName">Contacto de emergencia (Nombre) *</Label>
              <Input
                id="emergencyContactName"
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                placeholder="Maria García"
              />
            </div>
            <div>
              <Label htmlFor="emergencyContactPhone">Contacto de emergencia (Teléfono) *</Label>
              <Input
                id="emergencyContactPhone"
                value={form.emergencyContactPhone}
                onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                placeholder="5559876543"
              />
            </div>
            <div>
              <Label htmlFor="totalAmount">Monto Total ($) *</Label>
              <Input
                id="totalAmount"
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
                placeholder="Notas adicionales"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="hover:bg-slate-100">
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-400">
                {editingId ? 'Guardar Cambios' : 'Agregar Asistente'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            {selectedAttendeeId && (
              <DialogDescription className="pt-2">
                {attendeeList.find((a) => a.id === selectedAttendeeId)?.name}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedAttendeeId && attendeeList.find((a) => a.id === selectedAttendeeId) && (
            <div className="bg-muted p-3 rounded-lg space-y-1 text-sm mb-4">
              {(() => {
                const att = attendeeList.find((a) => a.id === selectedAttendeeId)!
                const total = parseFloat(att.totalAmount as string)
                const paid = parseFloat(att.amountPaid as string)
                const remaining = total - paid
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monto Total:</span>
                      <span className="font-semibold">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ya Pagado:</span>
                      <span className="font-semibold">${paid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span className="font-medium">Falta Pagar:</span>
                      <span className="font-bold">${remaining.toFixed(2)}</span>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
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
              <Label htmlFor="payment-date">Fecha del Pago *</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="payment-notes">Notas (opcional)</Label>
              <Input
                id="payment-notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Notas del pago"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)} className="hover:bg-slate-100">
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-400">
                Registrar Pago
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas eliminar este asistente y todos sus registros de pago? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDelete(deletingId)
                  setDeleteDialogOpen(false)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
