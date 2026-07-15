"use client"

import { useEffect, useRef } from "react"

/**
 * AmbientParticles
 * A continuous, always-running particle drift — matching the behavior on
 * antigravity.google. It is 100% ambient, not tied to the cursor, wraps around
 * all edges, and uses a desaturated warm editorial palette matching the brand.
 */

type Fleck = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  rotation: number
  vr: number
  length: number
  shape: "dot" | "dash"
}

// Brand colors as rgba — oklch is NOT supported by Canvas 2D API in all browsers
const PALETTE = [
  { color: "rgba(181, 74, 47, 1)",  weight: 7 },  // terracotta (primary)
  { color: "rgba(66, 107, 82, 1)",  weight: 5 },  // forest
  { color: "rgba(58, 48, 42, 1)",   weight: 4 },  // espresso-dark
  { color: "rgba(198, 163, 72, 1)", weight: 2 },  // turmeric
  { color: "rgba(192, 73, 56, 1)",  weight: 2 },  // spice rose
]

const DENSITY_PER_1000PX2 = 0.035 // 0.035 particles per 1000px^2 (~70-90 on 1080p screen)

export function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let flecks: Fleck[] = []

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let isAnimating = !mediaQuery.matches

    const getRandomColor = () => {
      const totalWeight = PALETTE.reduce((sum, item) => sum + item.weight, 0)
      let random = Math.random() * totalWeight
      for (const item of PALETTE) {
        if (random < item.weight) {
          return item.color
        }
        random -= item.weight
      }
      return PALETTE[0].color
    }

    const makeFleck = (randomizeX = true): Fleck => {
      const angle = Math.random() * Math.PI * 2 // float in any direction
      const speed = 0.06 + Math.random() * 0.12 // drift speed: 0.06 to 0.18 px/frame
      const shape = Math.random() < 0.4 ? "dot" : "dash" // 40:60 dot:dash ratio
      const size = 2.0 + Math.random() * 2.0 // dot radius: 2.0 to 4.0 px
      const thickness = 1.5 + Math.random() * 1.5 // dash thickness: 1.5 to 3.0 px

      return {
        x: Math.random() * width,
        y: randomizeX ? Math.random() * height : -10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: shape === "dot" ? size : thickness,
        opacity: 0.35 + Math.random() * 0.30, // opacity range: 0.35 to 0.65
        color: getRandomColor(),
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.03, // rotation speed: ±0.015 rad/frame
        length: 6 + Math.random() * 10, // dash length: 6 to 16 px
        shape,
      }
    }

    const populate = () => {
      const area = width * height
      const count = Math.max(30, Math.min(140, Math.round((area / 1000) * DENSITY_PER_1000PX2)))
      
      if (flecks.length === 0) {
        flecks = Array.from({ length: count }, () => makeFleck(true))
      } else if (flecks.length < count) {
        const diff = count - flecks.length
        for (let i = 0; i < diff; i++) {
          flecks.push(makeFleck(true))
        }
      } else if (flecks.length > count) {
        flecks.length = count
      }
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      populate()
    }
    resize()
    window.addEventListener("resize", resize)

    let rafId = 0

    const tick = () => {
      if (!isAnimating) return
      ctx.clearRect(0, 0, width, height)

      for (const f of flecks) {
        f.x += f.vx
        f.y += f.vy
        f.rotation += f.vr

        // wrap around all 4 edges so the field is continuous and always populated
        if (f.x > width + 20) f.x = -20
        if (f.x < -20) f.x = width + 20
        if (f.y > height + 20) f.y = -20
        if (f.y < -20) f.y = height + 20

        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.rotate(f.rotation)
        ctx.globalAlpha = f.opacity
        if (f.shape === "dot") {
          ctx.fillStyle = f.color
          ctx.beginPath()
          ctx.arc(0, 0, f.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.strokeStyle = f.color
          ctx.lineWidth = f.size // dash thickness
          ctx.lineCap = "round"
          ctx.beginPath()
          ctx.moveTo(-f.length / 2, 0)
          ctx.lineTo(f.length / 2, 0)
          ctx.stroke()
        }
        ctx.restore()
      }

      rafId = requestAnimationFrame(tick)
    }

    const handleMediaChange = (e: MediaQueryListEvent) => {
      const reduce = e.matches
      if (reduce) {
        isAnimating = false
        ctx.clearRect(0, 0, width, height)
      } else {
        if (!isAnimating) {
          isAnimating = true
          rafId = requestAnimationFrame(tick)
        }
      }
    }
    mediaQuery.addEventListener("change", handleMediaChange)

    if (isAnimating) {
      rafId = requestAnimationFrame(tick)
    }

    return () => {
      window.removeEventListener("resize", resize)
      mediaQuery.removeEventListener("change", handleMediaChange)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9998,
      }}
    />
  )
}
