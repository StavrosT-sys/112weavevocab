import { motion } from 'framer-motion'

export default function FSRSViz() {
  return (
    <motion.div className="bg-black/20 rounded-lg p-4 mt-4" initial={{ scale: 0.98 }} animate={{ scale: 1 }}>
      <h3 className="text-lg mb-2">FSRS vs SM-2 Retention</h3>
      <svg width="100%" height="80" className="w-full">
        {/* SM-2 (dashed, red) */}
        <polyline
          points="0,70 25,60 50,50 75,40 100,30"
          stroke="red"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5"
        />
        {/* FSRS (solid, green - tighter curve) */}
        <polyline
          points="0,70 25,55 50,40 75,30 100,20"
          stroke="green"
          strokeWidth="2"
          fill="none"
        />
        <text x="50" y="85" textAnchor="middle" className="fill-white text-xs">
          Sessions → FSRS +25% Recall
        </text>
      </svg>
    </motion.div>
  )
}
