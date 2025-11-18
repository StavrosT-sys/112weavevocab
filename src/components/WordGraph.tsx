// src/components/WordGraph.tsx
// Team's corrected solution - proper scaling and weave!

import { memo, useMemo } from 'react'
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

// Custom node with proper selected prop
function CustomNode({ data, selected }: NodeProps) {
  return (
    <div className="group">
      {/* THIS INNER DIV SCALES */}
      <div
        className={`
          transition-transform duration-200 ease-out
          ${selected ? 'scale-125' : 'scale-100'}
          origin-center
        `}
      >
        <div
          className={`
            px-5 py-3 rounded-full min-w-28 text-center font-medium text-white
            shadow-lg backdrop-blur-sm border-2
            ${selected 
              ? 'bg-yellow-400 text-black border-cyan-400 shadow-cyan-400/50' 
              : 'bg-red-600/90 border-purple-500'
            }
          `}
        >
          <div className="text-lg font-bold">{data.english}</div>
          <div className="text-xs opacity-80">{data.portuguese}</div>
        </div>
      </div>
    </div>
  )
}

const MemoizedCustomNode = memo(CustomNode)

// Glowing edge with proper useStore
function GlowingEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  source,
  target,
}: EdgeProps) {
  const sourceNode = useStore((s) => s.nodeInternals.get(source))
  const targetNode = useStore((s) => s.nodeInternals.get(target))
  const isActive = sourceNode?.selected || targetNode?.selected

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  return (
    <>
      {/* Outer glow (only when active) */}
      {isActive && (
        <path
          d={edgePath}
          stroke="#00ffff"
          strokeWidth={16}
          fill="none"
          opacity={0.3}
          className="pointer-events-none"
        />
      )}
      {/* Inner line */}
      <path
        d={edgePath}
        stroke={isActive ? '#00ffff' : '#7c3aed40'}
        strokeWidth={isActive ? 3 : 1}
        fill="none"
        strokeLinecap="round"
      />
    </>
  )
}

const nodeTypes = {
  wordNode: MemoizedCustomNode
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

      return {
        id: word.id.toString(),
        type: 'wordNode',
        position: {
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r
        },
        data: { 
          english: word.text,
          portuguese: word.portuguese
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
            type: 'glowing'
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
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        onNodeClick={(_e, node) => {
          console.log('Clicked:', node.data.english)
        }}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#0f0720" gap={40} />
        <Controls />
      </ReactFlow>
      
      <div className="absolute top-8 left-8 bg-black/70 backdrop-blur-lg rounded-2xl p-6 text-white max-w-sm pointer-events-none">
        <h2 className="text-4xl font-bold mb-3">A Rede Semântica</h2>
        <p className="text-lg opacity-90">Clique em uma palavra para ver conexões</p>
      </div>
    </div>
  )
}
