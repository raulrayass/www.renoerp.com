'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { recordCheckIn, getAttendanceReport } from '@/app/actions/checkins'
import { useEventContext } from '@/lib/contexts/event-context'
import { useUser } from '@/components/user-provider'
import { toast } from 'sonner'
import { QrCode, CheckCircle, AlertCircle, Users } from 'lucide-react'

export default function CheckInPage() {
  const { currentEventId } = useEventContext()
  const { user } = useUser()
  
  const [qrCode, setQrCode] = useState('')
  const [attendeeId, setAttendeeId] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [lastCheckIn, setLastCheckIn] = useState<any>(null)

  const handleCheckIn = async () => {
    if (!currentEventId || !user?.id) {
      toast.error('Faltan datos requeridos')
      return
    }

    if (!attendeeId) {
      toast.error('Ingresa el ID del campero')
      return
    }

    try {
      setLoading(true)
      await recordCheckIn(currentEventId, parseInt(attendeeId), user.id)
      toast.success('Check-in registrado exitosamente')
      setAttendeeId('')
      setQrCode('')
      
      // Actualizar reporte
      const updatedReport = await getAttendanceReport(currentEventId, user.id)
      setReport(updatedReport)
      setLastCheckIn({ id: attendeeId, time: new Date() })
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar check-in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Check-In de Camperos" />
      
      <div className="px-3 sm:px-4 py-4 sm:py-6 max-w-2xl mx-auto space-y-4">
        
        {/* QR Scanner Card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 p-4 sm:p-6 border border-primary/25">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-bold text-foreground">Escanear QR</h2>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Escanea el QR del campero o ingresa ID"
              value={attendeeId}
              onChange={(e) => setAttendeeId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleCheckIn()
                }
              }}
              disabled={loading}
              className="text-center text-lg font-mono"
              autoFocus
            />
            
            <Button
              onClick={handleCheckIn}
              disabled={loading || !attendeeId}
              className="w-full rounded-xl bg-primary hover:bg-primary/90"
            >
              {loading ? 'Registrando...' : 'Registrar Check-In'}
            </Button>
          </div>
        </div>

        {/* Last Check-In */}
        {lastCheckIn && (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900">Check-In Registrado</p>
              <p className="text-xs text-green-700">ID: {lastCheckIn.id}</p>
            </div>
          </div>
        )}

        {/* Attendance Report */}
        {report && (
          <div className="space-y-3">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Reporte de Asistencia
            </h3>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Card className="p-3 sm:p-4 rounded-xl">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{report.totalAttendees}</p>
              </Card>

              <Card className="p-3 sm:p-4 rounded-xl bg-green-50 border-green-200">
                <p className="text-xs text-green-700">Presentes</p>
                <p className="text-xl sm:text-2xl font-bold text-green-700">{report.checkedInCount}</p>
              </Card>

              <Card className="p-3 sm:p-4 rounded-xl bg-orange-50 border-orange-200">
                <p className="text-xs text-orange-700">No Show</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-700">{report.noShowCount}</p>
              </Card>

              <Card className="p-3 sm:p-4 rounded-xl">
                <p className="text-xs text-muted-foreground">Porcentaje</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {report.totalAttendees > 0 ? Math.round((report.checkedInCount / report.totalAttendees) * 100) : 0}%
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
