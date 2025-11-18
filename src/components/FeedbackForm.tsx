// src/components/FeedbackForm.tsx
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false)

  const send = () => {
    const data = {
      rating: (document.getElementById('rating') as HTMLSelectElement).value,
      comment: (document.getElementById('comment') as HTMLTextAreaElement).value,
      url: location.href,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vocabweave-feedback-${Date.now()}.json`
    a.click()
    
    setIsOpen(false)
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-2xl hover:bg-purple-500 transition z-40"
          aria-label="Open feedback form"
        >
          💬
        </button>
      )}
      
      {isOpen && (
        <motion.div 
          className="fixed bottom-6 right-6 bg-white text-black rounded-2xl shadow-2xl p-6 z-40 w-80"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Feedback?</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black">✕</button>
          </div>
          
          <select id="rating" className="w-full mb-3 p-2 border rounded">
            {[5, 4, 3, 2, 1].map(n => <option key={n}>{n} estrelas</option>)}
          </select>
          
          <textarea 
            id="comment" 
            className="w-full h-24 p-2 border rounded mb-3" 
            placeholder="O que você achou?"
          />
          
          <button 
            onClick={send} 
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-500 transition"
          >
            Enviar (salva arquivo)
          </button>
        </motion.div>
      )}
    </>
  )
}
