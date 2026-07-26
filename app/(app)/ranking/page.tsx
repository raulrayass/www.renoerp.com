import { Suspense } from 'react'
import { Leaderboard } from '@/components/dashboard/leaderboard'
import { Card } from '@/components/ui/card'

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Card className="h-64 bg-muted" />
      <Card className="h-96 bg-muted" />
    </div>
  )
}

export const metadata = {
  title: 'Ranking de Equipos',
  description: 'Visualiza el ranking y leaderboard de todos los equipos.',
}

export default function RankingPage() {
  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Ranking de Equipos</h1>
        <p className="text-muted-foreground">Visualiza la posición de cada equipo según sus puntos acumulados.</p>
      </div>

      <Suspense fallback={<LeaderboardSkeleton />}>
        <Leaderboard />
      </Suspense>
    </div>
  )
}
