// src/components/WordGraph.tsx
// Bold, easy-to-click semantic network

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

    // Only 60 words for spacious, easy-to-click layout
    const filtered = lessonId 
      ? words.filter(w => w.lesson === lessonId).slice(0, 60)
      : words.slice(0, 60)

    // Use 80% of screen space - fill the viewport!
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) * 0.48
    
    nodes.current = filtered.map((w, i) => {
      const angle = (i / filtered.length) * Math.PI * 2
      // Vary radius from 50% to 100% of maxRadius
      const radiusVariation = 0.5 + Math.random() * 0.5
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

      // Draw connections when hovering
      if (hovered !== null) {
        const hoveredNode = nodes.current.find(n => n.id === hovered)
        if (hoveredNode) {
          nodes.current.forEach(other => {
            if (other.id === hovered) return
            const dx = hoveredNode.x - other.x
            const dy = hoveredNode.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 250) {
              ctx.strokeStyle = '#00ffff60'
              ctx.lineWidth = 2
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

        // HUGE dots - 25px radius!
        ctx.fillStyle = active ? '#ffd700' : `hsl(${hue}, 70%, 55%)`
        ctx.beginPath()
        ctx.arc(node.x, node.y, active ? 30 : 25, 0, Math.PI * 2)
        ctx.fill()

        // Draw massive glow for active node
        if (active) {
          ctx.strokeStyle = '#00ffff'
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.arc(node.x, node.y, 45, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Always show labels clearly
        ctx.fillStyle = active ? '#ffffff' : '#ffffffa0'
        ctx.font = active ? 'bold 20px sans-serif' : '13px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.text, node.x, node.y - (active ? 60 : 45))
        
        // Draw Portuguese translation when hovered
        if (active) {
          ctx.font = 'bold 16px sans-serif'
          ctx.fillStyle = '#00ffff'
          ctx.fillText(node.portuguese, node.x, node.y + 60)
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
          // MASSIVE 100px hover radius for super easy clicking!
          const found = nodes.current.find(n => 
            Math.hypot(n.x - x, n.y - y) < 100
          )
          setHovered(found?.id || null)
        }}
      />
      <div className="absolute top-8 left-8 bg-black/70 backdrop-blur rounded-2xl p-6 text-white max-w-xs">
        <h2 className="text-3xl font-bold mb-2">A Rede Semântica</h2>
        <p className="opacity-80 text-lg">Clique em qualquer palavra</p>
        <p className="text-sm opacity-60 mt-2">60 palavras principais</p>
      </div>
    </div>
  )
}
