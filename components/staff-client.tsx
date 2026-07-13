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
  bulkDeleteStaff,
} from '@/app/actions/staff'
import { getChurches } from '@/app/actions/churches'
import { getTeams } from '@/app/actions/teams'
import { getRooms } from '@/app/actions/rooms'
import { Staff, StaffPayment, Church, Team, Room } from '@/lib/db/schema'
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
  phone: '',
  church: '',
  ministry: '',
  role: '',
  isTeamLead: false,
  leadTeamId: '',
  totalAmount: '',
  notes: '',
}

export function StaffClient({ userId }: Props) {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [churches, setChurches] = useState<Church[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
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
  const [historyStaffId, setHistoryAttendeeId] = useState<number | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<StaffPayment[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [churchFilter, setChurchFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [roomFilter, setRoomFilter] = useState('')

  useEffect(() => {
    initializeDefaults()
  }, [userId])

  async function initializeDefaults() {
    setLoading(true)
    try {
      await loadStaff()
      await loadChurches()
      await loadTeams()
      await loadRooms()
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  async function loadStaff() {
    // Load all staff for calculations and metrics (not paginated)
    const allData = await getAllStaff(userId)
    setStaffList(allData)
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
          await updateStaff(userId, editingId, payload)
          toast.success('Staff Member actualizado correctamente')
        } else {
          await createStaff(userId, payload)
          toast.success('Staff Member agregado correctamente')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        await loadStaff()
      } catch (error) {
        toast.error('Error al guardar el staff member')
        console.error(error)
      }
    })
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStaffId) return

    const amount = parseFloat(paymentForm.amount)
    const staffMember = staffList.find((a) => a.id === selectedStaffId)
    if (!staffMember) return

    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    const totalAmount = parseFloat(staffMember.totalAmount as string)
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
        toast.success('Staff Member eliminado')
        await loadStaff()
      } catch (error) {
        toast.error('Error al eliminar el staff member')
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
    XLSX.utils.book_append_sheet(wb, ws, 'Staff Members')
    XLSX.writeFile(wb, 'Plantilla_Staff Members.xlsx')
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
          staffToImport.every(
            (a) =>
              a.name && // Nombre es requerido
              a.totalAmount > 0 // Monto total es requerido y debe ser > 0
          )
        ) {
          await bulkCreateStaff(userId, staffToImport)
          toast.success(`${staffToImport.length} staff members importados correctamente`)
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
      toast.error('No hay staff members para exportar')
      return
    }
    const data = staffList.map((a) => {
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
    XLSX.utils.book_append_sheet(wb, ws, 'Staff Members')
    XLSX.writeFile(wb, `Staff Members_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Reporte exportado correctamente')
  }

  // Apply smart filters
  const filteredAttendees = staffList.filter((a) => {
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

    // Team filter
    const matchesTeam = !teamFilter || a.teamId === parseInt(teamFilter)

    // Room filter
    const matchesRoom = !roomFilter || a.roomId === parseInt(roomFilter)

    return matchesSearch && matchesStatus && matchesChurch && matchesTeam && matchesRoom
  })

  // Calculate totals based on ALL attendees (not filtered)
  const summary = staffList.reduce(
    (acc, a) => {
      acc.expected += parseFloat(a.totalAmount as string)
      acc.collected += parseFloat(a.amountPaid as string)
      return acc
    },
    { expected: 0, collected: 0 }
  )
  const pendingAmount = summary.expected - summary.collected
  const teamMap = new Map(teams.map((t) => [t.id, t]))
  const paidCount = staffList.filter((a) => a.status === 'paid').length
  const partialCount = staffList.filter((a) => a.status === 'partial').length
  const pendingCount = staffList.filter((a) => a.status === 'pending').length

  // Helper functions to get display names from IDs
  const getChurchName = (id: string) => churches.find(c => c.id === parseInt(id))?.name || ''

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 flex flex-col gap-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader
        title="Staff Members"
        description={`Total: ${staffList.length} | Pagados: ${paidCount} | Pendientes: ${pendingCount}`}
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
      {!loading && staffList.length > 0 && (
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
            value={`${checkedInCount}/${staffList.length}`}
            color="primary"
            icon={UserCheck}
            subtitle={`${paidCount} pagados • ${partialCount} parciales`}
          />
        </div>
      )}

      {/* Smart filter system */}
      {!loading && staffList.length > 0 && (
        <SmartFilter
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          churchFilter={churchFilter}
          onChurchChange={setChurchFilter}
          churches={churches}
          teamFilter={teamFilter}
          onTeamChange={setTeamFilter}
          teams={teams}
          roomFilter={roomFilter}
          onRoomChange={setRoomFilter}
          rooms={rooms}
          onClearFilters={() => {
            setSearch('')
            setStatusFilter('all')
            setChurchFilter('')
            setTeamFilter('')
            setRoomFilter('')
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
      ) : staffList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Users className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Sin staff members registrados</h3>
              <p className="text-sm text-muted-foreground">Comienza agregando staff members usando el botón "Agregar" o importando un archivo Excel</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Agregar primer staff member
            </Button>
          </div>
        </Card>
      ) : filteredAttendees.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Search className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No se encontraron staff members con esos filtros</p>
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
                              setSelectedStaffId(attendee.id)
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
                            title="Editar staff member"
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
                            title="Eliminar staff member"
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b">
              <DialogTitle className="text-lg font-semibold">{editingId ? 'Editar Staff Member' : 'Nuevo Staff Member'}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{editingId ? 'Actualiza los datos del staff' : 'Agrega un nuevo staff member'}</p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enrique Medina"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono *</Label>
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
            <div>
              <Label htmlFor="ministry">Ministerio</Label>
              <Input
                id="ministry"
                value={form.ministry}
                onChange={(e) => setForm({ ...form, ministry: e.target.value })}
                placeholder="Ej: Música, Adoración, Jóvenes, etc."
              />
            </div>
            <div>
              <Label htmlFor="role">Rol/Posición</Label>
              <Input
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Ej: Pastor, Diácono, Coordinador, etc."
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  id="isTeamLead"
                  type="checkbox"
                  checked={form.isTeamLead}
                  onChange={(e) => setForm({ ...form, isTeamLead: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="isTeamLead" className="cursor-pointer">Es Líder de Equipo</Label>
              </div>
              {form.isTeamLead && (
                <div>
                  <Label htmlFor="leadTeamId">Equipo que Lidera *</Label>
                  <Select value={form.leadTeamId} onValueChange={(value) => setForm({ ...form, leadTeamId: value })}>
                    <SelectTrigger id="leadTeamId">
                      <SelectValue placeholder="Selecciona el equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={String(team.id)}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                {editingId ? 'Guardar Cambios' : 'Agregar Staff Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-lg font-semibold">Registrar Pago</DialogTitle>
            {selectedStaffId && (
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {staffList.find((a) => a.id === selectedStaffId)?.name}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedStaffId && staffList.find((a) => a.id === selectedStaffId) && (
            <div className="bg-muted p-3 rounded-lg space-y-1 text-sm mb-4">
              {(() => {
                const att = staffList.find((a) => a.id === selectedStaffId)!
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
              <Label>Método de Pago *</Label>
              <Select value={paymentForm.paymentMethod} onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMethod: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="deposit">Depósito</SelectItem>
                </SelectContent>
              </Select>
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
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="pb-3 border-b">
            <AlertDialogTitle className="text-lg font-semibold text-red-600">Eliminar Staff Member</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              ¿Estás seguro que deseas eliminar este staff member y todos sus registros de pago? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <AlertDialogCancel className="px-4">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDelete(deletingId)
                  setDeleteDialogOpen(false)
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-lg font-semibold">Historial de Pagos</DialogTitle>
            {historyStaffId && (
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {staffList.find((a) => a.id === historyStaffId)?.name}
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
                      {formatMXN(parseFloat(payment.amount as string))} • {!payment.paymentMethod || payment.paymentMethod === 'cash' ? 'Efectivo' : payment.paymentMethod === 'transfer' ? 'Transferencia' : 'Depósito'}
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
