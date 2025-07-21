"use client"

import type React from "react"
import { useRef, useEffect } from "react"

export const ConstellationBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    })

    const stars: {
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      color: string
      opacity: number
    }[] = []
    const numStars = 200
    const colors = ["#FFD700", "#F0E68C", "#FFFACD", "#FFFFFF"] // Gold and white shades

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      ctx.globalCompositeOperation = "lighter"

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI)
        ctx.fill()

        // Pulsating effect
        const pulse = Math.sin(Date.now() * 0.001 + i) * 0.2 + 0.8
        ctx.globalAlpha = s.opacity * pulse
      }

      ctx.beginPath()
      for (let i = 0; i < stars.length; i++) {
        const starI = stars[i]
        ctx.moveTo(starI.x, starI.y)
        for (let j = 0; j < stars.length; j++) {
          const starJ = stars[j]
          const distance = Math.sqrt(Math.pow(starJ.x - starI.x, 2) + Math.pow(starJ.y - starI.y, 2))
          if (distance < 150) {
            ctx.lineTo(starJ.x, starJ.y)
          }
        }
      }
      ctx.lineWidth = 0.05
      ctx.strokeStyle = "rgba(255, 215, 0, 0.3)" // Faint gold lines
      ctx.stroke()
      ctx.globalAlpha = 1 // Reset alpha
    }

    function update() {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        s.x += s.vx
        s.y += s.vy

        if (s.x < 0 || s.x > width) s.vx = -s.vx
        if (s.y < 0 || s.y > height) s.vy = -s.vy
      }
    }

    let animationFrameId: number

    function animate() {
      draw()
      update()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", () => {
        width = canvas.width = window.innerWidth
        height = canvas.height = window.innerHeight
      })
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
}
