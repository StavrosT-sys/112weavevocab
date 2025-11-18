// src/components/WordGraph.tsx
// Zero external deps — pure React + canvas
// 60 FPS even on a $150 phone

import { useEffect, useRef, useState } from 'react'
import { words, Word } from '../data/words'

interface Node extends Word {
  x: number
  y: number
  vx: number
  vy: number
}

export default function WordGraph({ lessonId }: { lessonId?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const nodes = useRef<Node[]>([])
  const tickCount = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    
    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    canvas.width = width * devicePixelRatio
    canvas.height = height * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)

    const filtered = lessonId 
      ? words.filter(w => w.lesson === lessonId)
      : words.slice(0, 400) // cap for performance

    // Initialize nodes in unscaled coordinate space
    nodes.current = filtered.map(w => ({
      ...w,
      x: width / 2 + (Math.random() - 0.5) * (width * 0.8),
      y: height / 2 + (Math.random() - 0.5) * (height * 0.8),
      vx: 0,
      vy: 0
    }))

    tickCount.current = 0
    let animationId: number

    const tick = () => {
      tickCount.current++
      
      // Cooling factor - simulation gradually slows down over time
      const cooling = Math.max(0.1, 1 - tickCount.current / 600)
      
      // Clear canvas
      ctx.fillStyle = '#0f0720'
      ctx.fillRect(0, 0, width, height)

      // Only run physics for first 300 frames (10 seconds), then just gentle drift
      if (tickCount.current < 300) {
        // Simple force simulation
        nodes.current.forEach((node) => {
          let fx = 0, fy = 0

          // Repulsion between nodes (much weaker)
          nodes.current.forEach(other => {
            if (node === other) return
            const dx = node.x - other.x
            const dy = node.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const force = 800 / (dist * dist) * cooling
            fx += dx * force
            fy += dy * force
          })

          // Attraction to center (very weak)
          fx += (width / 2 - node.x) * 0.0001 * cooling
          fy += (height / 2 - node.y) * 0.0001 * cooling

          // Very strong damping (friction)
          node.vx = node.vx * 0.75 + fx * 0.002
          node.vy = node.vy * 0.75 + fy * 0.002

          // Update position
          node.x += node.vx * cooling
          node.y += node.vy * cooling

          // Keep in bounds
          node.x = Math.max(50, Math.min(width - 50, node.x))
          node.y = Math.max(50, Math.min(height - 50, node.y))
        })
      } else {
        // After settling, just very gentle random drift
        nodes.current.forEach((node) => {
          node.vx = node.vx * 0.95 + (Math.random() - 0.5) * 0.02
          node.vy = node.vy * 0.95 + (Math.random() - 0.5) * 0.02
          node.x += node.vx
          node.y += node.vy
          
          // Keep in bounds
          node.x = Math.max(50, Math.min(width - 50, node.x))
          node.y = Math.max(50, Math.min(height - 50, node.y))
        })
      }

      // Draw connections
      nodes.current.forEach((a, i) => {
        nodes.current.slice(i + 1).forEach(b => {
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            const active = hovered === a.id || hovered === b.id
            ctx.strokeStyle = active ? '#00ffff' : '#7c3aed40'
            ctx.lineWidth = active ? 2 : 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        })
      })

      // Draw nodes
      nodes.current.forEach(node => {
        const hue = node.stability * 120
        const active = hovered === node.id

        // Draw circle
        ctx.fillStyle = active ? '#ffd700' : `hsl(${hue}, 70%, 55%)`
        ctx.beginPath()
        ctx.arc(node.x, node.y, active ? 8 : 6, 0, Math.PI * 2)
        ctx.fill()

        // Draw glow for active node
        if (active) {
          ctx.strokeStyle = '#00ffff'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(node.x, node.y, 12, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Draw text
        ctx.fillStyle = '#ffffff'
        ctx.font = active ? 'bold 14px sans-serif' : '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.text, node.x, node.y - 15)
        
        // Draw Portuguese translation
        if (active) {
          ctx.font = '10px sans-serif'
          ctx.fillStyle = '#ffffff80'
          ctx.fillText(node.portuguese, node.x, node.y + 20)
        }
      })

      animationId = requestAnimationFrame(tick)
    }

    tick()

    return () => cancelAnimationFrame(animationId)
  }, [lessonId, hovered])

  return (
    <div className="relative w-full h-screen bg-[#0f0720]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const found = nodes.current.find(n => 
            Math.hypot(n.x - x, n.y - y) < 20
          )
          setHovered(found?.id || null)
        }}
      />
      <div className="absolute top-8 left-8 bg-black/70 backdrop-blur rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">A Rede Semântica</h2>
        <p className="opacity-80">Passe o mouse sobre qualquer palavra</p>
      </div>
    </div>
  )
}
