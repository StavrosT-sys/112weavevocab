// GlowingEdge.tsx — FINAL WORKING VERSION (NO useStore, NO bugs)
import { EdgeProps, getBezierPath } from 'reactflow';

interface CustomEdgeProps extends EdgeProps {
  data?: {
    selectedId: string | null;
  };
}

export default function GlowingEdge({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: CustomEdgeProps) {
  const isActive = data?.selectedId === source || data?.selectedId === target;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      {/* CYAN GLOW — appears only when connected to selected node */}
      {isActive && (
        <path
          d={edgePath}
          stroke="#00ffff"
          strokeWidth={28}
          fill="none"
          opacity={0.7}
          pointerEvents="none"
        />
      )}

      {/* MAIN LINE — purple when idle, bright cyan when active */}
      <path
        d={edgePath}
        stroke={isActive ? '#00ffff' : '#a855f790'}
        strokeWidth={isActive ? 7 : 2.5}
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}
