'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { simpleMigrate } from '@/app/actions/simple-migrate'
import { toast } from 'sonner'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleMigrate = async () => {
    try {
      setLoading(true)
      const response = await simpleMigrate()
      setResult(response)

      if (response.success) {
        toast.success(
          `Migración completada. Evento: ${response.event.name}, Camperos: ${response.linked.attendees}, Staff: ${response.linked.staff}`
        )
      } else {
        toast.error(`Error: ${response.error}`)
      }
    } catch (e) {
      toast.error('Error en la migración')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Configuración Inicial</h1>

      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Migrar Datos Existentes</h2>
        <p className="text-muted-foreground mb-6">
          Esto vinculará todos tus datos existentes al evento "Permanece 2026" y te asignará como administrador.
        </p>

        <Button onClick={handleMigrate} disabled={loading} size="lg">
          {loading ? 'Migrando...' : 'Iniciar Migración'}
        </Button>

        {result && (
          <div className="mt-6 p-4 bg-secondary rounded">
            {result.success ? (
              <div>
                <p className="font-semibold text-green-600">✓ Migración exitosa</p>
                <p className="text-sm mt-2">Evento: {result.event.name}</p>
                <p className="text-sm">Camperos: {result.linked.attendees}</p>
                <p className="text-sm">Staff: {result.linked.staff}</p>
                <p className="text-sm">Teams: {result.linked.teams}</p>
                <p className="text-sm">Iglesias: {result.linked.churches}</p>
              </div>
            ) : (
              <p className="text-red-600">Error: {result.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
