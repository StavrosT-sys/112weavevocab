// src/components/WordGraph.tsx
// Professional React Flow implementation with useStore and custom edges!

import { useMemo } from 'react'
import ReactFlow, { 
  Node, 
  Edge, 
  Background,
  Controls,
  NodeProps,
  EdgeProps,
  useStore,
  getBezierPath
} from 'reactflow'
import 'reactflow/dist/style.css'
import { words, Word } from '../data/words'

// Custom node with proper scaling using useStore
function WordNode({ data, id }: NodeProps) {
  // Access React Flow's internal state for hover detection
  const isHovered = useStore((s) => {
    const node = s.nodeInternals.get(id)
    return node?.selected || false
  })

  return (
    <div className="group">
      <div
        className={`
          transition-all duration-300 ease-out
          ${isHovered ? 'scale-125' : 'scale-100'}
        `}
        style={{ 
          transformOrigin: 'center',
          width: '80px',
          height: '80px'
        }}
      >
        <div 
          className="rounded-full flex items-center justify-center text-center p-2 border-2"
          style={{
            background: isHovered ? '#ffd700' : data.bgColor,
            borderColor: isHovered ? '#00ffff' : 'transparent',
            boxShadow: isHovered ? '0 0 20px #00ffff' : 'none',
            color: 'white',
            width: '100%',
            height: '100%',
            fontSize: '12px'
          }}
        >
          <div>
            <div className="font-bold text-sm">{data.word}</div>
            <div className="text-xs text-cyan-400 mt-1">{data.translation}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom edge with glow effect
function GlowingEdge({ id, sourceX, sourceY, targetX, targetY, source, target }: EdgeProps) {
  const sourceNode = useStore((s) => s.nodeInternals.get(source))
  const targetNode = useStore((s) => s.nodeInternals.get(target))
  const isActive = sourceNode?.selected || targetNode?.selected

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY
  })

  return (
    <g>
      {/* Outer glow when active */}
      {isActive && (
        <path
          d={edgePath}
          strokeWidth={12}
          stroke="cyan"
          opacity={0.3}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {/* Main path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={isActive ? 4 : 1.5}
        stroke={isActive ? '#00ffff' : '#7c3aed40'}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

const nodeTypes = {
  wordNode: WordNode
}

const edgeTypes = {
  glowing: GlowingEdge
}

export default function WordGraph({ lessonId }: { lessonId?: number }) {
  // Filter words
  const filtered = useMemo(() => 
    lessonId 
      ? words.filter(w => w.lesson === lessonId).slice(0, 60)
      : words.slice(0, 60),
    [lessonId]
  )

  // Create nodes in circular layout
  const nodes: Node[] = useMemo(() => {
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
          bgColor: bgColor
        },
        draggable: false,
        selectable: true
      }
    })
  }, [filtered])

  // Create edges (connections between nearby nodes)
  const edges: Edge[] = useMemo(() => {
    const edgeList: Edge[] = []
    nodes.forEach((nodeA, i) => {
      nodes.slice(i + 1).forEach(nodeB => {
        const dx = nodeA.position.x - nodeB.position.x
        const dy = nodeA.position.y - nodeB.position.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          edgeList.push({
            id: `${nodeA.id}-${nodeB.id}`,
            source: nodeA.id,
            target: nodeB.id,
            type: 'glowing',
            animated: false
          })
        }
      })
    })
    return edgeList
  }, [nodes])

  return (
    <div className="relative w-full h-screen bg-[#0f0720]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#7c3aed20" gap={32} />
        <Controls />
      </ReactFlow>
      
      <div className="absolute top-8 left-8 bg-black/70 backdrop-blur rounded-2xl p-6 text-white max-w-xs pointer-events-none">
        <h2 className="text-3xl font-bold mb-2">A Rede Semântica</h2>
        <p className="opacity-80 text-lg">Clique em qualquer palavra</p>
        <p className="text-sm opacity-60 mt-2">60 palavras principais</p>
      </div>
    </div>
  )
}
