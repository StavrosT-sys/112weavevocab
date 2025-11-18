// src/components/WordGraph.tsx
// React Flow with working hover and weave effect!

import { useState, useMemo, useCallback } from 'react'
import ReactFlow, { 
  Node, 
  Edge, 
  Background,
  Controls,
  NodeProps,
  useNodesState,
  useEdgesState
} from 'reactflow'
import 'reactflow/dist/style.css'
import { words, Word } from '../data/words'

// Custom node component
function WordNode({ data, id }: NodeProps) {
  return (
    <div 
      className={`word-node ${data.isHovered ? 'hovered' : ''}`}
      style={{
        background: data.isHovered ? '#ffd700' : data.bgColor,
        width: data.isHovered ? '96px' : '80px',
        height: data.isHovered ? '96px' : '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        cursor: 'pointer',
        border: data.isHovered ? '4px solid #00ffff' : '2px solid transparent',
        boxShadow: data.isHovered ? '0 0 20px #00ffff' : 'none',
        transition: 'all 0.2s ease',
        padding: '8px',
        fontSize: '12px',
        textAlign: 'center',
        pointerEvents: 'all',
        position: 'relative',
        zIndex: data.isHovered ? 1000 : 1
      }}
      onMouseEnter={() => data.onHover?.(id)}
      onMouseLeave={() => data.onHover?.(null)}
    >
      <div>
        <div className="font-bold text-sm">{data.word}</div>
        <div className="text-xs text-cyan-400 mt-1">{data.translation}</div>
      </div>
    </div>
  )
}

const nodeTypes = {
  wordNode: WordNode
}

export default function WordGraph({ lessonId }: { lessonId?: number }) {
  const [, setHoveredNode] = useState<string | null>(null)

  // Filter words
  const filtered = useMemo(() => 
    lessonId 
      ? words.filter(w => w.lesson === lessonId).slice(0, 60)
      : words.slice(0, 60),
    [lessonId]
  )

  // Create initial nodes
  const initialNodes: Node[] = useMemo(() => {
    const centerX = 400
    const centerY = 400
    const radius = 350

    return filtered.map((word: Word, i: number) => {
      const angle = (i / filtered.length) * Math.PI * 2
      const radiusVariation = 0.5 + Math.random() * 0.5
      const r = radius * radiusVariation
      const bgColor = `hsl(${word.stability * 120}, 70%, 55%)`

      return {
        id: word.id.toString(),
        type: 'wordNode',
        position: {
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r
        },
        data: { 
          word: word.text,
          translation: word.portuguese,
          bgColor: bgColor,
          isHovered: false,
          onHover: setHoveredNode
        },
        draggable: false
      }
    })
  }, [filtered])

  // Create edges
  const initialEdges: Edge[] = useMemo(() => {
    const edgeList: Edge[] = []
    initialNodes.forEach((nodeA, i) => {
      initialNodes.slice(i + 1).forEach(nodeB => {
        const dx = nodeA.position.x - nodeB.position.x
        const dy = nodeA.position.y - nodeB.position.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          edgeList.push({
            id: `${nodeA.id}-${nodeB.id}`,
            source: nodeA.id,
            target: nodeB.id,
            style: { stroke: '#7c3aed40', strokeWidth: 1 },
            animated: false
          })
        }
      })
    })
    return edgeList
  }, [initialNodes])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes and edges when hover changes
  const handleHover = useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId)
    
    // Update node hover state
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isHovered: n.id === nodeId
        }
      }))
    )

    // Update edge highlighting - THE WEAVE EFFECT!
    setEdges((eds) =>
      eds.map((e) => {
        const isConnected = nodeId && (e.source === nodeId || e.target === nodeId)
        return {
          ...e,
          style: {
            stroke: isConnected ? '#00ffff' : '#7c3aed40',
            strokeWidth: isConnected ? 3 : 1
          },
          animated: isConnected || false
        }
      })
    )
  }, [setNodes, setEdges])

  // Update hover handler in nodes
  useMemo(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onHover: handleHover
        }
      }))
    )
  }, [handleHover, setNodes])

  return (
    <div className="relative w-full h-screen bg-[#0f0720]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
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
