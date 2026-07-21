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

interface PodiumProps {
  leaderboard: Array<{
    team: Team
    totalPoints: number
    pointsPerGame: Record<number, number>
  }>
  onClose: () => void
  gameList: Array<{ id: number; name: string }>
}

export function PodiumFullscreen({ leaderboard, onClose }: PodiumProps) {
  const top3 = leaderboard.slice(0, 3)
  // Orden visual: 2º, 1º, 3º
  const order = [top3[1], top3[0], top3[2]]
  const medals = ['🥈', '🥇', '🥉']
  const ranks = ['2º', '1º', '3º']
  const heights = ['h-44 md:h-64', 'h-60 md:h-96', 'h-36 md:h-52']

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pitch-bg">
      {/* Luces de estadio */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] bg-yellow-300/12 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -top-24 right-1/3 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
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

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 md:px-8 py-6 gap-6 md:gap-10">
        {/* Header */}
        <div className="text-center flex-shrink-0">
          <p className="text-yellow-300 text-sm md:text-2xl font-black tracking-[0.25em] mb-1 animate-bounce-soft">🏆 CAMPEONES 🏆</p>
          <h1 className="text-4xl md:text-7xl font-black text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]">PERMANECE 2026</h1>
          <div className="h-1.5 md:h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-full mx-auto w-2/3 mt-3 shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
        </div>

        {/* Podio */}
        <div className="flex items-end justify-center gap-2 md:gap-4 w-full max-w-4xl flex-shrink-0">
          {order.map((entry, idx) => {
            if (!entry) return null
            const color = entry.team.color
            return (
              <div
                key={entry.team.id}
                className="flex flex-col items-center flex-1 min-w-0"
                style={{ animation: `podiumRise 0.9s cubic-bezier(0.34,1.56,0.64,1) ${idx * 0.18}s both` }}
              >
                {/* Medalla */}
                <div className="text-4xl md:text-6xl mb-2 animate-bounce-soft" style={{ animationDelay: `${idx * 0.15}s` }}>
                  {medals[idx]}
                </div>

                {/* Bandera grande */}
                <div
                  className="w-16 h-12 md:w-28 md:h-20 rounded-lg overflow-hidden border-4 shadow-2xl mb-2 flex items-center justify-center bg-black/20"
                  style={{ borderColor: color, boxShadow: `0 0 30px ${color}80` }}
                >
                  {entry.team.country ? (
                    <CountryFlagSvg code={entry.team.country} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: color }} />
                  )}
                </div>

                {/* Nombre */}
                <h2 className="text-sm md:text-xl font-black text-white text-center truncate w-full px-1 drop-shadow-md mb-2">
                  {entry.team.name.toUpperCase()}
                </h2>

                {/* Bloque de podio */}
                <div
                  className={`${heights[idx]} w-full rounded-t-2xl border-4 border-b-0 flex flex-col items-center justify-start pt-4 md:pt-6 relative overflow-hidden`}
                  style={{
                    borderColor: color,
                    background: `linear-gradient(180deg, ${color}40, ${color}10)`,
                    boxShadow: `0 0 40px ${color}50, inset 0 0 40px ${color}20`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
                  <span className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">{ranks[idx]}</span>
                  <div className="mt-auto mb-4 text-center relative z-10">
                    <div
                      className="text-3xl md:text-6xl font-black tabular-nums"
                      style={{ color: '#fff', textShadow: `0 0 20px ${color}` }}
                    >
                      {entry.totalPoints}
                    </div>
                    <p className="text-white/80 text-xs md:text-base font-bold tracking-wider">PUNTOS</p>
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
        @keyframes podiumRise {
          from { opacity: 0; transform: translateY(80px) scale(0.7); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-soft { animation: bounce-soft 2s cubic-bezier(0.34,1.56,0.64,1) infinite; }
      `}</style>
    </div>
  )
}
