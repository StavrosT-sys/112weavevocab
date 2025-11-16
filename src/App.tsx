import { useState, useEffect } from 'react'
import { words } from './data/words'
import { quests } from './data/quests'
import { useLocalStorage } from './lib/useLocalStorage'
import Graph from './components/Graph'
import Quests from './components/Quests'
import DuelGenerator from './components/DuelGenerator'
import FSRSViz from './components/FSRSViz'

export default function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [weavePath, setWeavePath] = useState<number[]>([])
  const [questProgress, setQuestProgress] = useLocalStorage('quests', quests)

  const handleNodeClick = (id: number) => {
    setSelectedId(id)
    const path = [id, ...getRelations(id).map(w => w.id)].slice(0, 6)
    setWeavePath(path)
    const cat = words.find(w => w.id === id)?.category
    if (cat) {
      setQuestProgress(prev => prev.map(q => 
        q.category === cat && q.progress < q.target 
          ? { ...q, progress: q.progress + 1 } 
          : q
      ))
    }
  }

  const getRelations = (id: number) => words.filter(w => w.relations?.includes(id) || false)

  useEffect(() => {
    questProgress.forEach(q => {
      if (q.progress >= q.target && !q.unlocked) {
        if (navigator.vibrate) navigator.vibrate(50)
      }
    })
  }, [questProgress])

  return (
    <div className="min-h-screen p-4 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">VocabWeave</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Graph words={words} weavePath={weavePath} selectedId={selectedId} onNodeClick={handleNodeClick} />
        <Quests questProgress={questProgress} />
        <div className="lg:col-span-2">
          <DuelGenerator weavePath={weavePath} words={words} questProgress={questProgress} />
          <FSRSViz />
        </div>
      </div>
    </div>
  )
}
