// GlowingEdge.tsx - Team's corrected solution with reactive selector
import { EdgeProps, getBezierPath, useStore } from 'reactflow'

export default function GlowingEdge(edge: EdgeProps) {
  const { source, target } = edge

  // THIS LINE IS THE MAGIC — shallow selector forces re-render on ANY selection change
  const selectedNodeId = useStore((state) => {
    // Look for any selected node (React Flow only allows one at a time usually)
    for (const node of state.nodeInternals.values()) {
      if (node.selected) return node.id
    }
    return null
  })

  const isActive = source === selectedNodeId || target === selectedNodeId

  const [edgePath] = getBezierPath(edge)

  return (
    <>
      {/* Outer glow when active */}
      {isActive && (
        <path
          d={edgePath}
          stroke="#00ffff"
          strokeWidth={18}
          fill="none"
          opacity={0.4}
          className="pointer-events-none"
        />
      )}

      {/* Main line */}
      <path
        d={edgePath}
        stroke={isActive ? '#00ffff' : '#a855f730'}
        strokeWidth={isActive ? 4 : 1.5}
        fill="none"
        strokeLinecap="round"
      />
    </>
  )
}
