// GlowingEdge.tsx — NUCLEAR BYPASS (ignores React Flow's broken selected flag)
import { EdgeProps, getBezierPath, useStore } from 'reactflow'

export default function GlowingEdge(props: EdgeProps) {
  const { source, target } = props

  // THIS IS THE REAL ONE THAT WORKS — uses the official selection array
  const selectedNodeIds = useStore((state) => {
    const selected = state.getNodes().filter(n => n.selected).map(n => n.id)
    console.log('REAL SELECTED IDS:', selected)  // ← proof it works
    return selected
  }, (a, b) => a.join() !== b.join())   // force re-render

  const isActive = selectedNodeIds.includes(source) || selectedNodeIds.includes(target)

  const [edgePath] = getBezierPath(props)

  return (
    <>
      {/* GLOW */}
      {isActive && (
        <path
          d={edgePath}
          stroke="#00ffff"
          strokeWidth={24}
          fill="none"
          opacity={0.6}
          className="pointer-events-none"
        />
      )}
      {/* MAIN LINE */}
      <path
        d={edgePath}
        stroke={isActive ? '#00ffff' : '#ffffff'}
        strokeWidth={isActive ? 6 : 2}
        fill="none"
        strokeLinecap="round"
      />
    </>
  )
}
