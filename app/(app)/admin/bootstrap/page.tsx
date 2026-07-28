'use client'

import { useState } from 'react'
import { bootstrapEvent } from '@/app/actions/bootstrap'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function BootstrapPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleBootstrap = async () => {
    try {
      setLoading(true)
      const response = await bootstrapEvent()
      setResult(response)
      
      if (response.success) {
        toast.success('Bootstrap completado')
      } else {
        toast.error(response.error || 'Error en bootstrap')
      }
    } catch (error) {
      console.error('Bootstrap error:', error)
      toast.error('Error en bootstrap')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Bootstrap del Evento</CardTitle>
          <CardDescription>
            Crea la estructura del evento y vincula todos los datos existentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleBootstrap}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              'Ejecutar Bootstrap'
            )}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                    {result.message}
                  </p>
                  {result.updates && (
                    <div className="mt-3 space-y-1 text-sm">
                      {Object.entries(result.updates).map(([key, count]: [string, any]) => 
                        count > 0 ? (
                          <p key={key} className="text-green-800">
                            ✓ {key}: {count}
                          </p>
                        ) : null
                      )}
                    </div>
                  )}
                  {result.error && (
                    <p className="mt-2 text-sm text-red-800">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
