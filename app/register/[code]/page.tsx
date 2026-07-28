'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { registerViaLink } from '@/app/actions/invitations'
import { toast } from 'sonner'
import { Users, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: '',
    phone: '',
    church: '',
    shirtSize: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    try {
      setLoading(true)
      await registerViaLink(code, {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        sex: formData.sex || undefined,
        phone: formData.phone || undefined,
        church: formData.church || undefined,
        shirtSize: formData.shirtSize || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        allergies: formData.allergies || undefined,
      })

      setSuccess(true)
      toast.success('¡Registro completado exitosamente!')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Error al registrarse')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center rounded-2xl">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">¡Bienvenido!</h1>
          <p className="text-muted-foreground">Tu registro ha sido completado exitosamente. Serás redirigido en breve...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background">
      {/* Header */}
      <div className="px-4 py-6 border-b border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Registro de Camperos</h1>
          </div>
          <p className="text-sm text-muted-foreground">Completa el formulario para registrarte al campamento</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <Card className="p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nombre */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nombre Completo *</Label>
              <Input
                required
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={loading}
                className="rounded-xl"
              />
            </div>

            {/* Edad y Sexo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Edad</Label>
                <Input
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  disabled={loading}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Sexo</Label>
                <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hombre">Hombre</SelectItem>
                    <SelectItem value="Mujer">Mujer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Talla y Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Talla de Camisa</Label>
                <Select value={formData.shirtSize} onValueChange={(value) => handleInputChange('shirtSize', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Teléfono</Label>
                <Input
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={loading}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Iglesia y Alergias */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Iglesia</Label>
              <Input
                placeholder="Nombre de tu iglesia"
                value={formData.church}
                onChange={(e) => handleInputChange('church', e.target.value)}
                disabled={loading}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Alergias</Label>
              <Input
                placeholder="Ej: Frutos secos, lácteos..."
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                disabled={loading}
                className="rounded-xl"
              />
            </div>

            {/* Contacto de Emergencia */}
            <div className="pt-2 border-t border-border">
              <h3 className="font-semibold text-foreground mb-3">Contacto de Emergencia</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Nombre</Label>
                  <Input
                    placeholder="Nombre completo"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    disabled={loading}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Teléfono</Label>
                  <Input
                    type="tel"
                    placeholder="+34 600 000 000"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    disabled={loading}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
              >
                {loading ? 'Registrando...' : 'Registrarme'}
              </Button>
            </div>
          </form>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Los campos marcados con * son obligatorios
        </p>
      </div>
    </div>
  )
}
