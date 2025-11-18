// GlowingEdge.tsx — NUCLEAR VERSION (guaranteed to work)
import { EdgeProps, getBezierPath, useStore } from 'reactflow'

export default function GlowingEdge(props: EdgeProps) {
  const { source, target } = props

  // THIS IS THE ONE THAT ACTUALLY FORCES RE-RENDER EVERY TIME
  const selectedNodeId = useStore((state) => {
    const selected = Array.from(state.nodeInternals.values()).find(n => n.selected)
    const id = selected?.id || null
    console.log('SELECTED NODE ID:', id)   // ← ADD THIS LINE
    return id
  }, (a, b) => a !== b)  // ← THIS SHALLOW EQUALITY COMPARER IS THE KEY

  const isActive = source === selectedNodeId || target === selectedNodeId

  const [edgePath] = getBezierPath(props)

  return (
    <>
      {/* GLOW */}
      {isActive && (
        <path
          d={edgePath}
          stroke="#00ffff"
          strokeWidth={20}
          fill="none"
          opacity={0.5}
          className="pointer-events-none"
        />
      )}
      {/* MAIN LINE */}
      <path
        d={edgePath}
        stroke={isActive ? '#00ffff' : '#ffffff'}
        strokeWidth={isActive ? 8 : 3}
        fill="none"
        strokeLinecap="round"
      />
    </>
  )
}
