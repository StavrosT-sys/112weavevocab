// src/components/DashboardView.tsx
import { words } from '../data/words'
import { motion } from 'framer-motion'

export default function DashboardView() {
  const mastered = words.filter(w => w.stability > 0.8).length
  const total = words.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-8 text-white">
      <motion.h1 className="text-6xl font-bold text-center mb-12" 
        initial={{ y: -50 }} animate={{ y: 0 }}>
        Seu Cérebro Está Tecendo
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <motion.div className="bg-white/10 backdrop-blur rounded-3xl p-12 text-center"
          whileHover={{ scale: 1.05 }}>
          <div className="text-8xl font-bold">{mastered}</div>
          <div className="text-3xl mt-4">Palavras Dominadas</div>
          <div className="text-xl opacity-80">{((mastered/total)*100).toFixed(1)}% do Oxford 3000</div>
        </motion.div>

        <motion.div className="bg-white/10 backdrop-blur rounded-3xl p-12 text-center"
          whileHover={{ scale: 1.05 }}>
          <div className="text-8xl font-bold">{(mastered * 8).toLocaleString()}</div>
          <div className="text-3xl mt-4">Conexões Formadas</div>
          <div className="text-xl opacity-80">Seu vocabulário está vivo</div>
        </motion.div>

        <motion.div className="bg-white/10 backdrop-blur rounded-3xl p-12 text-center"
          whileHover={{ scale: 1.05 }}>
          <div className="text-8xl font-bold">Lição {Math.max(...words.map(w => w.lesson))}</div>
          <div className="text-3xl mt-4">Progresso Atual</div>
          <div className="text-xl opacity-80">Você está voando!</div>
        </motion.div>
      </div>
    </div>
  )
}
