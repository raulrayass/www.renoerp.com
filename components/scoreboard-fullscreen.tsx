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

interface ScoreboardProps {
  leaderboard: Array<{
    team: Team
    totalPoints: number
    pointsPerGame: Record<string, number>
  }>
  onClose: () => void
  gameList: Array<{ id: string; name: string }>
}

export function ScoreboardFullscreen({
  leaderboard,
  onClose,
  gameList,
}: ScoreboardProps) {

  const getMedalEmoji = (idx: number) => {
    if (idx === 0) return '🥇'
    if (idx === 1) return '🥈'
    if (idx === 2) return '🥉'
    return null
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0d1b2a 0%, #1d2d44 40%, #0d1b2a 100%)',
      }}
    >
      {/* Stadium Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-yellow-400/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
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
      <div className="w-full h-full flex flex-col items-center justify-center p-2 md:p-6 lg:p-8 gap-2 md:gap-4 relative z-10">
        {/* Header */}
        <div className="text-center w-full flex-shrink-0">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg mb-1 md:mb-2 animate-bounce-trophy">
            📊 RANKING EN VIVO 📊
          </h1>
          <h2 className="text-lg md:text-2xl lg:text-3xl font-black text-yellow-300 drop-shadow-lg tracking-widest mb-1 md:mb-2">
            PERMANECE 2026
          </h2>
          <div className="h-1 md:h-1.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-full mx-auto w-3/4" style={{
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(249, 115, 22, 0.5)'
          }} />
        </div>

        {/* Leaderboard - Scrollable container */}
        <div className="w-full flex-1 overflow-y-auto space-y-1.5 md:space-y-2 lg:space-y-3 scrollbar-hide max-w-6xl">
          {leaderboard.map((entry, idx) => {
            const countryColor = getCountryColor(entry.team.country)
            const progressPercent = Math.min(100, (entry.totalPoints / (leaderboard[0]?.totalPoints || 1)) * 100)
            
            return (
              <div
                key={entry.team.id}
                className="scoreboard-item"
                style={{
                  animation: `slideInLeft 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.12}s both`,
                }}
              >
                <div
                  className="rounded-lg md:rounded-xl p-2 md:p-4 lg:p-5 cursor-default w-full transition-all duration-300 hover:scale-102 border-2 md:border-3 group overflow-hidden relative"
                  style={{
                    borderColor: countryColor,
                    backgroundColor: `linear-gradient(135deg, ${countryColor}20, ${countryColor}08)`,
                    boxShadow: `
                      0 0 40px ${countryColor}50,
                      0 0 20px ${countryColor}30,
                      inset 0 0 30px ${countryColor}20,
                      0 10px 30px rgba(0,0,0,0.5)
                    `,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  
                  <div className="flex items-center gap-2 md:gap-3 lg:gap-4 w-full relative z-10">
                    {/* Rank Badge - Stadium Style */}
                    <div 
                      className="text-2xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-lg flex-shrink-0 text-center animate-bounce-medal w-12 md:w-16 h-12 md:h-16 rounded-md md:rounded-lg flex items-center justify-center border-2 md:border-3"
                      style={{
                        background: `linear-gradient(135deg, ${countryColor}30, ${countryColor}10)`,
                        borderColor: countryColor,
                        boxShadow: `0 0 20px ${countryColor}60, inset 0 0 10px ${countryColor}30`,
                      }}
                    >
                      {getMedalEmoji(idx) || <span className="text-lg md:text-2xl lg:text-3xl">{idx + 1}</span>}
                    </div>

                    {/* Team Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm md:text-lg lg:text-xl font-bold text-white truncate drop-shadow-md">
                        {entry.team.name}
                      </h2>

                      {/* Points per Game */}
                      {Object.keys(entry.pointsPerGame).length > 0 && (
                        <div className="flex gap-1 md:gap-1.5 mt-0.5 md:mt-1 overflow-x-auto scrollbar-hide">
                          {gameList
                            .filter((g) => entry.pointsPerGame[g.id])
                            .slice(0, 4)
                            .map((game) => (
                              <div
                                key={game.id}
                                className="bg-white/10 rounded-md px-1.5 md:px-2 py-0.5 backdrop-blur-sm flex-shrink-0 border border-white/20"
                                style={{
                                  animation: `scalePulse 2.5s ease-in-out ${idx * 0.1}s infinite`,
                                }}
                              >
                                <p className="text-xs text-white/70">
                                  {game.name.slice(0, 3)}: <span className="font-bold text-white">{entry.pointsPerGame[game.id]}</span>
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Total Points - Large Display */}
                    <div className="text-center flex-shrink-0">
                      <div
                        className="text-2xl md:text-4xl lg:text-5xl font-black tabular-nums drop-shadow-lg"
                        style={{
                          color: countryColor,
                          animation: `pointsPulse 2s ease-in-out ${idx * 0.15}s infinite`,
                        }}
                      >
                        {entry.totalPoints}
                      </div>
                      <p className="text-white/70 text-xs md:text-sm font-bold">PTS</p>
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="h-1 md:h-1.5 bg-white/15 rounded-full overflow-hidden backdrop-blur-sm mt-2 md:mt-3 relative">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: countryColor,
                        boxShadow: `0 0 15px ${countryColor}80`,
                      }}
                    >
                      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0 relative">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full animate-pulse" style={{
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.4)'
          }} />
          <p className="text-white text-xs md:text-sm font-bold tracking-wide">
            EN VIVO
          </p>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pointsPulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 8px currentColor);
          }
          50% {
            transform: scale(1.1);
            filter: drop-shadow(0 0 20px currentColor);
          }
        }

        @keyframes scalePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.85;
          }
        }

        @keyframes bounce-trophy {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounce-medal {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.08);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-bounce-trophy {
          animation: bounce-trophy 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .animate-bounce-medal {
          animation: bounce-medal 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .animate-points-pulse {
          animation: pointsPulse 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
