// frontend/src/screens/Dashboard.tsx
import React, { useEffect, useState } from 'react'
import { useTheme } from '../store/ThemeContext'
import { useAuth } from '../store/authProvider'
import api from '../services/api'
import { Task } from '../services/types'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import './Dashboard.css'

interface TaskSummary {
  total: number
  pending: number
  completed: number
  today: number
}

const Dashboard: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [summary, setSummary] = useState<TaskSummary>({
    total: 0,
    pending: 0,
    completed: 0,
    today: 0,
  })
  const [aiCount, setAiCount] = useState(0)
  const [nextItems, setNextItems] = useState<
    { id: string; title: string; datetime: string; description?: string }[]
  >([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get<Task[]>('/tasks')
        const all = response.data

        const total = all.length
        const completed = all.filter((t) => t.done).length
        const pending = total - completed

        const todayIso = new Date().toISOString().slice(0, 10)
        const today = all.filter((t) => t.date?.startsWith(todayIso)).length

        setSummary({
          total,
          pending,
          completed,
          today,
        })

        const sorted = [...all].sort((a, b) =>
          (a.date || '').localeCompare(b.date || ''),
        )

        setNextItems(
          sorted.slice(0, 3).map((t) => ({
            id: t.id,
            title: t.title,
            datetime: t.date || '',
            description: t.description,
          })),
        )

        // Se você criar um endpoint /ai/metrics, pode trocar isso:
        setAiCount(0)
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      }
    }

    loadData()
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'Usuário'

  return (
    <div className={`tasks-screen ${theme}`}>
      <Sidebar />
      <div className="tasks-main">
        <Header />
        <div className="dashboard-container">
          <section className="greeting-section">
            <h1>Olá, {firstName}! 👋</h1>
            <p className="current-date">
              Aqui está um resumo do seu dia e das suas atividades.
            </p>
          </section>

          <section className="dashboard-summary-grid">
            <Card
              title="Hoje"
              subtitle="Compromissos do dia"
              highlight={`${summary.today} itens`}
              icon={<span>📅</span>}
            >
              <p>
                Você tem <strong>{summary.today}</strong> atividades marcadas
                para hoje.
              </p>
            </Card>

            <Card
              title="Pendentes"
              subtitle="O que ainda falta fazer"
              highlight={`${summary.pending} abertas`}
              icon={<span>⏳</span>}
            >
              <p>
                {summary.pending > 0
                  ? 'Hora de focar no que ainda não foi concluído.'
                  : 'Nenhuma pendência por enquanto, ótimo trabalho!'}
              </p>
            </Card>

            <Card
              title="Concluídas"
              subtitle="Progresso recente"
              highlight={`${summary.completed} feitas`}
              icon={<span>✅</span>}
            >
              <p>
                Você já concluiu <strong>{summary.completed}</strong>{' '}
                atividades recentemente.
              </p>
            </Card>

            <Card
              title="IA DayMind"
              subtitle="Uso da inteligência artificial"
              highlight={`${aiCount} usos`}
              icon={<span>🧠</span>}
            >
              <p>
                A IA ajuda você a transformar pensamentos em ações
                estruturadas.
              </p>
            </Card>
          </section>

          <section className="dashboard-next-section">
            <h2>Próximas atividades</h2>
            <div className="dashboard-next-grid">
              {nextItems.map((item) => (
                <Card
                  key={item.id}
                  title={item.title}
                  subtitle={item.datetime}
                  icon={<span>🕒</span>}
                  className="dashboard-next-card"
                >
                  {item.description && <p>{item.description}</p>}
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Dashboard