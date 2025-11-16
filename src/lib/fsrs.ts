// FSRS params (simplified from Anki - client-side math)
export const FSRS_PARAMS = {
  w: [0.4, 0.6, 1.0, 0.8, 0.2, 0.1, 0.5], // Weights for difficulty/retrievability
}

export function calculateStability(ease: number, prevStability: number = 1): number {
  // Basic FSRS formula sim: stability = prev * (1 + w[0] * (ease - 1))
  return prevStability * (1 + 0.4 * (ease - 1))
}

// Use in prod: Update word.stability on quiz response
