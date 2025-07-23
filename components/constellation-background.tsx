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

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    })

    const stars: { x: number; y: number; radius: number; vx: number; vy: number }[] = []
    const numStars = 200

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 1 + 1,
        vx: Math.floor(Math.random() * 50) - 25,
        vy: Math.floor(Math.random() * 50) - 25,
      })
    }

    const draw = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = "lighter"

      for (let i = 0, x = stars.length; i < x; i++) {
        const s = stars[i]
        ctx.fillStyle = "#fff"
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.fillStyle = "black"
        ctx.stroke()
      }

      ctx.beginPath()
      for (let i = 0, x = stars.length; i < x; i++) {
        const starI = stars[i]
        ctx.moveTo(starI.x, starI.y)
        for (let j = 0, y = stars.length; j < y; j++) {
          const starJ = stars[j]
          if (distance(starI, starJ) < 150) {
            ctx.lineTo(starJ.x, starJ.y)
          }
        }
      }
      ctx.lineWidth = 0.05
      ctx.strokeStyle = "white"
      ctx.stroke()
    }

    const distance = (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
      let xs = 0
      let ys = 0
      xs = point2.x - point1.x
      xs = xs * xs
      ys = point2.y - point1.y
      ys = ys * ys
      return Math.sqrt(xs + ys)
    }

    const update = () => {
      for (let i = 0, x = stars.length; i < x; i++) {
        const s = stars[i]
        s.x += s.vx / 60
        s.y += s.vy / 60

        if (s.x < 0 || s.x > w) s.vx = -s.vx
        if (s.y < 0 || s.y > h) s.vy = -s.vy
      }
    }

    let animationFrameId: number
    const tick = () => {
      draw()
      update()
      animationFrameId = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      window.removeEventListener("resize", () => {
        w = canvas.width = window.innerWidth
        h = canvas.height = window.innerHeight
      })
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
