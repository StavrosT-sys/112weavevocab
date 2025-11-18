// src/data/lessons.ts
// 112 lessons – you can expand titles later

export const lessons = Array.from({ length: 112 }, (_, i) => ({
  id: i + 1,
  title: `Lesson ${i + 1}`,
  wordStart: i * 27,
  wordEnd: Math.min((i + 1) * 27 - 1, 2997), // Oxford 3000 cap
}))
