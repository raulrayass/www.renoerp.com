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
    <div className="fixed inset-0 z-50 overflow-hidden"
         style={{
           background: 'linear-gradient(180deg, #0d1b2a 0%, #1d2d44 40%, #0d1b2a 100%)',
         }}>
      {/* Spotlight Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 md:top-4 md:right-4 text-white hover:bg-white/20 z-20 w-8 h-8 md:w-10 md:h-10"
      >
        <Minimize2 className="w-4 h-4 md:w-5 md:h-5" />
      </Button>

      {/* Main Container */}
      <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 gap-4 md:gap-8 relative z-10">
        {/* Header Trophy Section */}
        <div className="text-center w-full flex-shrink-0">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-yellow-300 drop-shadow-lg tracking-widest mb-1 animate-bounce-trophy">
            🏆 CAMPEONES 2026 🏆
          </h2>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-2xl animate-trophy-pulse mb-2">
            PERMANECE
          </h1>
          <div className="h-1.5 md:h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-full mx-auto w-3/4" style={{
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(249, 115, 22, 0.5)'
          }} />
        </div>

        {/* Podium Structure */}
        <div className="flex items-flex-end justify-center gap-0 md:gap-2 w-full max-w-5xl flex-1 relative px-2">
          {podiumOrder.map((entry, idx) => {
            if (!entry) return null
            const countryColor = getCountryColor(entry.team.country)
            const heights = ['h-48 md:h-64 lg:h-72', 'h-64 md:h-80 lg:h-96', 'h-40 md:h-56 lg:h-64']
            const positions_names = ['2º', '1º', '3º']

            return (
              <div
                key={entry.team.id}
                className="flex flex-col items-center flex-1"
                style={{
                  animation: `podiumRise 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.2}s both`,
                }}
              >
                {/* Medal */}
                <div className="text-4xl md:text-6xl mb-2 md:mb-3 animate-bounce-medal" style={{ animationDelay: `${idx * 0.15}s` }}>
                  {medals[idx]}
                </div>

                {/* Podium Box - Stadium Style */}
                <div
                  className={`${heights[idx]} w-full rounded-t-2xl md:rounded-t-3xl p-3 md:p-5 flex flex-col items-center justify-between relative overflow-hidden border-4 md:border-6`}
                  style={{
                    borderColor: countryColor,
                    backgroundColor: `linear-gradient(135deg, ${countryColor}25, ${countryColor}10)`,
                    boxShadow: `
                      0 0 50px ${countryColor}70,
                      0 0 30px ${countryColor}50,
                      inset 0 0 40px ${countryColor}30,
                      0 20px 60px rgba(0,0,0,0.7)
                    `,
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                  
                  {/* Rank Number */}
                  <div className="text-2xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-lg">
                    {positions_names[idx]}
                  </div>

                  {/* Team Name */}
                  <h2 className="text-xs md:text-sm lg:text-base font-black text-center text-white drop-shadow-md line-clamp-2 px-1">
                    {entry.team.name.toUpperCase()}
                  </h2>

                  {/* Points Large */}
                  <div className="text-center">
                    <div
                      className="text-3xl md:text-5xl lg:text-6xl font-black tabular-nums drop-shadow-lg animate-bounce-points"
                      style={{
                        color: countryColor,
                        textShadow: `0 0 20px ${countryColor}80, 0 0 10px ${countryColor}`,
                      }}
                    >
                      {entry.totalPoints}
                    </div>
                    <p className="text-white/80 text-xs md:text-sm font-bold mt-1">PUNTOS</p>
                  </div>
                </div>

                {/* Base Label */}
                <div 
                  className="w-full px-2 md:px-3 py-2 md:py-3 text-center font-black text-xs md:text-sm lg:text-base border-4 md:border-6 border-t-0"
                  style={{
                    borderColor: countryColor,
                    backgroundColor: countryColor,
                    color: '#000',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  CAMPEÓN
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center flex-shrink-0 relative z-10">
          <p className="text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow-lg mb-1">
            ¡CAMPEONES!
          </p>
          <p className="text-yellow-300 text-xs md:text-sm font-bold tracking-widest">PERMANECE CAMP 2026</p>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes podiumRise {
          from {
            opacity: 0;
            transform: translateY(80px) scale(0.6);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounce-trophy {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes trophy-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.6));
            transform: scale(1.02);
          }
        }

        @keyframes bounce-medal {
          0%, 100% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) scale(1.15) rotate(5deg);
          }
        }

        @keyframes bounce-points {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 5px currentColor);
          }
          50% {
            transform: scale(1.1);
            filter: drop-shadow(0 0 20px currentColor);
          }
        }

        .animate-bounce-trophy {
          animation: bounce-trophy 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .animate-trophy-pulse {
          animation: trophy-pulse 2s ease-in-out infinite;
        }

        .animate-bounce-medal {
          animation: bounce-medal 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .animate-bounce-points {
          animation: bounce-points 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
