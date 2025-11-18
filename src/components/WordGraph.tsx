// src/components/WordGraph.tsx
// Bulletproof onNodeClick solution - bypasses useStore!

import { memo, useMemo, useState } from 'react'
import ReactFlow, { 
  Node, 
  Edge, 
  Background,
  Controls,
  NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { words, Word } from '../data/words'
import GlowingEdge from './GlowingEdge'

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

const nodeTypes = {
  wordNode: MemoizedCustomNode
}

export default function WordGraph({ lessonId }: { lessonId?: number }) {
  // BULLETPROOF STATE - bypasses useStore entirely!
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle)
        },
        data: { 
          english: word.text, 
          portuguese: word.portuguese 
        },
        selected: word.id.toString() === selectedId, // Manual selection tracking
      }
    })
  }, [filtered, selectedId]) // Re-create when selectedId changes

  // Create base edges
  const edges = useMemo(() => {
    const edgeList: Edge[] = []
    nodes.forEach((node, i) => {
      nodes.slice(i + 1).forEach((other) => {
        const dx = node.position.x - other.position.x
        const dy = node.position.y - other.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Increased distance + always create some edges so we can see them
        if (distance < 380) {
          edgeList.push({
            id: `${node.id}-${other.id}`,
            source: node.id,
            target: other.id,
            animated: false,
          })
        }
      })
    })
    console.log('Created edges:', edgeList.length)
    return edgeList
  }, [nodes])

  // Map edges to pass the selectedId via data
  const edgesWithSelection = edges.map(edge => ({
    ...edge,
    type: 'glowing',
    data: { selectedId },
  }))

  return (
    <div className="relative w-full h-screen bg-[#0f0720]">
      <ReactFlow
        nodes={nodes}
        edges={edgesWithSelection}
        nodeTypes={nodeTypes}
        edgeTypes={{ glowing: GlowingEdge }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        onNodeClick={(_, node) => setSelectedId(node.id)}
        onPaneClick={() => setSelectedId(null)}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        {/* DEBUG OVERLAY */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            zIndex: 1000,
          }}
        >
          Selected: {selectedId || 'none'}
        </div>

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
