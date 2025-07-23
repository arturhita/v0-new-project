"use client"

import { Stars } from "lucide-react"
import { cn } from "@/lib/utils"

// Modificato: Aggiunta prop 'goldVisible' per controllare il colore
export const ConstellationBackground = ({
  className,
  goldVisible = false,
}: {
  className?: string
  goldVisible?: boolean
}) => (
  <div
    className={cn(
      "absolute inset-0 overflow-hidden pointer-events-none",
      goldVisible ? "text-yellow-400/70" : "text-sky-300/70", // Applica il colore in base alla prop
      className,
    )}
  >
    {/* Orsa Maggiore LAMPEGGIANTE */}
    <div className="absolute top-20 left-20 animate-pulse">
      <svg width="120" height="80" viewBox="0 0 120 80" className="opacity-50">
        <circle cx="10" cy="20" r="2" fill="currentColor" className="animate-pulse" />
        <circle
          cx="30"
          cy="15"
          r="2"
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <circle cx="50" cy="10" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: "1s" }} />
        <circle
          cx="70"
          cy="15"
          r="2"
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <circle cx="85" cy="25" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: "2s" }} />
        <circle
          cx="75"
          cy="45"
          r="2"
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDelay: "2.5s" }}
        />
        <circle cx="55" cy="50" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: "3s" }} />
        <line x1="10" y1="20" x2="30" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <line x1="30" y1="15" x2="50" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <line x1="50" y1="10" x2="70" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <line x1="70" y1="15" x2="85" y2="25" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <line x1="85" y1="25" x2="75" y2="45" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <line x1="75" y1="45" x2="55" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
      </svg>
    </div>

    {/* Cassiopea LAMPEGGIANTE */}
    <div className="absolute top-40 right-32 animate-pulse">
      <svg width="100" height="60" viewBox="0 0 100 60" className="opacity-50">
        <circle
          cx="10"
          cy="30"
          r="2"
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDelay: "0.2s" }}
        />
        <circle
          cx="30"
          cy="10"
          r="2"
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDelay: "0.7s" }}
        />
        <circle
          cx="50"
          cy="40"
          r="2"
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDelay: "1.2s" }}
        />
        <circle
          cx="70"
          cy="15"
          r="2"
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDelay: "1.7s" }}
        />
        <circle
          cx="90"
          cy="35"
          r="2"
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDelay: "2.2s" }}
        />
        <line x1="10" y1="30" x2="30" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <line x1="30" y1="10" x2="50" y2="40" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <line x1="50" y1="40" x2="70" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <line x1="70" y1="15" x2="90" y2="35" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
      </svg>
    </div>

    {/* Stelle sparse animate con movimento LAMPEGGIANTI */}
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${2 + Math.random() * 4}s`,
        }}
      >
        <Stars
          className="w-2 h-2 opacity-60"
          style={{
            animationDuration: `${1.5 + Math.random() * 2}s`,
          }}
        />
      </div>
    ))}
  </div>
)
