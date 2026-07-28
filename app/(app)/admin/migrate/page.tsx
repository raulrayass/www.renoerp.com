'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { runMigration } from '@/app/actions/migrate'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function MigrationPage() {
  const session = useSession()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleMigrate = async () => {
    try {
      if (!session?.data?.user?.id) {
        toast.error('Por favor inicia sesión primero')
        return
      }

      setLoading(true)
      const response = await runMigration(session.data.user.id)

      if (response.success) {
        setResult(response)
        toast.success(response.message)
      } else {
        toast.error('Error en migración: ' + response.error)
      }
    } catch (error) {
      toast.error('Error al ejecutar migración')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-3 sm:px-4 py-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Migración de Datos
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Crea el evento "Campamento 2026" y vincula todos tus datos actuales
          </p>
        </div>

        {/* Status */}
        {result && result.success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 text-sm">
                ¡Migración Completada!
              </p>
              <ul className="text-xs text-green-800 mt-2 space-y-1">
                <li>✓ Eventos creados: {result.eventsCreated}</li>
                <li>✓ Datos vinculados: {result.dataLinked}</li>
                <li>✓ Evento: {result.eventName}</li>
              </ul>
            </div>
          </div>
        )}

        {result && !result.success && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-sm">Error</p>
              <p className="text-xs text-red-800 mt-1">{result.error}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleMigrate}
          disabled={loading}
          className="w-full py-6 rounded-xl font-semibold text-base"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Ejecutando Migración...
            </>
          ) : result?.success ? (
            'Migración Completada'
          ) : (
            'Ejecutar Migración'
          )}
        </Button>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-2">
          <p className="font-semibold">Qué sucederá:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Se creará "Campamento 2026"</li>
            <li>Todos tus datos se vincularán a este evento</li>
            <li>Tú serás el admin</li>
            <li>Aparecerá en el selector de eventos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
