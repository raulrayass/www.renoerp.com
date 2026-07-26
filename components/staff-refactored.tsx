'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { getStaff, createStaff, updateStaff, deleteStaff } from '@/app/actions/staff'
import { getChurches } from '@/app/actions/churches'
import { Staff, Church } from '@/lib/db/schema'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { MobileSheet } from '@/components/mobile'

interface Props {
  userId: string
}

export function StaffRefactored({ userId }: Props) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [churches, setChurches] = useState<Church[]>([])
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', churchId: '' })

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    try {
      const [staffData, churchData] = await Promise.all([
        getStaff(userId),
        getChurches(userId),
      ])
      setStaff(staffData || [])
      setChurches(churchData || [])
    } catch (error) {
      toast.error('Error cargando datos')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      if (editingId) {
        await updateStaff(editingId, form)
        toast.success('Personal actualizado')
      } else {
        await createStaff({ ...form, userId })
        toast.success('Personal creado')
      }
      setDialogOpen(false)
      setEditingId(null)
      setForm({ name: '', role: '', email: '', phone: '', churchId: '' })
      loadData()
    } catch (error) {
      toast.error('Error en operación')
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este personal?')) return
    try {
      await deleteStaff(id)
      toast.success('Personal eliminado')
      loadData()
    } catch (error) {
      toast.error('Error eliminando')
    }
  }

  const filtered = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar personal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>

      <div className="grid gap-4">
        {filtered.map(person => (
          <Card key={person.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{person.name}</h3>
                <p className="text-sm text-muted-foreground">{person.role}</p>
                {person.email && <p className="text-xs text-muted-foreground">{person.email}</p>}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setForm(person)
                    setEditingId(person.id)
                    setDialogOpen(true)
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(person.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <MobileSheet
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingId ? 'Editar personal' : 'Agregar personal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Rol"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email || ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Teléfono"
            value={form.phone || ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            value={form.churchId}
            onChange={(e) => setForm({ ...form, churchId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Seleccionar iglesia</option>
            {churches.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button type="submit" disabled={isPending} className="w-full">
            {editingId ? 'Guardar' : 'Crear'}
          </Button>
        </form>
      </MobileSheet>
    </div>
  )
}
