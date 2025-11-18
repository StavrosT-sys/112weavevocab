// src/components/DuelSync.tsx
import { motion } from 'framer-motion'
import { useDuelSync } from '../lib/useDuelSync'

interface Props {
  myScore: number
}

export default function DuelSync({ myScore }: Props) {
  const { duel, createDuel } = useDuelSync()

  if (!duel) return null

  const won = myScore > duel.opponentScore

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gradient-to-br from-purple-900 to-pink-900 p-8 rounded-2xl text-center">
        <h2 className="text-4xl mb-4">{won ? '🎉 Você Venceu!' : '😢 Você Perdeu'}</h2>
        <p className="text-2xl mb-2">
          Você: {myScore} pontos
        </p>
        <p className="text-2xl mb-6">
          Oponente: {duel.opponentScore} pontos
        </p>
        <button
          onClick={() => createDuel(duel.path, myScore)}
          className="mt-6 bg-yellow-400 text-black px-8 py-4 rounded-full text-xl font-bold hover:bg-yellow-300 transition"
        >
          Revanche!
        </button>
      </div>
    </motion.div>
  )
}
