// src/components/GlowingEdge.tsx
// BULLETPROOF VERSION - uses activeNodeId from props, no useStore!
import { EdgeProps, getBezierPath } from 'reactflow';

export default function GlowingEdge(props: EdgeProps & { data?: { activeNodeId: string | null } }) {
  const { source, target, data } = props;
  
  // Get activeNodeId from data prop (passed from parent)
  const activeNodeId = data?.activeNodeId;
  const isActive = activeNodeId === source || activeNodeId === target;

  const [edgePath] = getBezierPath(props);

  return (
    <>
      {/* CYAN GLOW — only when connected to active node */}
      {isActive && (
        <path
          d={edgePath}
          stroke="#00ffff"
          strokeWidth={20}
          fill="none"
          opacity={0.5}
          pointerEvents="none"
        />
      )}

      {/* MAIN LINE — subtle purple when inactive, bright cyan when active */}
      <path
        d={edgePath}
        stroke={isActive ? '#00ffff' : '#a855f770'}
        strokeWidth={isActive ? 6 : 2.5}
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}
