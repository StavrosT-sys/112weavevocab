import { useState } from 'react'
import { motion } from 'framer-motion'
import { Word, Quest } from '../lib/types'

interface DuelProps {
  weavePath: number[]
  words: Word[]
  questProgress: Quest[]
}

export default function DuelGenerator({ weavePath, words, questProgress }: DuelProps) {
  const [duelUrl, setDuelUrl] = useState('')

  const generateDuel = () => {
    const seed = weavePath.join('-')
    const totalProgress = questProgress.reduce((a, b) => a + b.progress, 0)
    const url = `${window.location.origin}?duel=${seed}&streak=${totalProgress}`
    setDuelUrl(url)

    // Canvas preview
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 150
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#1e3a8a'
      ctx.fillRect(0, 0, 300, 150)
      ctx.fillStyle = 'white'
      ctx.font = '16px sans-serif'
      ctx.fillText('VocabWeave Duel!', 10, 20)
      ctx.fillText(`Path: ${weavePath.map(id => words.find(w => w.id === id)?.text || '').join(' → ')}`, 10, 50)
      ctx.fillText(`Your Streak: ${totalProgress}`, 10, 80)
      ctx.fillText('Challenge Accepted?', 10, 110)
      const imgUrl = canvas.toDataURL()
      console.log('Share Image:', imgUrl) // Prod: Web Share API
    }

    if (navigator.share) {
      navigator.share({ title: 'VocabWeave Duel', url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <motion.div className="bg-black/20 rounded-lg p-4" initial={{ x: 20 }} animate={{ x: 0 }}>
      <h2 className="text-xl mb-4">Duel Friend</h2>
      <button
        onClick={generateDuel}
        className="w-full bg-blue-600 hover:bg-blue-700 rounded p-2 mb-4 transition-colors"
        disabled={weavePath.length === 0}
      >
        Generate Challenge
      </button>
      {duelUrl && (
        <motion.p
          className="text-sm break-words bg-gray-800 p-2 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Share: {duelUrl}
        </motion.p>
      )}
      <p className="text-xs opacity-75">Friend opens → offline duel loads!</p>
    </motion.div>
  )
}
