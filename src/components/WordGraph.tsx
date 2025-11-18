// src/components/WordGraph.tsx
// React Flow with custom nodes - CSS-based hover!

import { useMemo } from 'react'
import ReactFlow, { 
  Node, 
  Edge, 
  Background,
  Controls,
  NodeProps
} from 'reactflow'
import 'reactflow/dist/style.css'
import { words, Word } from '../data/words'

// Custom node component with CSS hover
function WordNode({ data }: NodeProps) {
  return (
    <div 
      className="word-node"
      style={{
        background: data.bgColor,
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        cursor: 'pointer',
        border: '2px solid transparent',
        transition: 'all 0.2s ease',
        padding: '8px',
        fontSize: '12px',
        textAlign: 'center'
      }}
    >
      <div>
        <div className="font-bold text-sm">{data.word}</div>
        <div className="text-xs text-cyan-400 mt-1 word-translation">{data.translation}</div>
      </div>
      <style>{`
        .word-node:hover {
          background: #ffd700 !important;
          border: 4px solid #00ffff !important;
          box-shadow: 0 0 20px #00ffff !important;
          transform: scale(1.2) !important;
          z-index: 1000 !important;
        }
        .word-node:hover .word-translation {
          display: block !important;
        }
      `}</style>
    </div>
  )
}

const nodeTypes = {
  wordNode: WordNode
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
        draggable: false
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
            style: { stroke: '#7c3aed40', strokeWidth: 1 },
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
