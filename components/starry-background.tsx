"use client"

import { useEffect, useRef } from "react"

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let stars: Array<{ x: number; y: number; radius: number; alpha: number; dAlpha: number }> = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stars = [] // Reset stars on resize
      createStars()
    }

    const createStars = () => {
      const starCount = Math.floor((canvas.width * canvas.height) / 5000) // Adjust density
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3, // Star size
          alpha: Math.random() * 0.5 + 0.5, // Initial opacity
          dAlpha: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1), // Twinkle speed and direction
        })
      }
    }

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)" // Star color with slight transparency

      stars.forEach((star) => {
        ctx.save()
        ctx.globalAlpha = star.alpha
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Twinkle effect
        star.alpha += star.dAlpha
        if (star.alpha <= 0.3 || star.alpha >= 1) {
          star.dAlpha *= -1 // Reverse twinkle direction
        }

        // Parallax-like movement (subtle)
        // star.x -= 0.02;
        // if (star.x < 0) star.x = canvas.width;
      })
    }

    const animate = () => {
      drawStars()
      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas() // Initial setup
    animate()

    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />
}
