"use client"
import { useRef, useEffect } from "react"

export const ConstellationBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    let animationFrameId: number
    let time = 0

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    })

    const stars: {
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      pulseOffset: number
    }[] = []
    const numStars = 200

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        pulseOffset: Math.random() * Math.PI * 2,
      })
    }

    const draw = () => {
      if (!ctx) return
      time += 0.01
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = "lighter"

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        const pulse = Math.sin(time + s.pulseOffset) * 0.4 + 0.8 // Pulsing factor between 0.4 and 1.2

        ctx.beginPath()
        const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * pulse)
        gradient.addColorStop(0, "rgba(255, 215, 0, 0.8)") // Gold center
        gradient.addColorStop(0.5, "rgba(255, 215, 0, 0.4)")
        gradient.addColorStop(1, "rgba(255, 215, 0, 0)")

        ctx.fillStyle = gradient
        ctx.arc(s.x, s.y, s.radius * pulse * 2, 0, 2 * Math.PI)
        ctx.fill()
      }

      ctx.beginPath()
      for (let i = 0; i < stars.length; i++) {
        const starI = stars[i]
        for (let j = i + 1; j < stars.length; j++) {
          const starJ = stars[j]
          const dist = distance(starI, starJ)
          if (dist < 150) {
            ctx.moveTo(starI.x, starI.y)
            ctx.lineTo(starJ.x, starJ.y)
            ctx.strokeStyle = `rgba(255, 215, 0, ${1 - dist / 150})` // Fading gold lines
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    const distance = (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
      const xs = point2.x - point1.x
      const ys = point2.y - point1.y
      return Math.sqrt(xs * xs + ys * ys)
    }

    const update = () => {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        s.x += s.vx
        s.y += s.vy

        if (s.x < 0 || s.x > w) s.vx = -s.vx
        if (s.y < 0 || s.y > h) s.vy = -s.vy
      }
    }

    const tick = () => {
      draw()
      update()
      animationFrameId = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      window.removeEventListener("resize", () => {})
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        background: "linear-gradient(to bottom, #0f172a, #1e293b)",
      }}
    />
  )
}
