'use client'

import { useState, useEffect, useTransition } from 'react'
import { getAllStaff, createStaff, updateStaff, deleteStaff, addStaffPayment, deleteStaffPayment, getStaffPayments, toggleStaffCheckIn } from '@/app/actions/staff'
import { getTeams } from '@/app/actions/teams'
import { getAllChurches } from '@/app/actions/churches'
import { Staff, StaffPayment, Church, Team } from '@/lib/db/schema'
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
import { Plus, Trash2, DollarSign, Edit2, Users2, LogIn, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { StatsBar } from '@/components/stats-bar'
import { PageHeader } from '@/components/page-header'

const STAFF_CATEGORIES = ['Deportes', 'Cocina', 'Pastor@', 'Lider de equipo', 'Hospitalidad', 'Administración', 'Multimedia', 'Staff general']

interface Props {
  userId: string
}

export function StaffClient({ userId }: Props) {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [churches, setChurches] = useState<Church[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '',
    age: '',
    shirtSize: '',
    sex: '',
    phone: '',
    churchId: '',
    category: '',
    leadTeamId: '',
    totalAmount: '',
  })
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'Efectivo',
    notes: '',
  })
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStaff()
  }, [])

  async function loadStaff() {
    setLoading(true)
    try {
      const [staffData, churchesData, teamsData] = await Promise.all([
        getAllStaff(userId),
        getAllChurches(userId),
        getTeams(userId),
      ])
      setStaffList(staffData)
      setChurches(churchesData)
      setTeams(teamsData)
    } catch (error) {
      toast.error('Error al cargar datos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({
      name: '',
      age: '',
      shirtSize: '',
      sex: '',
      phone: '',
      churchId: '',
      category: '',
      leadTeamId: '',
      totalAmount: '',
    })
    setEditingId(null)
  }

  function handleEdit(member: Staff) {
    setEditingId(member.id)
    setForm({
      name: member.name,
      age: member.age?.toString() || '',
      shirtSize: member.shirtSize || '',
      sex: member.sex || '',
      phone: member.phone || '',
      churchId: member.churchId?.toString() || '',
      category: member.category,
      leadTeamId: member.leadTeamId?.toString() || '',
      totalAmount: member.totalAmount || '',
    })
    setDialogOpen(true)
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.category) {
      toast.error('El nombre y categoría son requeridos')
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateStaff(userId, editingId, {
            name: form.name,
            age: form.age ? parseInt(form.age) : undefined,
            shirtSize: form.shirtSize || undefined,
            sex: form.sex || undefined,
            phone: form.phone || undefined,
            churchId: form.churchId ? parseInt(form.churchId) : undefined,
            category: form.category,
            leadTeamId: form.leadTeamId ? parseInt(form.leadTeamId) : undefined,
            totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : undefined,
          })
          toast.success('Staff actualizado')
        } else {
          await createStaff(userId, {
            name: form.name,
            age: form.age ? parseInt(form.age) : undefined,
            shirtSize: form.shirtSize || undefined,
            sex: form.sex || undefined,
            phone: form.phone || undefined,
            churchId: form.churchId ? parseInt(form.churchId) : undefined,
            category: form.category,
            leadTeamId: form.leadTeamId ? parseInt(form.leadTeamId) : undefined,
            totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : undefined,
          })
          toast.success('Staff agregado')
        }
        resetForm()
        setDialogOpen(false)
        await loadStaff()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al guardar')
      }
    })
  }

  function handleDeleteClick(id: number) {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  function handleConfirmDelete() {
    if (deletingId === null) return

    startTransition(async () => {
      try {
        await deleteStaff(userId, deletingId)
        toast.success('Staff eliminado')
        setDeleteDialogOpen(false)
        setDeletingId(null)
        await loadStaff()
      } catch (error) {
        toast.error('Error al eliminar')
      }
    })
  }

  function handleOpenPaymentDialog(staffId: number) {
    setSelectedStaffId(staffId)
    setPaymentForm({ amount: '', paymentMethod: 'Efectivo', notes: '' })
    setPaymentDialogOpen(true)
  }

  function handleAddPayment() {
    if (!selectedStaffId || !paymentForm.amount) {
      toast.error('Ingresa un monto')
      return
    }

    startTransition(async () => {
      try {
        await addStaffPayment(userId, selectedStaffId, {
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          notes: paymentForm.notes || undefined,
        })
        toast.success('Pago registrado')
        setPaymentDialogOpen(false)
        await loadStaff()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al registrar pago')
      }
    })
  }

  function handleToggleCheckIn(staffId: number) {
    startTransition(async () => {
      try {
        await toggleStaffCheckIn(userId, staffId)
        await loadStaff()
      } catch (error) {
        toast.error('Error al actualizar check-in')
      }
    })
  }

  const paidCount = staffList.filter(s => s.status === 'paid').length
  const checkedInCount = staffList.filter(s => s.checkedIn).length

  return (
    <div className="space-y-6">
      <PageHeader title="Staff" />

      {/* Stats Bar */}
      {!loading && staffList.length > 0 && (
        <StatsBar
          items={[
            { label: 'Total Staff', value: staffList.length, icon: <Users2 className="w-5 h-5" />, color: 'primary' },
            { label: 'Pagados', value: paidCount, icon: <CreditCard className="w-5 h-5" />, color: 'success' },
            { label: 'Check-in', value: checkedInCount, icon: <LogIn className="w-5 h-5" />, color: 'primary' },
          ]}
        />
      )}

      {/* Create Button */}
      <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gap-2">
        <Plus className="w-4 h-4" />
        Agregar Staff
      </Button>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      ) : staffList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay staff registrado
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((member) => {
            const total = parseFloat(member.totalAmount as string)
            const paid = parseFloat(member.amountPaid as string)
            const remaining = total - paid
            const percentage = total > 0 ? (paid / total) * 100 : 0

            return (
              <Card key={member.id} className="flex flex-col">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{member.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {member.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCheckIn(member.id)}
                      className={member.checkedIn ? 'text-green-600' : 'text-muted-foreground'}
                    >
                      <LogIn className="w-4 h-4" />
                    </Button>
                  </div>

                  {member.age && <p className="text-sm text-muted-foreground">Edad: {member.age}</p>}
                  {member.phone && <p className="text-sm text-muted-foreground">Tel: {member.phone}</p>}
                  {member.shirtSize && <p className="text-sm text-muted-foreground">Talla: {member.shirtSize}</p>}

                  {member.leadTeamId && (
                    <p className="text-sm text-muted-foreground">
                      Líder de: {teams.find(t => t.id === member.leadTeamId)?.name}
                    </p>
                  )}

                  {total > 0 && (
                    <>
                      <div className="bg-card border-2 border-primary rounded p-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Costo:</span>
                          <span className="text-primary">{formatMXN(total)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Pagado:</span>
                          <span>{formatMXN(paid)}</span>
                        </div>
                        <Progress value={percentage} className="h-1.5 mt-2" />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenPaymentDialog(member.id)}
                          className="gap-1"
                        >
                          <DollarSign className="w-3 h-3" />
                          Registrar Pago
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(member)}
                      className="gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(member.id)}
                      className="gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Staff' : 'Agregar Staff'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age">Edad</Label>
                <Input id="age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="shirtSize">Talla</Label>
                <Input id="shirtSize" value={form.shirtSize} onChange={(e) => setForm({ ...form, shirtSize: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sex">Sexo</Label>
                <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div>
              <Label htmlFor="church">Iglesia</Label>
              <Select value={form.churchId} onValueChange={(v) => setForm({ ...form, churchId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona iglesia" />
                </SelectTrigger>
                <SelectContent>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id.toString()}>
                      {church.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.category === 'Lider de equipo' && (
              <div>
                <Label htmlFor="team">Equipo a Liderar</Label>
                <Select value={form.leadTeamId} onValueChange={(v) => setForm({ ...form, leadTeamId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="totalAmount">Costo Total</Label>
              <Input
                id="totalAmount"
                type="number"
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
                {editingId ? 'Actualizar' : 'Agregar'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="method">Método de Pago</Label>
              <Select value={paymentForm.paymentMethod} onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMethod: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Notas"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddPayment} disabled={isPending} className="flex-1">
                Registrar
              </Button>
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Staff</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar este staff? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
