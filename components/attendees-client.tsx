'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  getAllAttendees,
  getAttendees,
  createAttendee,
  updateAttendee,
  deleteAttendee,
  addAttendeePayment,
  deleteAttendeePayment,
  getAttendeePayments,
  bulkCreateAttendees,
  toggleCheckIn,
} from '@/app/actions/attendees'
import { getChurches, initializeDefaultChurches } from '@/app/actions/churches'
import { getTeams } from '@/app/actions/teams'
import { getRooms } from '@/app/actions/rooms'
import { Attendee, AttendeePayment, Church, Team, Room } from '@/lib/db/schema'
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
import { Plus, Trash2, DollarSign, Upload, Download, Edit2, Users, History, Search, CheckCircle2, Circle, CreditCard, UserCheck } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { SmartFilter } from '@/components/smart-filter'
import { SectionHeader } from '@/components/section-header'
import { StatCard } from '@/components/stat-card'
import { PageHeader } from '@/components/page-header'

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
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactName2: '',
  emergencyContactPhone2: '',
  allergies: '',
  roomId: '',
  teamId: '',
  totalAmount: '',
  notes: '',
}

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export function AttendeesClient({ userId }: Props) {
  const [attendeeList, setAttendeeList] = useState<Attendee[]>([])
  const [churches, setChurches] = useState<Church[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [historyAttendeeId, setHistoryAttendeeId] = useState<number | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<AttendeePayment[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [churchFilter, setChurchFilter] = useState('')

  useEffect(() => {
    initializeDefaults()
  }, [userId])

  async function initializeDefaults() {
    setLoading(true)
    try {
      await initializeDefaultChurches(userId)
    } catch (error) {
      console.error('Error initializing default churches:', error)
    }
    await loadAttendees()
    await loadChurches()
    await loadTeams()
    await loadRooms()
    setLoading(false)
  }

  async function loadAttendees() {
    // Load all attendees for calculations and metrics (not paginated)
    const allData = await getAllAttendees(userId)
    setAttendeeList(allData)
  }

  async function loadChurches() {
    const data = await getChurches(userId)
    setChurches(data)
  }

  async function loadTeams() {
    const data = await getTeams(userId)
    setTeams(data)
  }

  async function loadRooms() {
    const data = await getRooms(userId)
    setRooms(data)
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
      emergencyContactName: form.emergencyContactName,
      emergencyContactPhone: form.emergencyContactPhone,
      emergencyContactName2: form.emergencyContactName2,
      emergencyContactPhone2: form.emergencyContactPhone2,
      allergies: form.allergies,
      roomId: form.roomId ? parseInt(form.roomId, 10) : null,
      teamId: form.teamId ? parseInt(form.teamId, 10) : null,
      totalAmount: amount,
      notes: form.notes,
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateAttendee(userId, editingId, payload)
          toast.success('Campero actualizado correctamente')
        } else {
          await createAttendee(userId, payload)
          toast.success('Campero agregado correctamente')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        await loadAttendees()
      } catch (error) {
        toast.error('Error al guardar el campero')
        console.error(error)
      }
    })
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAttendeeId) return

    const amount = parseFloat(paymentForm.amount)
    const attendee = attendeeList.find((a) => a.id === selectedAttendeeId)
    if (!attendee) return

    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    const totalAmount = parseFloat(attendee.totalAmount as string)
    const alreadyPaid = parseFloat(attendee.amountPaid as string)
    const remaining = totalAmount - alreadyPaid

    if (amount > remaining) {
      toast.error(`El monto excede lo pendiente. Faltan $${remaining.toFixed(2)}`)
      return
    }

    startTransition(async () => {
      try {
        await addAttendeePayment(userId, selectedAttendeeId, amount, paymentForm.date, paymentForm.notes)
        toast.success(`Pago de $${amount.toFixed(2)} registrado para ${attendee.name}`)
        setPaymentDialogOpen(false)
        setPaymentForm({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        })
        setSelectedAttendeeId(null)
        await loadAttendees()
      } catch (error) {
        toast.error('Error al registrar el pago')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteAttendee(userId, id)
        toast.success('Campero eliminado')
        await loadAttendees()
      } catch (error) {
        toast.error('Error al eliminar el campero')
        console.error(error)
      }
    })
  }

  async function handleToggleCheckIn(attendee: Attendee) {
    const next = !attendee.checkedIn
    startTransition(async () => {
      try {
        await toggleCheckIn(userId, attendee.id, next)
        toast.success(next ? `${attendee.name} registró Check-in` : `Check-in cancelado para ${attendee.name}`)
        await loadAttendees()
      } catch (error) {
        toast.error('Error al actualizar el check-in')
        console.error(error)
      }
    })
  }

  async function openHistory(attendeeId: number) {
    setHistoryAttendeeId(attendeeId)
    setHistoryDialogOpen(true)
    setLoadingHistory(true)
    try {
      const data = await getAttendeePayments(userId, attendeeId)
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
        await deleteAttendeePayment(userId, paymentId)
        toast.success('Pago eliminado')
        if (historyAttendeeId) {
          const data = await getAttendeePayments(userId, historyAttendeeId)
          setPaymentHistory(data)
        }
        await loadAttendees()
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
      'Contacto Emergencia 1',
      'Teléfono Emergencia 1',
      'Contacto Emergencia 2',
      'Teléfono Emergencia 2',
      'Alergias',
      'Equipo',
      'Habitación',
      'Monto Total ($)',
      'Pago Inicial ($)',
      'Estado',
      'Check-in',
      'Notas',
    ]

    // Descargar template vacío con una fila de ejemplo
    const rows = [
      headers,
      [
        'Nombre completo',
        '18',
        'M',
        'M',
        '3326094596',
        'Nombre iglesia',
        'Contacto emergencia',
        '3326094596',
        '',
        '',
        '',
        'Nombre equipo',
        'Nombre habitación',
        '1000',
        '0',
        'Pendiente',
        'No',
        '',
      ],
    ]

    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Camperos')
    XLSX.writeFile(wb, 'Plantilla_Camperos.xlsx')
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

        const attendeesToImport = rows.slice(1).map((row) => ({
          name: String(row[0] || '').trim(),
          age: row[1] ? parseInt(String(row[1])) : undefined,
          sex: String(row[2] || '').trim() || undefined,
          shirtSize: String(row[3] || '').trim() || undefined,
          phone: String(row[4] || '').trim() || undefined,
          church: String(row[5] || '').trim() || undefined,
          emergencyContactName: String(row[6] || '').trim() || undefined,
          emergencyContactPhone: String(row[7] || '').trim() || undefined,
          emergencyContactName2: String(row[8] || '').trim() || undefined,
          emergencyContactPhone2: String(row[9] || '').trim() || undefined,
          allergies: String(row[10] || '').trim() || undefined,
          totalAmount: parseFloat(String(row[13] || '0')),
          initialPayment: parseFloat(String(row[14] || '0')) || 0,
          notes: String(row[17] || '').trim() || undefined,
        }))

        // Validar solo campos requeridos: nombre y monto total
        if (
          attendeesToImport.every(
            (a) =>
              a.name && // Nombre es requerido
              a.totalAmount > 0 // Monto total es requerido y debe ser > 0
          )
        ) {
          await bulkCreateAttendees(userId, attendeesToImport)
          toast.success(`${attendeesToImport.length} camperos importados correctamente`)
          await loadAttendees()
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
    if (attendeeList.length === 0) {
      toast.error('No hay camperos para exportar')
      return
    }
    const data = attendeeList.map((a) => {
      const total = parseFloat(a.totalAmount as string)
      const paid = parseFloat(a.amountPaid as string)
      const remaining = total - paid
      return {
        Nombre: a.name,
        Edad: a.age || '',
        Sexo: a.sex || '',
        'Talla Camisa': a.shirtSize || '',
        Teléfono: a.phone || '',
        Iglesia: a.church || '',
        'Contacto Emergencia 1': a.emergencyContactName || '',
        'Teléfono Emergencia 1': a.emergencyContactPhone || '',
        'Contacto Emergencia 2': a.emergencyContactName2 || '',
        'Teléfono Emergencia 2': a.emergencyContactPhone2 || '',
        Alergias: a.allergies || '',
        Equipo: teamMap.get(a.teamId)?.name || '',
        Habitación: roomMap.get(a.roomId)?.name || '',
        'Monto Total ($)': total.toFixed(2),
        'Pagado ($)': paid.toFixed(2),
        'Falta Pagar ($)': remaining.toFixed(2),
        Estado: a.status === 'paid' ? 'Pagado' : a.status === 'partial' ? 'Parcial' : 'Pendiente',
        'Check-in': a.checkedIn ? 'Sí' : 'No',
        Notas: a.notes || '',
      }
    })
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Camperos')
    XLSX.writeFile(wb, `Camperos_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Reporte exportado correctamente')
  }

  // Apply smart filters
  const filteredAttendees = attendeeList.filter((a) => {
    // Smart search - searches name, phone, church simultaneously
    const searchLower = search.toLowerCase()
    const matchesSearch = !search || 
      a.name.toLowerCase().includes(searchLower) ||
      (a.phone && a.phone.includes(search)) ||
      (a.church && a.church.toLowerCase().includes(searchLower))

    // Status quick filter
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter

    // Church quick filter
    const matchesChurch = !churchFilter || a.church === churches.find(c => c.id === parseInt(churchFilter))?.name

    return matchesSearch && matchesStatus && matchesChurch
  })

  // Calculate totals based on ALL attendees (not filtered)
  const summary = attendeeList.reduce(
    (acc, a) => {
      acc.expected += parseFloat(a.totalAmount as string)
      acc.collected += parseFloat(a.amountPaid as string)
      return acc
    },
    { expected: 0, collected: 0 }
  )
  const pendingAmount = summary.expected - summary.collected
  const teamMap = new Map(teams.map((t) => [t.id, t]))
  const roomMap = new Map(rooms.map((r) => [r.id, r]))
  const checkedInCount = attendeeList.filter((a) => a.checkedIn).length
  const paidCount = attendeeList.filter((a) => a.status === 'paid').length
  const partialCount = attendeeList.filter((a) => a.status === 'partial').length
  const pendingCount = attendeeList.filter((a) => a.status === 'pending').length

  // Helper functions to get display names from IDs
  const getChurchName = (id: string) => churches.find(c => c.id === parseInt(id))?.name || ''
  const getTeamName = (id: string) => teams.find(t => t.id === parseInt(id))?.name || ''
  const getRoomName = (id: string) => rooms.find(r => r.id === parseInt(id))?.name || ''

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 flex flex-col gap-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader
        title="Camperos"
        description={`Total: ${attendeeList.length} | Pagados: ${paidCount} | Check-in: ${checkedInCount}`}
      >
        <Button onClick={downloadTemplate} variant="outline" size="sm" className="gap-1 text-xs">
          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Plantilla</span>
        </Button>
        <label className="relative inline-block">
          <Button variant="outline" size="sm" className="gap-1 text-xs pointer-events-none">
            <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Importar</span>
          </Button>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <Button onClick={exportCurrentData} variant="outline" size="sm" className="gap-1 text-xs">
          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Exportar</span>
        </Button>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1 text-xs bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Agregar</span>
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      {!loading && attendeeList.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
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
            value={`${checkedInCount}/${attendeeList.length}`}
            color="primary"
            icon={UserCheck}
            subtitle={`${paidCount} pagados • ${partialCount} parciales`}
          />
        </div>
      )}

      {/* Smart filter system */}
      {!loading && attendeeList.length > 0 && (
        <SmartFilter
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          churchFilter={churchFilter}
          onChurchChange={setChurchFilter}
          churches={churches}
          onClearFilters={() => {
            setSearch('')
            setStatusFilter('all')
            setChurchFilter('')
          }}
        />
      )}


      {/* Attendees List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col gap-3 animate-pulse">
                  <div className="h-4 w-40 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-2 w-full bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : attendeeList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Users className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Sin camperos registrados</h3>
              <p className="text-sm text-muted-foreground">Comienza agregando camperos usando el botón "Agregar" o importando un archivo Excel</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Agregar primer campero
            </Button>
          </div>
        </Card>
      ) : filteredAttendees.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Search className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No se encontraron camperos con esos filtros</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAttendees
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
                            {attendee.checkedIn && (
                              <Badge className="shrink-0 text-xs bg-green-600 hover:bg-green-600 text-white gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Check-in
                              </Badge>
                            )}
                            {attendee.teamId && teamMap.get(attendee.teamId) && (
                              <span
                                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-white shrink-0"
                                style={{ backgroundColor: teamMap.get(attendee.teamId)!.color }}
                              >
                                {teamMap.get(attendee.teamId)!.name}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {(attendee.age != null || attendee.shirtSize || attendee.sex) && (
                              <p>
                                {[
                                  attendee.age != null ? `${attendee.age} años` : null,
                                  attendee.sex,
                                  attendee.shirtSize ? `Talla ${attendee.shirtSize}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            )}
                            {attendee.church && <p>Iglesia: {attendee.church}</p>}
                            {attendee.phone && <p>Tel: {attendee.phone}</p>}
                            {attendee.roomId && roomMap.get(attendee.roomId) && (
                              <p>Habitación: {roomMap.get(attendee.roomId)!.name}</p>
                            )}
                            {attendee.emergencyContactName && (
                              <p>Emergencia: {attendee.emergencyContactName} ({attendee.emergencyContactPhone})</p>
                            )}
                            {attendee.emergencyContactName2 && (
                              <p>Emergencia 2: {attendee.emergencyContactName2} ({attendee.emergencyContactPhone2})</p>
                            )}
                            {attendee.allergies && <p className="text-amber-700">Alergias: {attendee.allergies}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            onClick={() => handleToggleCheckIn(attendee)}
                            size="sm"
                            variant="ghost"
                            className={cn(
                              'h-8 w-8 p-0',
                              attendee.checkedIn ? 'text-green-600 hover:bg-green-100' : 'hover:bg-muted'
                            )}
                            title={attendee.checkedIn ? 'Cancelar check-in' : 'Registrar check-in'}
                          >
                            {attendee.checkedIn ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          </Button>
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
                            onClick={() => openHistory(attendee.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-accent/15"
                            title="Ver historial de pagos"
                          >
                            <History className="w-4 h-4 text-accent" />
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingId(attendee.id)
                              setForm({
                                name: attendee.name,
                                age: attendee.age != null ? String(attendee.age) : '',
                                shirtSize: attendee.shirtSize || '',
                                sex: attendee.sex || '',
                                phone: attendee.phone || '',
                                church: attendee.church || '',
                                emergencyContactName: attendee.emergencyContactName || '',
                                emergencyContactPhone: attendee.emergencyContactPhone || '',
                                emergencyContactName2: attendee.emergencyContactName2 || '',
                                emergencyContactPhone2: attendee.emergencyContactPhone2 || '',
                                allergies: attendee.allergies || '',
                                roomId: attendee.roomId != null ? String(attendee.roomId) : '',
                                teamId: attendee.teamId != null ? String(attendee.teamId) : '',
                                totalAmount: total.toString(),
                                notes: attendee.notes || '',
                              })
                              setDialogOpen(true)
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                            title="Editar campero"
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
                            title="Eliminar campero"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Progreso de pago</span>
                          <span className="font-semibold">
                            {formatMXN(paid)} / {formatMXN(total)}
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
              setForm({ ...emptyForm })
            }
          } else {
            setForm({ ...emptyForm })
            setEditingId(null)
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
              <DialogTitle>{editingId ? 'Editar campero' : 'Agregar campero'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enrique Medina"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="21"
                />
              </div>
              <div>
                <Label htmlFor="shirtSize">Talla</Label>
                <Select value={form.shirtSize} onValueChange={(value) => setForm({ ...form, shirtSize: value })}>
                  <SelectTrigger id="shirtSize">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIRT_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sex">Sexo</Label>
                <Select value={form.sex} onValueChange={(value) => setForm({ ...form, sex: value })}>
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hombre">Hombre</SelectItem>
                    <SelectItem value="Mujer">Mujer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Contacto Personal (Teléfono) *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="3326094596"
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
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Agrega iglesias en la sección de Iglesias
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="emergencyContactName">Contacto emergencia 1 *</Label>
                <Input
                  id="emergencyContactName"
                  value={form.emergencyContactName}
                  onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                  placeholder="Mamá"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactPhone">Teléfono 1 *</Label>
                <Input
                  id="emergencyContactPhone"
                  value={form.emergencyContactPhone}
                  onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                  placeholder="3326094596"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="emergencyContactName2">Contacto emergencia 2</Label>
                <Input
                  id="emergencyContactName2"
                  value={form.emergencyContactName2}
                  onChange={(e) => setForm({ ...form, emergencyContactName2: e.target.value })}
                  placeholder="Papá"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactPhone2">Teléfono 2</Label>
                <Input
                  id="emergencyContactPhone2"
                  value={form.emergencyContactPhone2}
                  onChange={(e) => setForm({ ...form, emergencyContactPhone2: e.target.value })}
                  placeholder="3324255466"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="allergies">Alergias</Label>
              <Input
                id="allergies"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                placeholder="Ninguna / paraceamol / etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
            <Label htmlFor="teamId">Equipo</Label>
            <Select value={form.teamId || 'none'} onValueChange={(value) => setForm({ ...form, teamId: value === 'none' ? '' : value })}>
              <SelectTrigger id="teamId">
                {form.teamId ? <span>{getTeamName(form.teamId)}</span> : <SelectValue placeholder="Selecciona un equipo" />}
              </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin equipo</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={String(team.id)}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
            <Label htmlFor="roomId">Habitación</Label>
            <Select value={form.roomId || 'none'} onValueChange={(value) => setForm({ ...form, roomId: value === 'none' ? '' : value })}>
              <SelectTrigger id="roomId">
                {form.roomId ? <span>{getRoomName(form.roomId)}</span> : <SelectValue placeholder="Selecciona una habitación" />}
              </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin habitación</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={String(room.id)}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                placeholder="1200"
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
                {editingId ? 'Guardar Cambios' : 'Agregar Campero'}
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
                      <span className="font-semibold">{formatMXN(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ya Pagado:</span>
                      <span className="font-semibold">{formatMXN(paid)}</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span className="font-medium">Falta Pagar:</span>
                      <span className="font-bold">{formatMXN(remaining)}</span>
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
              ¿Estás seguro que deseas eliminar este campero y todos sus registros de pago? Esta acción no se puede deshacer.
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

      {/* Payment History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial de pagos</DialogTitle>
            {historyAttendeeId && (
              <DialogDescription>
                {attendeeList.find((a) => a.id === historyAttendeeId)?.name}
              </DialogDescription>
            )}
          </DialogHeader>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <History className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aún no hay abonos registrados</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(() => {
                const totalPaid = paymentHistory.reduce(
                  (sum, p) => sum + parseFloat(p.amount as string),
                  0
                )
                return (
                  <div className="flex justify-between items-center bg-accent/10 rounded-lg px-3 py-2 mb-1">
                    <span className="text-sm font-medium text-foreground">Total abonado</span>
                    <span className="text-sm font-bold text-accent">{formatMXN(totalPaid)}</span>
                  </div>
                )
              })()}
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">
                      {formatMXN(parseFloat(payment.amount as string))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.paymentDate + 'T00:00:00').toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-muted-foreground truncate">{payment.notes}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDeletePayment(payment.id)}
                    size="sm"
                    variant="ghost"
                    disabled={isPending}
                    className="h-8 w-8 p-0 hover:bg-red-100 shrink-0"
                    title="Eliminar pago"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
