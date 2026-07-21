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
        background: 'linear-gradient(135deg, #0f0720 0%, #1a0033 25%, #0a0015 50%, #2d1052 75%, #0f0720 100%)',
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute top-10 left-1/4 w-40 h-40 bg-pink-500/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/3 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 md:top-4 md:right-4 text-white hover:bg-white/10 z-10 w-8 h-8 md:w-10 md:h-10"
      >
        <Minimize2 className="w-4 h-4 md:w-5 md:h-5" />
      </Button>

      {/* Main Container - 16:9 Aspect Ratio */}
      <div className="w-full h-full flex flex-col items-center justify-center p-2 md:p-6 lg:p-8 gap-3 md:gap-5 relative z-10">
        {/* Title with glow animation */}
        <div className="text-center w-full flex-shrink-0">
          <h2 className="text-base md:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 tracking-wider mb-1 md:mb-2">
            CAMPEON PERMANECE
          </h2>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2 md:mb-3 drop-shadow-lg animate-title-glow">
            RANKING 2026
          </h1>
          <div className="h-0.5 md:h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full mx-auto w-3/4 md:w-1/2 animate-glow-pulse" />
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
                  className="rounded-xl md:rounded-2xl p-2 md:p-4 lg:p-5 cursor-default w-full transition-all duration-300 hover:scale-102 border-2 md:border-3 group overflow-hidden relative"
                  style={{
                    borderColor: countryColor,
                    backgroundColor: `${countryColor}10`,
                    boxShadow: `0 0 30px ${countryColor}40, inset 0 0 20px ${countryColor}20`,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {/* Background shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  
                  <div className="flex items-center gap-2 md:gap-3 lg:gap-4 w-full relative z-10">
                    {/* Rank Badge */}
                    <div 
                      className="text-2xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-lg flex-shrink-0 text-center animate-bounce-medal w-12 md:w-16 h-12 md:h-16 rounded-lg md:rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${countryColor}30, ${countryColor}10)`,
                        border: `2px solid ${countryColor}`,
                      }}
                    >
                      {getMedalEmoji(idx) || <span className="text-xl md:text-2xl lg:text-3xl">{idx + 1}</span>}
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

        {/* Live Update Indicator */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-400 rounded-full animate-ping-slow" />
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 text-xs md:text-sm font-semibold">
            Actualización en tiempo real
          </p>
        </div>
      </div>

      {/* Global Animations */}
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
            filter: drop-shadow(0 0 10px currentColor);
          }
          50% {
            transform: scale(1.12);
            filter: drop-shadow(0 0 25px currentColor);
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

        @keyframes bounce-medal {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.05);
          }
        }

        @keyframes ping-slow {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(34, 211, 238, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0);
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

        .animate-title-glow {
          animation: title-glow 3s ease-in-out infinite;
        }

        .animate-glow-pulse {
          animation: glow-pulse 2.5s ease-in-out infinite;
        }

        .animate-bounce-medal {
          animation: bounce-medal 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .animate-points-pulse {
          animation: pointsPulse 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s infinite;
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
