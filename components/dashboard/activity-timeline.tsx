import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, Plus, Trash2, Edit2, LogIn, LogOut, DollarSign } from 'lucide-react'

interface Activity {
  id: string
  type: 'create' | 'update' | 'delete' | 'checkin' | 'checkout' | 'payment'
  title: string
  description: string
  timestamp: Date
  user?: string
}

interface ActivityTimelineProps {
  activities: Activity[]
  maxItems?: number
}

const activityConfig = {
  create: { icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  update: { icon: Edit2, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  delete: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
  checkin: { icon: LogIn, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
  checkout: { icon: LogOut, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  payment: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
}

export function ActivityTimeline({ activities, maxItems = 10 }: ActivityTimelineProps) {
  const recent = activities.slice(0, maxItems)

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Actividad Reciente
      </h3>

      <div className="space-y-4">
        {recent.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Sin actividad</p>
        ) : (
          recent.map((activity, idx) => {
            const config = activityConfig[activity.type]
            const Icon = config.icon

            return (
              <div key={activity.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  {idx < recent.length - 1 && (
                    <div className="w-0.5 h-12 bg-border mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {formatTime(activity.timestamp)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  {activity.user && (
                    <p className="text-xs text-muted-foreground mt-1">Por: {activity.user}</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  
  return date.toLocaleDateString('es-MX')
}
