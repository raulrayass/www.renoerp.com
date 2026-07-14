'use client'

import { useEffect, useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, LogIn, DollarSign, CheckCircle2, Circle } from 'lucide-react'
import { toast } from 'sonner'
import { getAllStaff, createStaff, updateStaff, deleteStaff, addStaffPayment, deleteStaffPayment, getStaffPayments, toggleStaffCheckIn } from '@/app/actions/staff'
import { getTeams } from '@/app/actions/teams'
import { getAllChurches } from '@/app/actions/churches'
import { Staff, StaffPayment, Team, Church } from '@/lib/db/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { formatMXN } from '@/lib/utils'
import { StatsBar } from '@/components/stats-bar'

const CATEGORIES = ['Deportes', 'Cocina', 'Pastor@', 'Lider de equipo', 'Hospitalidad', 'Administración', 'Multimedia', 'Staff general']

interface Props {
  userId: string
}

export function StaffClient({ userId }: Props) {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [churches, setChurches] = useState<Church[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', churchId: '', category: '', leadTeamId: '', totalAmount: '', age: '', sex: '', shirtSize: '' })
  const [paymentForm, setPaymentForm] = useState({ method: 'Efectivo', amount: '' })
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [staffData, churchesData, teamsData] = await Promise.all([getAllStaff(userId), getAllChurches(userId), getTeams(userId)])
        setStaffList(staffData)
        setChurches(churchesData)
        setTeams(teamsData)
      } catch (error) {
        toast.error('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  const handleAddStaff = () => {
    startTransition(async () => {
      try {
        if (!form.name.trim() || !form.category) {
          toast.error('Nombre y categoría son obligatorios')
          return
        }

        if (editingId) {
          await updateStaff(editingId, {
            name: form.name,
            phone: form.phone || null,
            churchId: form.churchId ? parseInt(form.churchId) : null,
            category: form.category,
            leadTeamId: form.leadTeamId ? parseInt(form.leadTeamId) : null,
            totalAmount: (parseFloat(form.totalAmount) || 0).toString(),
            age: form.age ? parseInt(form.age) : null,
            sex: form.sex || null,
            shirtSize: form.shirtSize || null,
          })
          toast.success('Staff actualizado')
        } else {
          await createStaff(userId, {
            name: form.name,
            phone: form.phone || null,
            churchId: form.churchId ? parseInt(form.churchId) : null,
            category: form.category,
            leadTeamId: form.leadTeamId ? parseInt(form.leadTeamId) : null,
            totalAmount: (parseFloat(form.totalAmount) || 0).toString(),
            age: form.age ? parseInt(form.age) : null,
            sex: form.sex || null,
            shirtSize: form.shirtSize || null,
          })
          toast.success('Staff agregado')
        }

        setForm({ name: '', phone: '', churchId: '', category: '', leadTeamId: '', totalAmount: '', age: '', sex: '', shirtSize: '' })
        setEditingId(null)
        setDialogOpen(false)

        const updated = await getAllStaff(userId)
        setStaffList(updated)
      } catch (error) {
        toast.error('Error al guardar')
      }
    })
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar staff?')) {
      startTransition(async () => {
        try {
          await deleteStaff(id)
          setStaffList(staffList.filter(s => s.id !== id))
          toast.success('Eliminado')
        } catch (error) {
          toast.error('Error al eliminar')
        }
      })
    }
  }

  const handleAddPayment = () => {
    if (!selectedStaffId || !paymentForm.amount) return
    startTransition(async () => {
      try {
        await addStaffPayment(userId, selectedStaffId, paymentForm.amount, paymentForm.method, new Date())
        toast.success('Pago agregado')
        setPaymentForm({ method: 'Efectivo', amount: '' })
        setPaymentDialogOpen(false)
        setSelectedStaffId(null)
        const updated = await getAllStaff(userId)
        setStaffList(updated)
      } catch (error) {
        toast.error('Error al agregar pago')
      }
    })
  }

  const paidCount = staffList.filter(s => s.status === 'paid').length
  const checkedInCount = staffList.filter(s => s.checkedIn).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <h1 className="text-3xl font-bold">Staff</h1>
        <Button onClick={() => { setEditingId(null); setForm({ name: '', phone: '', churchId: '', category: '', leadTeamId: '', totalAmount: '', age: '', sex: '', shirtSize: '' }); setDialogOpen(true) }} className="gap-2">
          <Plus className="w-4 h-4" /> Agregar Staff
        </Button>
      </div>

      {staffList.length > 0 && <StatsBar items={[{ label: 'Total Staff', value: staffList.length, icon: <DollarSign className="w-5 h-5" />, color: 'primary' }, { label: 'Pagados', value: paidCount, icon: <CheckCircle2 className="w-5 h-5" />, color: 'success' }, { label: 'Check-in', value: checkedInCount, icon: <LogIn className="w-5 h-5" />, color: 'primary' }]} />}

      <div className="grid gap-4">
        {loading ? <div className="text-center py-8 text-muted-foreground">Cargando...</div> : staffList.length === 0 ? <div className="text-center py-8 text-muted-foreground">No hay staff</div> : staffList.map(s => {
          const paid = parseFloat(s.amountPaid as string)
          const total = parseFloat(s.totalAmount as string)
          const percentage = total > 0 ? (paid / total) * 100 : 0

          return (
            <Card key={s.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{s.name}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{s.category}</span>
                      {s.checkedIn && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{s.phone && <>📞 {s.phone}</> } {s.age && <> • {s.age} años</>}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-primary">{formatMXN(total)}</div>
                    <div className="text-xs text-muted-foreground">{s.status === 'paid' ? '✓ Pagado' : s.status === 'partial' ? 'Parcial' : 'Pendiente'}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>Pagado:</span> <span>{formatMXN(paid)} / {formatMXN(total)}</span></div>
                  <Progress value={percentage} className="h-2" />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedStaffId(s.id); setPaymentDialogOpen(true) }} className="flex-1 gap-2"><DollarSign className="w-4 h-4" /> Pago</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleStaffCheckIn(s.id)} className="flex-1 gap-2"><LogIn className="w-4 h-4" /> Check-in</Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(s.id); setForm({ name: s.name, phone: s.phone || '', churchId: s.churchId?.toString() || '', category: s.category, leadTeamId: s.leadTeamId?.toString() || '', totalAmount: s.totalAmount as string, age: s.age?.toString() || '', sex: s.sex || '', shirtSize: s.shirtSize || '' }); setDialogOpen(true) }} className="gap-2"><Edit2 className="w-4 h-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)} className="gap-2"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Editar' : 'Agregar'} Staff</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nombre *</Label><Input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Categoría *</Label><Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger /><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Edad</Label><Input type="number" placeholder="Edad" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} /></div>
            <div><Label>Sexo</Label><Select value={form.sex} onValueChange={v => setForm({ ...form, sex: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent><SelectItem value="Hombre">Hombre</SelectItem><SelectItem value="Mujer">Mujer</SelectItem></SelectContent></Select></div>
            <div><Label>Talla</Label><Select value={form.shirtSize} onValueChange={v => setForm({ ...form, shirtSize: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Teléfono</Label><Input placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Iglesia</Label><Select value={form.churchId} onValueChange={v => setForm({ ...form, churchId: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{churches.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            {form.category === 'Lider de equipo' && <div><Label>Equipo a Liderar</Label><Select value={form.leadTeamId} onValueChange={v => setForm({ ...form, leadTeamId: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}</SelectContent></Select></div>}
            <div><Label>Monto Total</Label><Input type="number" placeholder="0.00" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })} /></div>
            <Button onClick={handleAddStaff} disabled={isPending} className="w-full">{editingId ? 'Actualizar' : 'Agregar'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pago</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Método</Label><Select value={paymentForm.method} onValueChange={v => setPaymentForm({ ...paymentForm, method: v })}><SelectTrigger /><SelectContent><SelectItem value="Efectivo">Efectivo</SelectItem><SelectItem value="Transferencia">Transferencia</SelectItem><SelectItem value="Cheque">Cheque</SelectItem></SelectContent></Select></div>
            <div><Label>Monto</Label><Input type="number" placeholder="0.00" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} /></div>
            <Button onClick={handleAddPayment} disabled={isPending} className="w-full">Registrar Pago</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
