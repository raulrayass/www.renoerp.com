'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cleanupAndReset } from '@/app/actions/cleanup-and-reset'
import { toast } from 'sonner'

export default function CleanupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleCleanup = async () => {
    if (!confirm('⚠️ CONFIRMA: Esto eliminará TODOS los datos de camperos, staff, equipos, juegos, etc. Los usuarios se mantienen.')) {
      return
    }

    try {
      setLoading(true)
      const response = await cleanupAndReset()
      setResult(response)

      if (response.success) {
        toast.success('✓ Base de datos limpiada y lista')
      } else {
        toast.error(`Error: ${response.error}`)
      }
    } catch (e) {
      toast.error(`Error: ${(e as any).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Limpieza de Base de Datos</h1>

        <div className="bg-card border border-border rounded-lg p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Resetear Base de Datos</h2>
            <p className="text-muted-foreground">
              Esto eliminará TODOS los camperos, staff, equipos, juegos, transacciones y datos similares. 
              La estructura de la BD se mantiene intacta.
            </p>
          </div>

          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-sm font-semibold text-destructive">
              Después de limpiar, se creará automáticamente el evento "Permanece 2026" vacío y listo para datos nuevos.
            </p>
          </div>

          <Button
            onClick={handleCleanup}
            disabled={loading}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            {loading ? 'Limpiando...' : 'Limpiar Base de Datos'}
          </Button>

          {result && (
            <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.message || result.error}
              </p>
              {result.success && (
                <div className="mt-3 text-sm text-green-700 space-y-1">
                  <p>✓ Evento: {result.event.name} (ID: {result.event.id})</p>
                  <p>✓ Admin: {result.admin.email}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
