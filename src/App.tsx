// src/App.tsx — FINAL WITH TRUE WEAVE
import { useState } from 'react'
import GraphCluster from './components/GraphCluster'
import ExplorationMode from './components/ExplorationMode'
import DashboardView from './components/DashboardView'
import DuelSync from './components/DuelSync'
import FeedbackForm from './components/FeedbackForm'

type View = 'cluster' | 'explore' | 'dashboard'

export default function App() {
  const [view, setView] = useState<View>('cluster')
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const myScore = 0 // Replace with actual score calculation

  return (
    <>
      <DuelSync myScore={myScore} />
      <FeedbackForm />

      {view === 'cluster' && (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900">
          <GraphCluster onSelect={setSelectedLesson} selected={selectedLesson} />
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-6 z-50">
            <button onClick={() => setView('explore')} className="bg-cyan-500 text-black px-10 py-5 rounded-full text-2xl font-bold shadow-2xl hover:bg-cyan-400 transition">
              Explorar Rede
            </button>
            <button onClick={() => setView('dashboard')} className="bg-purple-600 text-white px-10 py-5 rounded-full text-2xl font-bold shadow-2xl hover:bg-purple-500 transition">
              Meu Progresso
            </button>
          </div>
        </div>
      )}

      {view === 'explore' && (
        <>
          <ExplorationMode lessonId={selectedLesson || undefined} />
          <button onClick={() => setView('cluster')} className="fixed top-8 left-8 bg-white/20 backdrop-blur rounded-full px-8 py-4 text-white z-50 text-xl hover:bg-white/30 transition">
            ← Voltar
          </button>
        </>
      )}

      {view === 'dashboard' && (
        <>
          <DashboardView />
          <button onClick={() => setView('cluster')} className="fixed top-8 left-8 bg-white/20 backdrop-blur rounded-full px-8 py-4 text-white z-50 text-xl hover:bg-white/30 transition">
            ← Voltar
          </button>
        </>
      )}
    </>
  )
}
