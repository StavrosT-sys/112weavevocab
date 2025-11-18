// src/components/GraphCluster.tsx
import { motion } from 'framer-motion'
import { lessons } from '../data/lessons'
import { words } from '../data/words'

interface Props {
  onSelect: (lessonId: number) => void
  selected: number | null
}

export default function GraphCluster({ onSelect, selected }: Props) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 p-6">
      {lessons.map((lesson) => {
        const wordCount = lesson.wordEnd - lesson.wordStart + 1
        const mastered = words.slice(lesson.wordStart, lesson.wordEnd + 1).filter(w => w.stability > 0.8).length
        return (
          <motion.button
            key={lesson.id}
            className={`relative rounded-full p-6 text-white font-bold shadow-2xl transition-all ${
              selected === lesson.id ? 'ring-4 ring-cyan-400 scale-110' : ''
            }`}
            style={{
              background: `radial-gradient(circle, #7c3aed ${mastered / wordCount * 100}%, #4c1d95 100%)`,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(lesson.id)}
          >
            <div className="text-2xl">{lesson.id}</div>
            <div className="text-xs mt-1 opacity-80">{mastered}/{wordCount}</div>
            {mastered === wordCount && <span className="absolute -top-2 -right-2 text-3xl">✓</span>}
          </motion.button>
        )
      })}
    </div>
  )
}
