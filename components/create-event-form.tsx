'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface CreateEventFormProps {
  userId: string
}

export function CreateEventForm({ userId }: CreateEventFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('El nombre del evento es requerido')
      return
    }

    if (!form.startDate || !form.endDate) {
      toast.error('Las fechas son requeridas')
      return
    }

    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error('La fecha de inicio no puede ser posterior a la fecha de fin')
      return
    }

    startTransition(async () => {
      try {
        const newEvent = await createEvent(userId, {
          name: form.name.trim(),
          description: form.description || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          location: form.location || undefined,
        })

        toast.success('Evento creado exitosamente')
        router.push(`/?eventId=${newEvent.id}`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al crear el evento')
      }
    })
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver al dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo Evento</CardTitle>
          <CardDescription>Crea un nuevo evento para organizar tus campamentos y actividades</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Evento</Label>
              <Input
                id="name"
                placeholder="Campamento de verano 2024"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={isPending}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Describe el evento, sus objetivos, etc."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={isPending}
                rows={4}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación (opcional)</Label>
              <Input
                id="location"
                placeholder="Ciudad, país"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                disabled={isPending}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creando...' : 'Crear Evento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
