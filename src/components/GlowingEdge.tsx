// src/components/GlowingEdge.tsx
import { EdgeProps, getBezierPath, useStore } from 'reactflow';
import { shallow } from 'zustand/shallow';

export default function GlowingEdge(props: EdgeProps) {
  const { source, target } = props;

  // THIS IS THE NUCLEAR FINAL VERSION — works even when React Flow tries to kill us
  const selectedNodeIds = useStore((state) => {
    const selected: string[] = [];
    state.getNodes().forEach((n) => {
      if (n.selected) selected.push(n.id);
    });
    return selected;
  }, shallow); // ← React Flow's built-in shallow comparator

  const isActive = selectedNodeIds.includes(source) || selectedNodeIds.includes(target);

  const [edgePath] = getBezierPath(props);

  return (
    <>
      {/* CYAN GLOW — only when connected to selected node */}
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
