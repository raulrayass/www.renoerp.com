'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Minimize2 } from 'lucide-react'

interface Team {
  id: string
  name: string
  color: string
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
  const [animateIndices, setAnimateIndices] = useState<number[]>([])

  useEffect(() => {
    // Animar cada entrada secuencialmente
    let delay = 0
    leaderboard.forEach((_, idx) => {
      setTimeout(() => {
        setAnimateIndices((prev) => [...prev, idx])
      }, delay)
      delay += 300
    })
  }, [leaderboard])

  const getMedalEmoji = (idx: number) => {
    if (idx === 0) return '🥇'
    if (idx === 1) return '🥈'
    if (idx === 2) return '🥉'
    return null
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 overflow-hidden">
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
      >
        <Minimize2 className="w-5 h-5" />
      </Button>

      {/* Main Content */}
      <div className="h-screen flex flex-col items-center justify-center p-8 gap-12">
        {/* Title Animation */}
        <div className="text-center animate-pulse mb-4">
          <h1 className="text-6xl sm:text-7xl font-bold text-white mb-2 drop-shadow-lg">
            🏆 PUNTAJE GENERAL 🏆
          </h1>
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-full mx-auto w-1/2 animate-pulse" />
        </div>

        {/* Leaderboard */}
        <div className="w-full max-w-4xl space-y-4">
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.team.id}
              className={`transform transition-all duration-700 ease-out ${
                animateIndices.includes(idx)
                  ? 'translate-x-0 opacity-100'
                  : '-translate-x-full opacity-0'
              }`}
            >
              <div
                className="rounded-2xl backdrop-blur-md border-2 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 group cursor-default"
                style={{
                  borderColor: entry.team.color,
                  backgroundColor: `${entry.team.color}15`,
                  boxShadow: `0 0 30px ${entry.team.color}40`,
                }}
              >
                <div className="flex items-center gap-4 sm:gap-6 mb-4">
                  {/* Rank */}
                  <div className="text-5xl sm:text-6xl font-black text-white drop-shadow-lg min-w-24 text-center">
                    {getMedalEmoji(idx) || <span className="text-4xl">{idx + 1}</span>}
                  </div>

                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 truncate drop-shadow-md">
                      {entry.team.name}
                    </h2>

                    {/* Points per Game */}
                    {Object.keys(entry.pointsPerGame).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {gameList
                          .filter((g) => entry.pointsPerGame[g.id])
                          .map((game) => (
                            <div
                              key={game.id}
                              className="bg-white/10 rounded-lg px-2 sm:px-3 py-1 backdrop-blur-sm"
                            >
                              <p className="text-xs sm:text-sm text-white/80 truncate">
                                {game.name}
                              </p>
                              <p className="font-bold text-sm sm:text-base text-white tabular-nums">
                                {entry.pointsPerGame[game.id]} pts
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Total Points - Large Display */}
                  <div className="text-center">
                    <div
                      className="text-5xl sm:text-6xl font-black tabular-nums drop-shadow-lg animate-pulse"
                      style={{ color: entry.team.color }}
                    >
                      {entry.totalPoints}
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm font-semibold mt-1">PTS</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(100, (entry.totalPoints / (leaderboard[0]?.totalPoints || 1)) * 100)}%`,
                      backgroundColor: entry.team.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Update Indicator */}
        <div className="mt-8 flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <p className="text-white/60 text-sm sm:text-base">Actualización en tiempo real</p>
        </div>
      </div>

      {/* Animated Background Effect */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes glow {
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

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}
