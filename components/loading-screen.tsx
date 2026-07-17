'use client'

import { useEffect, useState } from 'react'

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Fade out after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-50 transition-opacity duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
      }}>
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Logo Container */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Animated background glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-transparent blur-2xl animate-pulse"></div>
          
          {/* Logo */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full relative z-10"
          >
            {/* D shape */}
            <path
              d="M 60 40 L 90 40 Q 130 40 130 100 Q 130 160 90 160 L 60 160 Z"
              fill="white"
              opacity="0.9"
            />
            
            {/* Circular cutout for D */}
            <circle
              cx="110"
              cy="100"
              r="35"
              fill="black"
            />
            
            {/* P shape with gradient effect */}
            <path
              d="M 135 80 Q 160 80 160 105 Q 160 130 135 130 M 135 80 L 135 160"
              stroke="white"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </svg>

          {/* Shimmer effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 blur-sm"
            style={{
              animation: 'shimmer 3s infinite',
            }}
          ></div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-wider">
            DRAFTEA
          </h1>
          <p className="text-emerald-500/70 text-xs md:text-sm mt-2 uppercase tracking-widest">
            Evento Management
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2">
          <div
            className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500 animate-bounce"
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500 animate-bounce"
            style={{ animationDelay: '0.15s' }}
          ></div>
          <div
            className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500 animate-bounce"
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
