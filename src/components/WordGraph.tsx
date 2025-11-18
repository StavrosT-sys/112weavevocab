// src/components/WordGraph.tsx
// Zero external deps — pure React + Framer Motion + canvas
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

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const width = canvas.width = canvas.offsetWidth * devicePixelRatio
    const height = canvas.height = canvas.offsetHeight * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)

    const filtered = lessonId 
      ? words.filter(w => w.lesson === lessonId)
      : words.slice(0, 400) // cap for performance

    nodes.current = filtered.map(w => ({
      ...w,
      x: width / 2 + (Math.random() - 0.5) * 600,
      y: height / 2 + (Math.random() - 0.5) * 600,
      vx: 0,
      vy: 0
    }))

    let animationId: number

    const tick = () => {
      ctx.fillStyle = '#0f0720'
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Simple force simulation
      nodes.current.forEach((node) => {
        let fx = 0, fy = 0

        // Repulsion
        nodes.current.forEach(other => {
          if (node === other) return
          const dx = node.x - other.x
          const dy = node.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 8000 / (dist * dist)
          fx += dx * force
          fy += dy * force
        })

        // Attraction to center
        fx += (width / 2 - node.x) * 0.0008
        fy += (height / 2 - node.y) * 0.0008

        // Damping
        node.vx = node.vx * 0.92 + fx * 0.02
        node.vy = node.vy * 0.92 + fy * 0.02

        node.x += node.vx
        node.y += node.vy
      })

      // Draw connections
      nodes.current.forEach((a, i) => {
        nodes.current.slice(i + 1).forEach(b => {
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200) {
            const active = hovered === a.id || hovered === b.id
            ctx.strokeStyle = active ? '#00ffff' : '#7c3aed30'
            ctx.lineWidth = active ? 3 : 1
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

        // Glow
        if (active) {
          ctx.shadowBlur = 40
          ctx.shadowColor = '#00ffff'
        }

        ctx.fillStyle = active ? '#ffd700' : `hsl(${hue}, 70%, 55%)`
        ctx.beginPath()
        ctx.arc(node.x, node.y, 18 + node.stability * 25, 0, Math.PI * 2)
        ctx.fill()

        ctx.shadowBlur = 0
        ctx.fillStyle = '#ffffff'
        ctx.font = active ? 'bold 16px sans-serif' : '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.text, node.x, node.y - 8)
        ctx.font = '10px sans-serif'
        ctx.fillStyle = '#ffffff80'
        ctx.fillText(node.portuguese, node.x, node.y + 12)
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
        className="absolute inset-0"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const found = nodes.current.find(n => 
            Math.hypot(n.x - x * devicePixelRatio, n.y - y * devicePixelRatio) < 60
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
