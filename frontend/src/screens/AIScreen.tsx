// frontend/src/screens/AIScreen.tsx
import React, { useState } from 'react'
import { useTheme } from '../store/ThemeContext'
import { useAuth } from '../store/authProvider'
import api from '../services/api'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import './AIScreen.css'

interface AiResult {
  id: string
  text: string
  createdAt: string
}

const AIScreen: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useAuth()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AiResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)

  const handleCreateWithAI = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/ai/create', { text: input })

      const now = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })

      const text =
        response.data?.message ||
        'Atividades criadas pela IA e salvas na sua lista.'

      setResults((prev) => [
        {
          id: String(Date.now()),
          text,
          createdAt: now,
        },
        ...prev,
      ])

      setInput('')
    } catch (e: any) {
      console.error('Erro ao chamar /ai/create:', e.response?.data || e)
      setError(
        e.response?.data?.message ||
          'Erro ao conversar com a IA. Tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleStartListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('Seu navegador não suporta reconhecimento de voz.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento:', event.error)
      setError('Erro no reconhecimento de voz. Tente novamente.')
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript))
    }

    recognition.start()
  }

  const firstName = user?.name?.split(' ')[0] || 'Usuário'

  return (
    <div className={`tasks-screen ${theme}`}>
      <Sidebar />
      <div className="tasks-main">
        <Header />
        <div className="ai-container">
          <section className="greeting-section">
            <h1>Crie seu dia com IA 🧠</h1>
            <p className="current-date">
              {firstName}, descreva seu dia em linguagem natural, digitando ou
              falando.
            </p>
          </section>

          <section className="ai-main-grid">
            <Card
              title="Descreva seu dia"
              subtitle="Escreva tudo o que passa na sua cabeça"
              icon={<span>✏️</span>}
            >
              <textarea
                className="ai-textarea"
                placeholder="Ex.: Acordar às 7, estudar para prova, academia à tarde, tempo para games à noite..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
              />

              {error && <p className="ai-error">{error}</p>}

              <div className="ai-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleStartListening}
                  disabled={isListening || loading}
                >
                  {isListening ? 'Ouvindo...' : '🎤 Falar'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateWithAI}
                  disabled={loading || !input.trim()}
                >
                  {loading ? 'Gerando com IA...' : '🧠 Transformar em atividades'}
                </button>
              </div>

              <p className="ai-hint">
                A IA vai converter esse texto em atividades estruturadas, com
                horário e descrição, e salvar na sua lista.
              </p>
            </Card>

            <Card
              title="Histórico de criações"
              subtitle="Últimos resultados da IA"
              icon={<span>📜</span>}
            >
              {results.length === 0 ? (
                <div className="ai-empty">
                  <p>Nenhuma criação ainda.</p>
                  <span>Use o campo ao lado para começar.</span>
                </div>
              ) : (
                <ul className="ai-results-list">
                  {results.map((r) => (
                    <li key={r.id} className="ai-result-item">
                      <div className="ai-result-header">
                        <span className="ai-result-time">{r.createdAt}</span>
                      </div>
                      <p className="ai-result-text">{r.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AIScreen