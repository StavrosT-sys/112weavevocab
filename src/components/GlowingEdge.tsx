import { EdgeProps, getBezierPath } from 'reactflow';

export default function GlowingEdge({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps & { data?: { selectedId: string | null } }) {
  const isActive = data?.selectedId && (source === data.selectedId || target === data.selectedId);
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY } as any);

  return (
    <>
      {isActive && (
        <path
          d={edgePath}
          stroke="#00ffff"
          strokeWidth={24}
          fill="none"
          opacity={0.6}
          pointerEvents="none"
        />
      )}
      <path
        d={edgePath}
        stroke={isActive ? '#00ffff' : '#a855f780'}
        strokeWidth={isActive ? 6 : 2}
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}
