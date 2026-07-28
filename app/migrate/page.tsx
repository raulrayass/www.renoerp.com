'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function MigratePage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleMigrate = async () => {
    setLoading(true)
    setMessage('')
    setError('')
    
    try {
      const response = await fetch('/api/admin/migrate-db', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(data.message)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Migración de Base de Datos</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Haz clic para ejecutar la migración que agrega las columnas faltantes a la base de datos.
        </p>
        
        <Button 
          onClick={handleMigrate} 
          disabled={loading}
          className="w-full mb-4"
        >
          {loading ? 'Ejecutando...' : 'Ejecutar Migración'}
        </Button>
        
        {message && (
          <div className="p-4 bg-green-100 text-green-800 rounded mb-4">
            ✓ {message}
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded">
            ✗ {error}
          </div>
        )}
      </Card>
    </div>
  )
}
