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

      {/* Main Container - 16:9 Aspect Ratio */}
      <div className="w-full h-full flex flex-col items-center justify-center p-2 md:p-6 lg:p-8 gap-3 md:gap-6">
        {/* Title with glow animation */}
        <div className="text-center w-full flex-shrink-0">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-1 md:mb-3 drop-shadow-lg animate-title-glow">
            🏆 PUNTAJE GENERAL 🏆
          </h1>
          <div className="h-0.5 md:h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-full mx-auto w-3/4 md:w-1/2 animate-glow-pulse" />
        </div>

        {/* Leaderboard - Scrollable container */}
        <div className="w-full flex-1 overflow-y-auto space-y-1.5 md:space-y-3 scrollbar-hide">
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.team.id}
              className="scoreboard-item"
              style={{
                animation: `slideInLeft 0.6s ease-out ${idx * 0.15}s both`,
              }}
            >
              <div
                className="rounded-lg md:rounded-2xl backdrop-blur-md border border-2 p-2 md:p-4 lg:p-6 cursor-default w-full transition-all duration-300 hover:scale-102"
                style={{
                  borderColor: getCountryColor(entry.team.country),
                  backgroundColor: `${getCountryColor(entry.team.country)}12`,
                  boxShadow: `0 0 20px md:0 0 30px ${getCountryColor(entry.team.country)}30`,
                }}
              >
                <div className="flex items-center gap-2 md:gap-4 lg:gap-6 w-full">
                  {/* Rank */}
                  <div className="text-2xl md:text-4xl lg:text-6xl font-black text-white drop-shadow-lg flex-shrink-0 text-center animate-bounce-slow">
                    {getMedalEmoji(idx) || <span>{idx + 1}</span>}
                  </div>

                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm md:text-2xl lg:text-3xl font-bold text-white truncate drop-shadow-md">
                      {entry.team.name}
                    </h2>

                    {/* Points per Game - Horizontal scroll for mobile */}
                    {Object.keys(entry.pointsPerGame).length > 0 && (
                      <div className="flex gap-1 md:gap-2 mt-1 md:mt-2 overflow-x-auto scrollbar-hide">
                        {gameList
                          .filter((g) => entry.pointsPerGame[g.id])
                          .map((game) => (
                            <div
                              key={game.id}
                              className="bg-white/10 rounded px-1.5 md:px-3 py-0.5 md:py-1 backdrop-blur-sm flex-shrink-0 animate-scale-pulse"
                              style={{
                                animation: `scalePulse 2s ease-in-out ${idx * 0.1}s infinite`,
                              }}
                            >
                              <p className="text-xs md:text-sm text-white/80 truncate">
                                {game.name}
                              </p>
                              <p className="font-bold text-xs md:text-sm text-white tabular-nums">
                                {entry.pointsPerGame[game.id]}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Total Points - Large Display */}
                  <div className="text-center flex-shrink-0 animate-points-pulse">
                    <div
                      className="text-xl md:text-4xl lg:text-5xl font-black tabular-nums drop-shadow-lg"
                      style={{
                        color: getCountryColor(entry.team.country),
                        animation: `pointsPulse 2s ease-in-out ${idx * 0.15}s infinite`,
                      }}
                    >
                      {entry.totalPoints}
                    </div>
                    <p className="text-white/70 text-xs md:text-sm font-semibold mt-0.5">PTS</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-0.5 md:h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm mt-1.5 md:mt-3">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(100, (entry.totalPoints / (leaderboard[0]?.totalPoints || 1)) * 100)}%`,
                      backgroundColor: getCountryColor(entry.team.country),
                      animation: `widthPulse 3s ease-in-out ${idx * 0.2}s infinite`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Update Indicator */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0 animate-pulse">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-ping-slow" />
          <p className="text-white/60 text-xs md:text-sm">Actualización en tiempo real</p>
        </div>
      </div>

      {/* Global Animations */}
      <style jsx global>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
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
            opacity: 0.8;
          }
        }

        @keyframes widthPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
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

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes ping-slow {
          0% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
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

        .animate-points-pulse {
          animation: pointsPulse 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s infinite;
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
