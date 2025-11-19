// src/components/WordGraph.tsx
// Echo Chamber - Sequential audio feedback with spreading activation

import { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react'
import ReactFlow, { 
  Node, 
  Edge, 
  Background,
  Controls,
  NodeProps,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { words, Word } from '../data/words'
import GlowingEdge from './GlowingEdge'

// Custom node with proper selected prop
function CustomNode({ data, selected, id }: NodeProps) {
  return (
    <div className="group">
      {/* THIS INNER DIV SCALES */}
      <div
        className={`
          echo-target
          transition-transform duration-200 ease-out
          ${selected ? 'scale-125 z-50' : 'scale-100'}
        `}
        style={{ transformOrigin: 'center center' }}
        data-node-id={id}
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

function WordGraphInner({ lessonId }: { lessonId?: number }) {
  const { getNodes, getEdges } = useReactFlow()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const activeTimeouts = useRef<Set<number>>(new Set())

  // Filter words
  const filtered = useMemo(() => 
    lessonId 
      ? words.filter(w => w.lesson === lessonId).slice(0, 60)
      : words.slice(0, 60),
    [lessonId]
  )

  // Create nodes in circular layout
  const nodes: Node[] = useMemo(() => {
    const centerX = 500
    const centerY = 450
    const radius = 320

    // Safety check: return empty array if no words
    if (filtered.length === 0) return []

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
        selected: word.id.toString() === selectedId,
      }
    })
  }, [filtered, selectedId])

  // Create base edges
  const edges = useMemo(() => {
    const edgeList: Edge[] = []
    nodes.forEach((node, i) => {
      nodes.slice(i + 1).forEach((other) => {
        const dx = node.position.x - other.position.x
        const dy = node.position.y - other.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

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
    return edgeList
  }, [nodes])

  // Map edges to pass the selectedId via data
  const edgesWithSelection = edges.map(edge => ({
    ...edge,
    type: 'glowing',
    data: { selectedId },
  }))

  // Cleanup all active echoes
  const clearAllEchoes = useCallback(() => {
    activeTimeouts.current.forEach(t => clearTimeout(t))
    activeTimeouts.current.clear()
    document.querySelectorAll('.echo-target.echo-active').forEach(el => {
      el.classList.remove('echo-active')
    })
  }, [])

  // Echo Chamber - Sequential audio playback
  const handleNodeClick = useCallback((_event: any, clickedNode: Node) => {
    // Set selected node
    setSelectedId(clickedNode.id)
    // Node clicked - trigger Echo Chamber

    // Immediate cleanup - prevent overlap
    clearAllEchoes()

    // Find all directly connected node IDs
    const connectedIds = new Set<string>()
    const allEdges = getEdges()
    // Find connected edges
    
    allEdges.forEach(edge => {
      if (edge.source === clickedNode.id) connectedIds.add(edge.target)
      if (edge.target === clickedNode.id) connectedIds.add(edge.source)
    })

    if (connectedIds.size === 0) return

    // Get actual node objects
    const neighborNodes = getNodes()
      .filter(n => connectedIds.has(n.id))
      .filter(Boolean)

    // Play echo sequence for each neighbor

    // Play echo sequence
    neighborNodes.forEach((node, index) => {
      const delay = 280 + index * 680 // 280ms initial synaptic delay

      const timeoutId = setTimeout(() => {
        // Visual flash - target the inner content div, not the React Flow wrapper
        const targetEl = document.querySelector<HTMLElement>(
          `.echo-target[data-node-id="${node.id}"]`
        )
        if (targetEl) {
          targetEl.classList.add('echo-active')
          // Auto-remove class when animation ends
          const removeClass = () => {
            targetEl.classList.remove('echo-active')
            targetEl.removeEventListener('animationend', removeClass)
          }
          targetEl.addEventListener('animationend', removeClass)
        }

        // Audio - safe fallback
        if (node.data?.english) {
          const audio = new Audio(`/audio/${node.data.english.toLowerCase()}.mp3`)
          audio.volume = 0.8
          audio.play().catch(() => {
            // Silently fail if audio blocked/missing
          })
        }

        // Auto-remove from tracking set
        activeTimeouts.current.delete(timeoutId)
      }, delay)

      activeTimeouts.current.add(timeoutId)
    })
  }, [getNodes, getEdges, clearAllEchoes])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllEchoes()
  }, [clearAllEchoes])

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
        fitViewOptions={{ padding: 0.15, minZoom: 0.8, maxZoom: 1.2 }}
        onNodeClick={handleNodeClick}
        onPaneClick={() => {
          setSelectedId(null)
          clearAllEchoes()
        }}
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
      
      <div className="absolute top-8 left-8 bg-black/70 backdrop-blur-lg rounded-2xl p-6 text-white max-w-sm pointer-events-none z-[9998]">
        <h2 className="text-4xl font-bold mb-3">A Rede Semântica</h2>
        <p className="text-lg opacity-90">Clique em uma palavra para ouvir conexões</p>
      </div>
    </div>
  )
}

// Wrapper to provide ReactFlow context
export default function WordGraph(props: { lessonId?: number }) {
  return (
    <ReactFlowProvider>
      <WordGraphInner {...props} />
    </ReactFlowProvider>
  )
}
