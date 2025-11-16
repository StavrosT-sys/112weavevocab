import { motion } from 'framer-motion'
import { Word } from '../lib/types'

interface GraphProps {
  words: Word[]
  weavePath: number[]
  selectedId: number | null
  onNodeClick: (id: number) => void
}

export default function Graph({ words, weavePath, selectedId, onNodeClick }: GraphProps) {
  const stabilityColor = (stab: number) => `hsl(${120 + stab * 60}, 70%, 50%)`

  return (
    <motion.div className="bg-black/20 rounded-lg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="mb-4 text-xl">Semantic Graph</h2>
      <div className="relative w-full h-64 bg-gray-900 rounded overflow-hidden">
        {words.slice(0, 25).map(w => (
          <motion.div
            key={w.id}
            className="absolute text-xs rounded-full px-2 py-1 cursor-pointer border-2 shadow-lg"
            style={{
              left: `${(w.id % 10) * 10 + Math.random() * 20}%`,
              top: `${Math.floor(w.id / 5) * 20 + Math.random() * 10}%`,
              borderColor: stabilityColor(w.stability),
              backgroundColor: `${stabilityColor(w.stability)}20`,
            }}
            animate={{ scale: selectedId === w.id ? 1.3 : 1, rotate: selectedId === w.id ? 5 : 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => onNodeClick(w.id)}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {w.text}
            <div className="text-[10px] opacity-75">S: {Math.round(w.stability * 100)}%</div>
          </motion.div>
        ))}
        <motion.div className="absolute inset-0 pointer-events-none">
          {weavePath.map((id, i) => {
            const word = words.find(w => w.id === id)
            return word ? (
              <motion.div
                key={id}
                className="absolute bg-green-500 text-black text-xs px-2 py-1 rounded shadow-lg"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, x: i * 30, y: Math.sin(i) * 20 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ left: '20%', top: '50%' }}
              >
                {word.text}
              </motion.div>
            ) : null
          })}
        </motion.div>
      </div>
      {weavePath.length > 0 && (
        <p className="mt-2 text-sm text-center">
          Weave: {weavePath.map(id => words.find(w => w.id === id)?.text).join(' → ')}
        </p>
      )}
    </motion.div>
  )
}
