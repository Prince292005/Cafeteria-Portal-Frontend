// FILE: components/site/cursor-trail.tsx
// Copy this entire content into: components/site/cursor-trail.tsx

"use client"

import { useEffect, useRef } from "react"

/**
 * CursorTrail
 * A confetti-burst cursor-trail effect inspired by Google Antigravity,
 * adapted to use this app's warm editorial palette.
 *
 * - Canvas-only, no external deps.
 * - pointer-events: none so it never blocks clicks.
 * - Uses mousemove for maximum compatibility.
 * - Self-throttling: spawn rate scales with cursor speed, particle count is capped.
 */

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
  shape: "dot" | "dash"
  rotation: number
  vr: number
}

// Warm editorial palette adapted from brand tokens + 2 accent additions
const PALETTE = [
  "oklch(0.58 0.145 38)", // terracotta
  "oklch(0.78 0.135 74)", // turmeric
  "oklch(0.44 0.072 158)", // forest
  "oklch(0.26 0.028 52)", // espresso
  "oklch(0.66 0.16 46)", // warm terracotta-light accent
  "oklch(0.62 0.18 18)", // spice rose
  "oklch(0.82 0.12 85)", // chai amber
]

const MAX_PARTICLES = 160

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const particles: Particle[] = []
    let lastX = 0
    let lastY = 0
    let hasPointer = false
    let rafId = 0
    let lastSpawn = 0

    const spawn = (x: number, y: number, speed: number) => {
      const count = Math.min(3, Math.max(1, Math.round(speed / 12)))
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift()
        const angle = Math.random() * Math.PI * 2
        const force = 0.6 + Math.random() * 1.9
        const maxLife = 50 + Math.random() * 30
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * force + (Math.random() - 0.5) * 0.6,
          vy: Math.sin(angle) * force - Math.random() * 0.8,
          size: 1.5 + Math.random() * 2.5,
          life: maxLife,
          maxLife,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          shape: Math.random() > 0.6 ? "dash" : "dot",
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
        })
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY
      if (!hasPointer) {
        lastX = x
        lastY = y
        hasPointer = true
      }
      const dx = x - lastX
      const dy = y - lastY
      const speed = Math.sqrt(dx * dx + dy * dy)

      const now = performance.now()
      if (now - lastSpawn > 12) {
        spawn(x, y, speed)
        lastSpawn = now
      }
      lastX = x
      lastY = y
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })

    const gravity = 0.025
    const friction = 0.975

    const tick = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life -= 1
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        p.vy += gravity
        p.vx *= friction
        p.vy *= friction
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.vr

        const t = p.life / p.maxLife // 1 -> 0
        const alpha = Math.max(0, t)
        const scale = 0.6 + t * 0.6

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color

        if (p.shape === "dot") {
          ctx.beginPath()
          ctx.arc(0, 0, p.size * scale, 0, Math.PI * 2)
          ctx.fill()
        } else {
          const w = p.size * 3.0 * scale
          const h = p.size * 0.6 * scale
          ctx.fillRect(-w / 2, -h / 2, w, h)
        }
        ctx.restore()
      }

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  )
}
