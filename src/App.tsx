// src/App.tsx
// Updated with all 5 features integrated

import { useState } from 'react'
import GraphCluster from './components/GraphCluster'
import AudioNode from './components/AudioNode'
import DuelSync from './components/DuelSync'
import FeedbackForm from './components/FeedbackForm'
import { words } from './data/words'

export default function App() {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const myScore = 0 // Replace with actual score calculation

  return (
    <>
      <DuelSync myScore={myScore} />
      <FeedbackForm />

      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            VocabWeave
          </h1>

          {!selectedLesson ? (
            <>
              <h2 className="text-2xl text-white text-center mb-6">
                Escolha uma lição
              </h2>
              <GraphCluster 
                onLessonSelect={setSelectedLesson} 
                selectedLesson={selectedLesson} 
              />
            </>
          ) : (
            <div className="p-6">
              <button 
                onClick={() => setSelectedLesson(null)} 
                className="mb-6 text-cyan-400 hover:text-cyan-300 text-lg"
              >
                ← Voltar
              </button>

              <h2 className="text-3xl text-white mb-6">
                Lição {selectedLesson}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {words
                  .filter(w => w.lesson === selectedLesson)
                  .map(word => (
                    <div 
                      key={word.id} 
                      className="relative bg-white/10 backdrop-blur rounded-xl p-6 text-white hover:bg-white/20 transition"
                    >
                      <h3 className="text-2xl font-bold mb-2">{word.text}</h3>
                      <p className="text-lg text-cyan-300">{word.portuguese}</p>
                      <AudioNode word={word.text} portuguese={word.portuguese} />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
