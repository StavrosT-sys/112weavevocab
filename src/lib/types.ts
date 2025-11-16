export interface Word {
  id: number
  text: string
  category: 'verb' | 'emotion' | 'food' | 'theme'
  stability: number // FSRS sim: 0-1
  relations?: number[]
}

export interface Quest {
  id: number
  title: string
  category: string
  progress: number
  target: number
  unlocked: boolean
}
