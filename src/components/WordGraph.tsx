// src/components/WordGraph.tsx
// React Flow semantic network - proper event handling!

import { useCallback, useMemo } from 'react'
import ReactFlow, { 
  Node, 
  Edge, 
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  NodeMouseHandler
} from 'reactflow'
import 'reactflow/dist/style.css'
import { words } from '../data/words'

export default function WordGraph({ lessonId }: { lessonId?: number }) {
  // Filter words
  const filtered = useMemo(() => 
    lessonId 
      ? words.filter(w => w.lesson === lessonId).slice(0, 60)
      : words.slice(0, 60),
    [lessonId]
  )

  // Create nodes in circular layout
  const initialNodes: Node[] = useMemo(() => {
    const centerX = 400
    const centerY = 400
    const radius = 350

    return filtered.map((word, i) => {
      const angle = (i / filtered.length) * Math.PI * 2
      const radiusVariation = 0.5 + Math.random() * 0.5
      const r = radius * radiusVariation
      const bgColor = `hsl(${word.stability * 120}, 70%, 55%)`

      return {
        id: word.id.toString(),
        type: 'default',
        position: {
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r
        },
        data: { 
          label: (
            <div className="text-center">
              <div className="font-bold text-sm">{word.text}</div>
              <div className="text-xs text-cyan-400 mt-1">{word.portuguese}</div>
            </div>
          ),
          originalBg: bgColor // Store original color
        },
        style: {
          background: bgColor,
          color: 'white',
          border: '2px solid transparent',
          borderRadius: '50%',
          width: 80,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '12px',
          padding: '8px',
          transition: 'all 0.2s ease'
        }
      }
    })
  }, [filtered])

  // Create edges (connections between nearby nodes)
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = []
    initialNodes.forEach((nodeA, i) => {
      initialNodes.slice(i + 1).forEach(nodeB => {
        const dx = nodeA.position.x - nodeB.position.x
        const dy = nodeA.position.y - nodeB.position.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          edges.push({
            id: `${nodeA.id}-${nodeB.id}`,
            source: nodeA.id,
            target: nodeB.id,
            style: { stroke: '#7c3aed40', strokeWidth: 1 },
            animated: false
          })
        }
      })
    })
    return edges
  }, [initialNodes])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Handle node hover
  const onNodeMouseEnter: NodeMouseHandler = useCallback((_event, node) => {
    // Highlight the hovered node
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            style: {
              background: '#ffd700',
              color: 'white',
              border: '4px solid #00ffff',
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '8px',
              boxShadow: '0 0 20px #00ffff',
              transform: 'scale(1.2)',
              zIndex: 1000,
              transition: 'all 0.2s ease'
            }
          }
        }
        return n
      })
    )

    // Highlight connected edges
    setEdges((eds) =>
      eds.map((e) => {
        if (e.source === node.id || e.target === node.id) {
          return {
            ...e,
            style: { stroke: '#00ffff', strokeWidth: 2 },
            animated: true
          }
        }
        return e
      })
    )
  }, [setNodes, setEdges])

  const onNodeMouseLeave: NodeMouseHandler = useCallback((_event, node) => {
    // Reset node style using stored original color
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            style: {
              background: n.data.originalBg || '#ef4444', // Fallback to red
              color: 'white',
              border: '2px solid transparent',
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '8px',
              boxShadow: 'none',
              transform: 'scale(1)',
              zIndex: 1,
              transition: 'all 0.2s ease'
            }
          }
        }
        return n
      })
    )

    // Reset edges
    setEdges((eds) =>
      eds.map((e) => {
        if (e.source === node.id || e.target === node.id) {
          return {
            ...e,
            style: { stroke: '#7c3aed40', strokeWidth: 1 },
            animated: false
          }
        }
        return e
      })
    )
  }, [setNodes, setEdges])

  return (
    <div className="relative w-full h-screen bg-[#0f0720]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        fitView
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#7c3aed20" gap={16} />
        <Controls />
      </ReactFlow>
      
      <div className="absolute top-8 left-8 bg-black/70 backdrop-blur rounded-2xl p-6 text-white max-w-xs pointer-events-none">
        <h2 className="text-3xl font-bold mb-2">A Rede Semântica</h2>
        <p className="opacity-80 text-lg">Passe o mouse sobre qualquer palavra</p>
        <p className="text-sm opacity-60 mt-2">60 palavras principais</p>
      </div>
    </div>
  )
}
