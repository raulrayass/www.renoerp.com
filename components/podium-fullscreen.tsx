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
  const positions = ['2º', '1º', '3º']
  const medals = ['🥈', '🥇', '🥉']

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-br from-purple-900 via-black to-purple-900"
         style={{
           background: 'linear-gradient(135deg, #1a0033 0%, #0a0015 50%, #2d1052 100%)',
         }}>
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
      <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 gap-6 md:gap-10">
        {/* Title Section */}
        <div className="text-center w-full flex-shrink-0 relative">
          <div className="mb-2 md:mb-4">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 tracking-wider mb-2">
              CAMPEON PERMANECE
            </h2>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-2xl animate-title-glow mb-2">
              2026
            </h1>
            <div className="h-1 md:h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full mx-auto w-2/3 animate-glow-pulse" />
          </div>
        </div>

        {/* Podium */}
        <div className="flex items-flex-end justify-center gap-1 md:gap-4 lg:gap-6 w-full max-w-5xl flex-1 relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 left-1/4 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -top-10 right-1/4 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          
          {podiumOrder.map((entry, idx) => {
            if (!entry) return null
            const countryColor = getCountryColor(entry.team.country)
            const heights = ['h-40 md:h-56', 'h-56 md:h-72', 'h-32 md:h-48']
            const scales = [0.9, 1, 0.85]

            return (
              <div
                key={entry.team.id}
                className="flex flex-col items-center relative z-10"
                style={{
                  animation: `podiumRise 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.2}s both`,
                }}
              >
                {/* Medal Animation */}
                <div className="text-5xl md:text-7xl mb-3 md:mb-4 animate-bounce-medal" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {medals[idx]}
                </div>

                {/* Main Podium Card */}
                <div
                  className={`${heights[idx]} w-20 md:w-28 lg:w-36 rounded-t-3xl md:rounded-t-4xl p-2 md:p-4 lg:p-6 flex flex-col items-center justify-between relative overflow-hidden transition-all duration-500 border-2 md:border-4`}
                  style={{
                    borderColor: countryColor,
                    backgroundColor: `${countryColor}15`,
                    boxShadow: `0 0 40px ${countryColor}60, 0 0 20px ${countryColor}40, inset 0 0 30px ${countryColor}30`,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Position Badge */}
                  <div className="text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow-lg animate-float">
                    {positions[idx]}
                  </div>

                  {/* Team Name */}
                  <h2 className="text-xs md:text-sm lg:text-base font-black text-center drop-shadow-md line-clamp-2 text-white leading-tight">
                    {entry.team.name}
                  </h2>

                  {/* Points */}
                  <div className="text-center">
                    <div
                      className="text-2xl md:text-4xl lg:text-5xl font-black tabular-nums drop-shadow-lg animate-points-pulse"
                      style={{ color: countryColor }}
                    >
                      {entry.totalPoints}
                    </div>
                    <p className="text-white/70 text-xs md:text-sm font-bold">PUNTOS</p>
                  </div>
                </div>

                {/* Position Label Base */}
                <div 
                  className="px-2 md:px-3 lg:px-4 py-2 md:py-2.5 w-20 md:w-28 lg:w-36 text-center border-2 md:border-4 border-t-0 rounded-b-xl md:rounded-b-2xl font-black text-xs md:text-sm lg:text-base"
                  style={{
                    borderColor: countryColor,
                    backgroundColor: countryColor,
                    color: '#000',
                  }}
                >
                  LUGAR
                </div>
              </div>
            )
          })}
        </div>

        {/* Congratulations Message */}
        <div className="text-center flex-shrink-0 relative z-10">
          <p className="text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
            ¡FELICIDADES A LOS GANADORES!
          </p>
          <p className="text-white/60 text-xs md:text-sm mt-1 md:mt-2">Permanece Camp 2026</p>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes podiumRise {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.7) rotateX(90deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0);
          }
        }

        @keyframes title-glow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.3));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(168, 85, 247, 0.6));
            transform: scale(1.03);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(236, 72, 153, 0.3),
                        0 0 40px rgba(168, 85, 247, 0.2);
          }
          50% {
            box-shadow: 0 0 40px rgba(236, 72, 153, 0.6),
                        0 0 60px rgba(168, 85, 247, 0.4);
          }
        }

        @keyframes bounce-medal {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes points-pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 10px currentColor);
          }
          50% {
            transform: scale(1.08);
            filter: drop-shadow(0 0 20px currentColor);
          }
        }

        .animate-title-glow {
          animation: title-glow 3s ease-in-out infinite;
        }

        .animate-glow-pulse {
          animation: glow-pulse 2.5s ease-in-out infinite;
        }

        .animate-bounce-medal {
          animation: bounce-medal 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-points-pulse {
          animation: points-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
