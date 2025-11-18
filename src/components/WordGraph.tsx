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
    const centerX = 400
    const centerY = 400
    const radius = 350

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
    document.querySelectorAll('.react-flow__node.echo-active').forEach(el => {
      el.classList.remove('echo-active')
    })
  }, [])

  // Echo Chamber - Sequential audio playback
  const handleNodeClick = useCallback((_event: any, clickedNode: Node) => {
    // Set selected node
    setSelectedId(clickedNode.id)
    console.log('🎯 Node clicked:', clickedNode.id, clickedNode.data)
    alert(`Clicked: ${clickedNode.id}`)

    // Immediate cleanup - prevent overlap
    clearAllEchoes()

    // Find all directly connected node IDs
    const connectedIds = new Set<string>()
    const allEdges = getEdges()
    console.log('📊 Total edges:', allEdges.length)
    
    allEdges.forEach(edge => {
      if (edge.source === clickedNode.id) connectedIds.add(edge.target)
      if (edge.target === clickedNode.id) connectedIds.add(edge.source)
    })

    console.log('🔗 Connected node IDs:', Array.from(connectedIds))
    if (connectedIds.size === 0) {
      console.log('⚠️ No connected nodes found!')
      return
    }

    // Get actual node objects
    const neighborNodes = getNodes()
      .filter(n => connectedIds.has(n.id))
      .filter(Boolean)

    console.log('👥 Neighbor nodes found:', neighborNodes.length, neighborNodes.map(n => n.id))

    // Play echo sequence
    neighborNodes.forEach((node, index) => {
      const delay = 280 + index * 680 // 280ms initial synaptic delay

      const timeoutId = setTimeout(() => {
        console.log(`✨ Echo ${index + 1}/${neighborNodes.length}: ${node.id} (${node.data?.english})`)
        
        // Visual flash
        const nodeEl = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${node.id}"]`
        )
        console.log('🔍 DOM element found:', !!nodeEl, nodeEl?.className)
        
        if (nodeEl) {
          nodeEl.classList.add('echo-active')
          // Auto-remove class when animation ends
          const removeClass = () => {
            nodeEl.classList.remove('echo-active')
            nodeEl.removeEventListener('animationend', removeClass)
          }
          nodeEl.addEventListener('animationend', removeClass)
        }

        // Audio - safe fallback
        if (node.data?.english) {
          const audio = new Audio(`/audio/${node.data.english.toLowerCase()}.mp3`)
          audio.volume = 0.8
          audio.play().catch(() => {
            // Silently fail if audio blocked/missing - never crashes
            console.log(`Audio not available for: ${node.data.english}`)
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
        fitViewOptions={{ padding: 0.3 }}
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
      
      <div className="absolute top-8 left-8 bg-black/70 backdrop-blur-lg rounded-2xl p-6 text-white max-w-sm pointer-events-none">
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
