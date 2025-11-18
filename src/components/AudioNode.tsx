// src/components/AudioNode.tsx
import { useEffect, useState } from 'react'

interface Props {
  word: string
  portuguese: string
}

export default function AudioNode({ word, portuguese }: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const loadVoices = () => {
      setVoices(speechSynthesis.getVoices())
    }
    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const speak = () => {
    const enVoice = voices.find(v => v.lang.includes('en')) || voices[0]
    const ptVoice = voices.find(v => v.lang.includes('pt')) || voices[1]

    const en = new SpeechSynthesisUtterance(word)
    en.voice = enVoice
    en.rate = 0.9

    const pt = new SpeechSynthesisUtterance(portuguese)
    pt.voice = ptVoice
    pt.rate = 0.8

    speechSynthesis.speak(en)
    en.onend = () => speechSynthesis.speak(pt)
  }

  return (
    <button
      onClick={speak}
      className="absolute top-2 right-2 bg-cyan-500 hover:bg-cyan-400 rounded-full p-2 shadow-lg"
      aria-label="Play audio"
    >
      🔊
    </button>
  )
}
