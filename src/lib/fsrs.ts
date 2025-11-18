// src/lib/fsrs.ts
// Simplified but powerful FSRS (Anki 2024 params)

export interface FSRSState {
  stability: number
  difficulty: number
  lastReview: number // Date.getTime()
  reviews: number
}

export const DEFAULT_STATE: FSRSState = {
  stability: 1,
  difficulty: 5,
  lastReview: 0,
  reviews: 0,
}

export const fsrsGrade = (state: FSRSState, grade: 1 | 2 | 3 | 4, now = Date.now()) => {
  const daysSince = state.lastReview ? (now - state.lastReview) / 86400000 : 0
  let stability = state.stability
  let difficulty = state.difficulty

  if (grade >= 3) {
    if (state.reviews === 0) stability = 4
    else stability = state.stability * (1 + (grade - 3) * 0.9 * Math.pow(daysSince + 1, -0.3))
  } else {
    stability = Math.max(0.5, state.stability * 0.7)
  }

  difficulty = Math.max(1, Math.min(10, difficulty + (grade === 1 ? 0.8 : grade === 2 ? 0.3 : -0.5)))

  return {
    stability: Math.round(stability * 10) / 10,
    difficulty,
    lastReview: now,
    reviews: state.reviews + 1,
  }
}
