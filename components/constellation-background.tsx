"use client"

import { useEffect, useRef } from "react"

interface ConstellationBackgroundProps {
  className?: string
  goldVisible?: boolean
}

export function ConstellationBackground({ className = "", goldVisible = false }: ConstellationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Stelle
    const stars: Array<{ x: number; y: number; size: number; opacity: number; twinkleSpeed: number }> = []
    const numStars = 150

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      })
    }

    // Costellazioni (linee tra stelle)
    const connections: Array<{ from: number; to: number }> = []
    for (let i = 0; i < numStars; i++) {
      const numConnections = Math.random() < 0.3 ? 1 : 0
      for (let j = 0; j < numConnections; j++) {
        const targetIndex = Math.floor(Math.random() * numStars)
        if (targetIndex !== i) {
          const distance = Math.sqrt(
            Math.pow(stars[i].x - stars[targetIndex].x, 2) + Math.pow(stars[i].y - stars[targetIndex].y, 2),
          )
          if (distance < 200) {
            connections.push({ from: i, to: targetIndex })
          }
        }
      }
    }

    let animationId: number
    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.01

      // Disegna le connessioni (costellazioni)
      ctx.strokeStyle = goldVisible ? "rgba(255, 215, 0, 0.15)" : "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1
      connections.forEach((connection) => {
        const star1 = stars[connection.from]
        const star2 = stars[connection.to]
        ctx.beginPath()
        ctx.moveTo(star1.x, star1.y)
        ctx.lineTo(star2.x, star2.y)
        ctx.stroke()
      })

      // Disegna le stelle
      stars.forEach((star, index) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + index) * 0.3 + 0.7
        const opacity = star.opacity * twinkle

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = goldVisible ? `rgba(255, 215, 0, ${opacity * 0.8})` : `rgba(255, 255, 255, ${opacity})`
        ctx.fill()

        // Effetto scintillio per stelle più grandi
        if (star.size > 1.5) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2)
          ctx.fillStyle = goldVisible ? `rgba(255, 215, 0, ${opacity * 0.3})` : `rgba(255, 255, 255, ${opacity * 0.3})`
          ctx.fill()
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [goldVisible])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ background: "transparent" }}
    />
  )
}
