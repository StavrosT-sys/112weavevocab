// src/components/WordGraph.tsx
// Static semantic network - clean and spacious

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

    // Limit to 120 words for cleaner visualization
    const filtered = lessonId 
      ? words.filter(w => w.lesson === lessonId)
      : words.slice(0, 120)

    // Create spacious layout - use full screen with good spacing
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) * 0.45
    
    nodes.current = filtered.map((w, i) => {
      const angle = (i / filtered.length) * Math.PI * 2
      // Vary radius from 40% to 100% of maxRadius for depth
      const radiusVariation = 0.4 + Math.random() * 0.6
      const r = maxRadius * radiusVariation
      return {
        ...w,
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r
      }
    })

    let animationId: number

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#0f0720'
      ctx.fillRect(0, 0, width, height)

      // Draw connections (only for nearby nodes and when hovering)
      if (hovered !== null) {
        const hoveredNode = nodes.current.find(n => n.id === hovered)
        if (hoveredNode) {
          nodes.current.forEach(other => {
            if (other.id === hovered) return
            const dx = hoveredNode.x - other.x
            const dy = hoveredNode.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 200) {
              ctx.strokeStyle = '#00ffff40'
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(hoveredNode.x, hoveredNode.y)
              ctx.lineTo(other.x, other.y)
              ctx.stroke()
            }
          })
        }
      }

      // Draw nodes
      nodes.current.forEach(node => {
        const hue = node.stability * 120
        const active = hovered === node.id

        // Draw circle
        ctx.fillStyle = active ? '#ffd700' : `hsl(${hue}, 70%, 55%)`
        ctx.beginPath()
        ctx.arc(node.x, node.y, active ? 12 : 8, 0, Math.PI * 2)
        ctx.fill()

        // Draw glow for active node
        if (active) {
          ctx.strokeStyle = '#00ffff'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(node.x, node.y, 20, 0, Math.PI * 2)
          ctx.stroke()
          
          // Draw text only when hovered
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 18px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(node.text, node.x, node.y - 35)
          
          // Draw Portuguese translation
          ctx.font = 'bold 14px sans-serif'
          ctx.fillStyle = '#00ffff'
          ctx.fillText(node.portuguese, node.x, node.y + 35)
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
            Math.hypot(n.x - x, n.y - y) < 30
          )
          setHovered(found?.id || null)
        }}
      />
      <div className="absolute top-8 left-8 bg-black/70 backdrop-blur rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">A Rede Semântica</h2>
        <p className="opacity-80">Passe o mouse sobre qualquer palavra</p>
        <p className="text-sm opacity-60 mt-2">120 palavras do Oxford 3000</p>
      </div>
    </div>
  )
}
