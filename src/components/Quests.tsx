import { motion, AnimatePresence } from 'framer-motion'
import { Quest } from '../lib/types'

interface QuestsProps {
  questProgress: Quest[]
}

export default function Quests({ questProgress }: QuestsProps) {
  return (
    <motion.div className="bg-black/20 rounded-lg p-4 space-y-3" initial={{ y: 20 }} animate={{ y: 0 }}>
      <h2 className="text-xl mb-4">Daily Quests</h2>
      <AnimatePresence>
        {questProgress.map(q => (
          <motion.div
            key={q.id}
            className="bg-gray-800 rounded p-3"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            whileHover={{ y: -2 }}
          >
            <h3 className="font-semibold">{q.title}</h3>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(q.progress / q.target) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm">{q.progress}/{q.target}</p>
            {q.unlocked && (
              <motion.div
                className="mt-2 text-yellow-300 font-bold flex items-center justify-center"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: 1 }}
              >
                🎉 Unlocked Badge!
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
