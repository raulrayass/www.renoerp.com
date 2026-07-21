'use client'

import { Button } from '@/components/ui/button'
import { Minimize2 } from 'lucide-react'
import { getCountryColor } from '@/lib/country-colors'

interface Team {
  id: string
  name: string
  color: string
  country?: string
}

interface PodiumProps {
  leaderboard: Array<{
    team: Team
    totalPoints: number
    pointsPerGame: Record<string, number>
  }>
  onClose: () => void
  gameList: Array<{ id: string; name: string }>
}

export function PodiumFullscreen({
  leaderboard,
  onClose,
}: PodiumProps) {
  const top3 = leaderboard.slice(0, 3)

  // Orden de podio: 2do, 1ro, 3ro (izquierda a derecha)
  const podiumOrder = [top3[1], top3[0], top3[2]]
  const positions = ['2do', '1ro', '3ro']
  const heights = ['h-48 md:h-64', 'h-64 md:h-80', 'h-40 md:h-56']

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 md:top-4 md:right-4 text-white hover:bg-white/10 z-10 w-8 h-8 md:w-10 md:h-10"
      >
        <Minimize2 className="w-4 h-4 md:w-5 md:h-5" />
      </Button>

      {/* Main Container */}
      <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 gap-8 md:gap-12">
        {/* Title */}
        <div className="text-center w-full flex-shrink-0">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2 md:mb-4 drop-shadow-lg animate-title-glow">
            🏆 CAMPEONES 🏆
          </h1>
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-full mx-auto w-1/2 animate-glow-pulse" />
        </div>

        {/* Podium */}
        <div className="flex items-flex-end justify-center gap-2 md:gap-6 lg:gap-8 w-full max-w-4xl flex-1">
          {podiumOrder.map((entry, idx) => {
            if (!entry) return null
            const countryColor = getCountryColor(entry.team.country)

            return (
              <div
                key={entry.team.id}
                className={`flex flex-col items-center animate-podium-rise`}
                style={{
                  animation: `podiumRise 0.8s ease-out ${idx * 0.2}s both`,
                }}
              >
                {/* Medal */}
                <div className="text-4xl md:text-6xl mb-2 md:mb-4 animate-bounce-slow">
                  {idx === 1 ? '🥇' : idx === 0 ? '🥈' : '🥉'}
                </div>

                {/* Position Box */}
                <div
                  className={`${heights[idx]} rounded-t-2xl md:rounded-t-3xl backdrop-blur-md border-2 border-b-0 p-3 md:p-6 w-24 md:w-32 lg:w-40 flex flex-col items-center justify-between transition-all duration-300`}
                  style={{
                    borderColor: countryColor,
                    backgroundColor: `${countryColor}20`,
                    boxShadow: `0 0 30px ${countryColor}50, inset 0 0 20px ${countryColor}20`,
                  }}
                >
                  {/* Team Name */}
                  <h2 className="text-xs md:text-base lg:text-lg font-black text-white text-center drop-shadow-md line-clamp-2">
                    {entry.team.name}
                  </h2>

                  {/* Points */}
                  <div className="text-center">
                    <div
                      className="text-3xl md:text-5xl lg:text-6xl font-black tabular-nums drop-shadow-lg animate-pulse"
                      style={{ color: countryColor }}
                    >
                      {entry.totalPoints}
                    </div>
                    <p className="text-white/60 text-xs md:text-sm font-bold">PTS</p>
                  </div>
                </div>

                {/* Position Label */}
                <div className="rounded-b-lg md:rounded-b-xl bg-gradient-to-b from-yellow-400 to-yellow-500 px-3 md:px-4 py-2 md:py-3 w-24 md:w-32 lg:w-40 text-center border-2 border-t-0" style={{ borderColor: '#FBBF24' }}>
                  <p className="font-black text-xs md:text-sm lg:text-base text-slate-900">{positions[idx]} LUGAR</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center flex-shrink-0">
          <p className="text-white/60 text-xs md:text-sm">¡Felicidades a los ganadores!</p>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes podiumRise {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes title-glow {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4));
            transform: scale(1.02);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            text-shadow:
              0 0 10px rgba(234, 179, 8, 0.5),
              0 0 20px rgba(234, 179, 8, 0.3);
          }
          50% {
            text-shadow:
              0 0 20px rgba(234, 179, 8, 0.8),
              0 0 40px rgba(234, 179, 8, 0.5);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-title-glow {
          animation: title-glow 3s ease-in-out infinite;
        }

        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
