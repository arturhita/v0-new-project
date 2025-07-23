"use client"

import { useRef, useEffect } from "react"

const ConstellationBackground = () => {
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

    const stars: { x: number; y: number; radius: number; vx: number; vy: number; alpha: number; dying: boolean }[] = []
    const numStars = 200

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        alpha: Math.random() * 0.5 + 0.5,
        dying: false,
      })
    }

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      ctx.fillStyle = "rgba(255, 215, 0, 0.8)" // Gold color
      ctx.shadowBlur = 10
      ctx.shadowColor = "rgba(255, 215, 0, 0.5)"

      stars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.globalAlpha = star.alpha
        ctx.fill()

        star.x += star.vx
        star.y += star.vy

        if (star.x < 0 || star.x > width) star.vx *= -1
        if (star.y < 0 || star.y > height) star.vy *= -1

        // Twinkling effect
        if (!star.dying) {
          star.alpha += 0.02 * (Math.random() - 0.5)
          if (star.alpha < 0.1) star.alpha = 0.1
          if (star.alpha > 1) star.alpha = 1
        }
      })

      // Draw lines between nearby stars
      ctx.strokeStyle = "rgba(255, 215, 0, 0.1)"
      ctx.lineWidth = 0.5
      for (let i = 0; i < numStars; i++) {
        for (let j = i + 1; j < numStars; j++) {
          const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(stars[i].x, stars[i].y)
            ctx.lineTo(stars[j].x, stars[j].y)
            ctx.stroke()
          }
        }
      }

      requestAnimationFrame(draw)
    }

    draw()
  }, [])

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
}

export default ConstellationBackground
