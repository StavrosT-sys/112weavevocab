// src/components/WordGraph.tsx
// Static semantic network - no physics, just beautiful visualization

import { useEffect, useRef, useState } from 'react'
import { words, Word } from '../data/words'

interface Node extends Word {
  x: number
  y: number
}

export default function WordGraph({ lessonId }: { lessonId?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const nodes = useRef<Node[]>([])

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

    // Create static layout - circular arrangement with some randomness
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35
    
    nodes.current = filtered.map((w, i) => {
      const angle = (i / filtered.length) * Math.PI * 2
      const r = radius * (0.5 + Math.random() * 0.5)
      return {
        ...w,
        x: centerX + Math.cos(angle) * r + (Math.random() - 0.5) * 50,
        y: centerY + Math.sin(angle) * r + (Math.random() - 0.5) * 50
      }
    })

    let animationId: number

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#0f0720'
      ctx.fillRect(0, 0, width, height)

      // Draw connections (only for nearby nodes)
      nodes.current.forEach((a, i) => {
        nodes.current.slice(i + 1).forEach(b => {
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const active = hovered === a.id || hovered === b.id
            ctx.strokeStyle = active ? '#00ffff80' : '#7c3aed20'
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
        ctx.arc(node.x, node.y, active ? 10 : 6, 0, Math.PI * 2)
        ctx.fill()

        // Draw glow for active node
        if (active) {
          ctx.strokeStyle = '#00ffff'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(node.x, node.y, 16, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Always draw text for better visibility
        ctx.fillStyle = active ? '#ffffff' : '#ffffff80'
        ctx.font = active ? 'bold 14px sans-serif' : '11px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.text, node.x, node.y - 18)
        
        // Draw Portuguese translation when hovered
        if (active) {
          ctx.font = 'bold 12px sans-serif'
          ctx.fillStyle = '#00ffff'
          ctx.fillText(node.portuguese, node.x, node.y + 25)
        }
      })

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animationId)
  }, [lessonId, hovered])

  return (
    <div className="relative w-full h-screen bg-[#0f0720]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const found = nodes.current.find(n => 
            Math.hypot(n.x - x, n.y - y) < 25
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
