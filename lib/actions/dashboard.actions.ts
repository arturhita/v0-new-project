;```typescriptreact file="components/constellation-background.tsx"
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

const handleResize = () => {
  w = canvas.width = window.innerWidth
  h = canvas.height = window.innerHeight
}
window.addEventListener("resize", handleResize)

type Star = {
  x: number
  y: number
  radius: number
  originalRadius: number
  vx: number
  vy: number
}

const stars: Star[] = []
const numStars = 250

for (let i = 0; i &lt; numStars; i++) {
  const radius = Math.random() * 1.2 + 0.8
  stars.push({
    x: Math.random() * w,
    y: Math.random() * h,
    radius: radius,
    originalRadius: radius,
    vx: (Math.random() - 0.5) * 15,
    vy: (Math.random() - 0.5) * 15,
  })
}

const distance = (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
  const xs = point2.x - point1.x
  const ys = point2.y - point1.y
  return Math.sqrt(xs * xs + ys * ys)
}

const draw = () => {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)

  // Draw stars
  for (const star of stars) {
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    ctx.fillStyle = \`rgba(255, 215, 0, ${Math.abs(Math.sin(star.radius))})` // Gold with opacity based on radius
ctx.fill()
\
  }

  // Draw lines
  ctx.beginPath()\
for (let i = 0; i &lt; stars.length;
i++
)
{
  \
  for (let j = i + 1; j &lt; stars.length;
  j++
  )
  {
    const d = distance(stars[i], stars[j])
    \
    if (d &lt;
    150
    )
    {
      const opacity = 1 - d / 150
      ctx.moveTo(stars[i].x, stars[i].y)
      ctx.lineTo(stars[j].x, stars[j].y)
      ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.3})` // Faint gold
      ctx.lineWidth = 0.4
      ctx.stroke()
      ctx.beginPath() // Reset path for next line segment
    }
  }
}
\
}

const update = () => {
  for (const s of stars) {
    s.x += s.vx / 60
    s.y += s.vy / 60
    \
    if (s.x &lt;
    0 || s.x > w
    ) s.vx = -s.vx\
    if (s.y &lt;
    0 || s.y > h
    ) s.vy = -s.vy

    // Pulsating effect for "flashing"
    s.radius = s.originalRadius * (1 + Math.sin(Date.now() / 400 + s.x) * 0.4)
  }
}

const tick = () => {
  draw()
  update()
  animationFrameId = requestAnimationFrame(tick)
}

tick()

return () => {
  window.removeEventListener("resize", handleResize)
  cancelAnimationFrame(animationFrameId)
}
\
}, [])

return (
<canvas
  ref={canvasRef}
  className="fixed top-0 left-0 -z-10"
  style={{
    background: "linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)",
  }}
/>
)
\
}
