import { useState, useEffect } from 'react'
import { useAuth } from '../store/authContext'
import api from '../services/api'
import { Task, CreateTaskDto } from '../services/types'
import './TasksScreen.css'

export default function TasksScreen() {
  const { logout } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newTask, setNewTask] = useState({ title: '', date: '' })
  const [aiText, setAiText] = useState('')
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [isUsingAI, setIsUsingAI] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await api.get<Task[]>('/tasks')
      setTasks(response.data)
      setError('')
    } catch (err: any) {
      setError('Erro ao carregar tarefas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    try {
      setIsCreatingTask(true)
      const dto: CreateTaskDto = {
        title: newTask.title,
        date: newTask.date || new Date().toISOString(),
      }
      const response = await api.post<{ task: Task }>('/tasks', dto)
      setTasks([...tasks, response.data.task])
      setNewTask({ title: '', date: '' })
    } catch (err: any) {
      setError('Erro ao criar tarefa')
      console.error(err)
    } finally {
      setIsCreatingTask(false)
    }
  }

  const createTaskFromAI = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiText.trim()) return

    try {
      setIsUsingAI(true)
      const response = await api.post<{ tasks: Task[] }>('/ai/create', {
        text: aiText,
      })
      setTasks([...tasks, ...response.data.tasks])
      setAiText('')
    } catch (err: any) {
      setError('Erro ao usar IA para criar tarefas')
      console.error(err)
    } finally {
      setIsUsingAI(false)
    }
  }

  const toggleTask = async (id: string, done: boolean) => {
    try {
      const response = await api.patch<{ task: Task }>(`/tasks/${id}`, {
        done: !done,
      })
      setTasks(tasks.map(t => t.id === id ? response.data.task : t))
    } catch (err) {
      setError('Erro ao atualizar tarefa')
    }
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return

    try {
      await api.delete(`/tasks/${id}`)
      setTasks(tasks.filter(t => t.id !== id))
    } catch (err) {
      setError('Erro ao deletar tarefa')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const pendingTasks = tasks.filter(t => !t.done)
  const completedTasks = tasks.filter(t => t.done)

  return (
    <div className="tasks-screen">
      <header className="tasks-header">
        <div className="header-content">
          <h1>DayMind</h1>
          <p>Suas tarefas e objetivos</p>
        </div>
        <button className="logout-button" onClick={logout}>
          Sair
        </button>
      </header>

      <main className="tasks-main">
        <div className="tasks-container">
          {/* Seção de criar tarefa manual */}
          <section className="create-task-section">
            <h2>Criar Tarefa</h2>
            <form onSubmit={createTask} className="task-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Título da tarefa..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  disabled={isCreatingTask}
                />
                <input
                  type="datetime-local"
                  value={newTask.date}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  disabled={isCreatingTask}
                />
                <button type="submit" disabled={isCreatingTask}>
                  {isCreatingTask ? '...' : '+ Adicionar'}
                </button>
              </div>
            </form>
          </section>

          {/* Seção de criar tarefas com IA */}
          <section className="ai-section">
            <h2>✨ Criar com IA</h2>
            <p className="ai-hint">
              Exemplo: "às 10 Reunião com time, às 14 Almoço, 15:30 Conferência"
            </p>
            <form onSubmit={createTaskFromAI} className="ai-form">
              <div className="form-row">
                <textarea
                  placeholder="Descreva suas atividades em linguagem natural..."
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  disabled={isUsingAI}
                  rows={2}
                />
                <button type="submit" disabled={isUsingAI} className="ai-button">
                  {isUsingAI ? 'Processando...' : '✨ Criar'}
                </button>
              </div>
            </form>
          </section>

          {error && <div className="error-message">{error}</div>}

          {/* Lista de tarefas */}
          {loading ? (
            <div className="loading">Carregando tarefas...</div>
          ) : (
            <>
              {pendingTasks.length > 0 && (
                <section className="tasks-list-section">
                  <h2>Pendentes ({pendingTasks.length})</h2>
                  <div className="tasks-list">
                    {pendingTasks.map((task) => (
                      <div key={task.id} className="task-item">
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(task.id, task.done)}
                          className="task-checkbox"
                        />
                        <div className="task-content">
                          <h3>{task.title}</h3>
                          <p className="task-date">{formatDate(task.date)}</p>
                        </div>
                        <button
                          className="delete-button"
                          onClick={() => deleteTask(task.id)}
                          title="Deletar"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {completedTasks.length > 0 && (
                <section className="tasks-list-section completed">
                  <h2>Concluídas ({completedTasks.length})</h2>
                  <div className="tasks-list">
                    {completedTasks.map((task) => (
                      <div key={task.id} className="task-item completed">
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(task.id, task.done)}
                          className="task-checkbox"
                        />
                        <div className="task-content">
                          <h3>{task.title}</h3>
                          <p className="task-date">{formatDate(task.date)}</p>
                        </div>
                        <button
                          className="delete-button"
                          onClick={() => deleteTask(task.id)}
                          title="Deletar"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tasks.length === 0 && !loading && (
                <div className="empty-state">
                  <p>Nenhuma tarefa ainda. Crie sua primeira tarefa! 🚀</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}