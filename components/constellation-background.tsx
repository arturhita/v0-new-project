"use client"
import type React from "react"
import { useRef, useEffect } from "react"

const ConstellationBackground: React.FC = () => {
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

    const stars: Star[] = []
    const numStars = 150

    class Star {
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      opacity: number
      phase: "increasing" | "decreasing"

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.radius = Math.random() * 1.2 + 0.5
        this.vx = (Math.random() - 0.5) * 0.1
        this.vy = (Math.random() - 0.5) * 0.1
        this.opacity = Math.random() * 0.5 + 0.2
        this.phase = Math.random() > 0.5 ? "increasing" : "decreasing"
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`
        ctx.fill()
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1

        if (this.phase === "increasing") {
          this.opacity += 0.005
          if (this.opacity >= 0.9) this.phase = "decreasing"
        } else {
          this.opacity -= 0.005
          if (this.opacity <= 0.1) this.phase = "increasing"
        }
      }
    }

    for (let i = 0; i < numStars; i++) {
      stars.push(new Star())
    }

    function drawLines() {
      if (!ctx) return
      for (let i = 0; i < numStars; i++) {
        for (let j = i + 1; j < numStars; j++) {
          const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(stars[i].x, stars[i].y)
            ctx.lineTo(stars[j].x, stars[j].y)
            ctx.strokeStyle = `rgba(255, 215, 0, ${1 - dist / 100})`
            ctx.lineWidth = 0.2
            ctx.stroke()
          }
        }
      }
    }

    let animationFrameId: number

    function animate() {
      ctx?.clearRect(0, 0, width, height)
      stars.forEach((star) => {
        star.update()
        star.draw()
      })
      drawLines()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", () => {})
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />
}

export default ConstellationBackground
