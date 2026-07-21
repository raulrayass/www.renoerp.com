'use client'

import { Button } from '@/components/ui/button'
import { Minimize2 } from 'lucide-react'
import { CountryFlagSvg } from '@/lib/country-flags-svg'

interface Team {
  id: number
  name: string
  color: string
  country?: string | null
}

interface ScoreboardProps {
  leaderboard: Array<{
    team: Team
    totalPoints: number
    pointsPerGame: Record<number, number>
  }>
  onClose: () => void
  gameList: Array<{ id: number; name: string }>
}

export function ScoreboardFullscreen({ leaderboard, onClose }: ScoreboardProps) {
  const maxPoints = leaderboard[0]?.totalPoints || 1

  const medal = (idx: number) => {
    if (idx === 0) return '🥇'
    if (idx === 1) return '🥈'
    if (idx === 2) return '🥉'
    return null
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pitch-bg">
      {/* Luces de estadio */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -top-20 right-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </div>

      {/* Cerrar */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 md:top-5 md:right-5 text-white hover:bg-white/20 z-20 w-9 h-9 md:w-11 md:h-11"
      >
        <Minimize2 className="w-5 h-5" />
      </Button>

      {/* Contenido */}
      <div className="relative z-10 w-full h-full flex flex-col items-center px-3 md:px-8 py-4 md:py-8 gap-3 md:gap-6">
        {/* Header */}
        <div className="text-center flex-shrink-0">
          <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-tight">
            TABLA DE POSICIONES
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
            <span className="text-yellow-300 text-sm md:text-lg font-bold tracking-[0.2em]">EN VIVO · PERMANECE 2026</span>
          </div>
        </div>

        {/* Tabla */}
        <div className="w-full max-w-4xl flex-1 overflow-y-auto space-y-2 md:space-y-3 scrollbar-hide">
          {leaderboard.map((entry, idx) => {
            const progress = Math.min(100, (entry.totalPoints / maxPoints) * 100)
            const isTop = idx === 0
            return (
              <div
                key={entry.team.id}
                className="relative rounded-xl md:rounded-2xl overflow-hidden border border-white/15 bg-white/10 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                style={{ animation: `rowIn 0.6s cubic-bezier(0.34,1.56,0.64,1) ${idx * 0.08}s both` }}
              >
                {/* Barra de progreso de fondo */}
                <div
                  className="absolute inset-y-0 left-0 opacity-25 transition-all duration-1000"
                  style={{ width: `${progress}%`, backgroundColor: entry.team.color }}
                />

                <div className="relative flex items-center gap-3 md:gap-5 px-3 md:px-6 py-2.5 md:py-4">
                  {/* Posición */}
                  <div className={`shrink-0 w-9 md:w-14 text-center font-black tabular-nums ${isTop ? 'text-yellow-300' : 'text-white'}`}>
                    {medal(idx)
                      ? <span className="text-2xl md:text-4xl">{medal(idx)}</span>
                      : <span className="text-xl md:text-3xl">{idx + 1}</span>}
                  </div>

                  {/* Bandera */}
                  <div
                    className="shrink-0 w-12 h-9 md:w-20 md:h-14 rounded-md md:rounded-lg overflow-hidden border-2 shadow-lg flex items-center justify-center bg-black/20"
                    style={{ borderColor: entry.team.color }}
                  >
                    {entry.team.country ? (
                      <CountryFlagSvg code={entry.team.country} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: entry.team.color }} />
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-3xl font-bold text-white truncate drop-shadow-md">
                      {entry.team.name}
                    </h2>
                  </div>

                  {/* Puntos */}
                  <div className="shrink-0 text-right">
                    <span className="text-2xl md:text-5xl font-black text-white tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      {entry.totalPoints}
                    </span>
                    <span className="text-white/70 text-xs md:text-base font-bold ml-1">PTS</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx global>{`
        .pitch-bg {
          background:
            repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 60px, rgba(255,255,255,0.05) 60px, rgba(255,255,255,0.05) 120px),
            radial-gradient(ellipse at top, #2e7d32 0%, #1b5e20 50%, #0d3311 100%);
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
