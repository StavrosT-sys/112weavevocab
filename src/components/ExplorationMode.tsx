// src/components/ExplorationMode.tsx
import WordGraph from './WordGraph'

export default function ExplorationMode({ lessonId }: { lessonId?: number }) {
  return (
    <div className="relative w-full h-screen">
      <WordGraph lessonId={lessonId} />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur rounded-full px-8 py-4 text-white text-xl">
        Explore sua rede semântica
      </div>
    </div>
  )
}
