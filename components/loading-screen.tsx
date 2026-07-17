'use client'

import { useEffect, useState, createContext, useContext } from 'react'

interface LoadingContextType {
  isLoading: boolean
}

const LoadingContext = createContext<LoadingContextType>({ isLoading: false })

export function useLoading() {
  return useContext(LoadingContext)
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function LoadingScreen() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-background via-background to-background dark:from-black dark:via-black dark:to-black z-50 transition-opacity duration-500"
      style={{
        opacity: isLoading ? 1 : 0,
      }}>
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Logo Container */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
          {/* Animated background glow - adapts to theme */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent blur-2xl animate-pulse"></div>
          
          {/* NC CAMP Leaf Logo */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full relative z-10"
          >
            {/* Leaf background oval - adapts to theme */}
            <ellipse
              cx="100"
              cy="100"
              rx="85"
              ry="95"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-emerald-600 dark:text-emerald-500"
            />
            
            {/* Leaf shape */}
            <g className="text-emerald-600 dark:text-emerald-500">
              {/* Leaf outline */}
              <path
                d="M 100 30 Q 130 60 130 100 Q 130 140 100 160 Q 70 140 70 100 Q 70 60 100 30 Z"
                fill="currentColor"
                opacity="0.9"
              />
              
              {/* Leaf stem */}
              <line
                x1="100"
                y1="160"
                x2="100"
                y2="175"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Leaf vein (center) */}
              <line
                x1="100"
                y1="30"
                x2="100"
                y2="160"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
                opacity="0.5"
              />
            </g>
          </svg>

          {/* Shimmer effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-20 blur-sm"
            style={{
              animation: 'shimmer 3s infinite',
            }}
          ></div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-wider">
            NC CAMP
          </h1>
          <p className="text-emerald-600 dark:text-emerald-500 text-xs md:text-sm mt-2 uppercase tracking-widest font-semibold">
            Campamento Management
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2">
          <div
            className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-bounce"
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-bounce"
            style={{ animationDelay: '0.15s' }}
          ></div>
          <div
            className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-bounce"
            style={{ animationDelay: '0.3s' }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
