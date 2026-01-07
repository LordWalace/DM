import { useState, useEffect } from 'react'
import { useAuth } from '../store/authContext'
import api from '../services/api'
import { Task, CreateTaskDto } from '../services/types'
import './TasksScreen.css'

export default function TasksScreen() {
  const { logout, user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newTask, setNewTask] = useState({ title: '', description: '', date: '' })
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
        description: newTask.description,
        date: newTask.date || new Date().toISOString(),
      }
      const response = await api.post<{ task: Task }>('/tasks', dto)
      setTasks([...tasks, response.data.task])
      setNewTask({ title: '', description: '', date: '' })
    } catch (err: any) {
      setError('Erro ao criar tarefa')
      console.error(err)
    } finally {
      setIsCreatingTask(false)
    }
  }

  const enhanceTextWithPerplexity = async (text: string): Promise<string> => {
    try {
      const response = await api.post<{ enhancedText: string }>('/ai/enhance-text', {
        text: text,
      })
      return response.data.enhancedText
    } catch (err: any) {
      console.error('Erro ao melhorar texto com IA:', err)
      return text
    }
  }

  const createTaskFromAI = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiText.trim()) return

    try {
      setIsUsingAI(true)
      const enhancedText = await enhanceTextWithPerplexity(aiText)
      
      const response = await api.post<{ tasks: Task[] }>('/ai/create', {
        text: enhancedText,
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
  const userName = user?.name || 'Usuário'

  return (
    <div className="tasks-screen">
      <header className="tasks-header">
        <div className="header-content">
          <h1>DayMind</h1>
          <p>Organize suas tarefas diárias, {userName}! ✨</p>
        </div>
        <button className="logout-button" onClick={logout}>
          Sair
        </button>
      </header>

      <main className="tasks-main">
        <div className="tasks-container">
          {/* Seção de criar tarefa manual */}
          <section className="create-task-section">
            <div className="section-header">
              <h2>Criar Tarefa</h2>
              <p className="section-description">Adicione uma nova tarefa com título e descrição detalhada</p>
            </div>
            <form onSubmit={createTask} className="task-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Título da tarefa..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  disabled={isCreatingTask}
                  className="task-input"
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Descrição da tarefa (opcional)..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  disabled={isCreatingTask}
                  rows={2}
                  className="task-textarea"
                />
              </div>
              <div className="form-row">
                <input
                  type="datetime-local"
                  value={newTask.date}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  disabled={isCreatingTask}
                  className="task-input"
                />
                <button type="submit" disabled={isCreatingTask} className="btn-primary">
                  {isCreatingTask ? '...' : '+ Adicionar'}
                </button>
              </div>
            </form>
          </section>

          {/* Seção de criar tarefas com IA */}
          <section className="ai-section">
            <div className="section-header">
              <h2>✨ Melhorar com IA</h2>
              <p className="section-description">Descreva suas atividades em linguagem natural e a IA irá melhorar e organizar</p>
            </div>
            <p className="ai-hint">
              Exemplo: "às 10 reunião com time para discutir projeto, às 14 almoço com cliente importante, 15:30 conferência de código"
            </p>
            <form onSubmit={createTaskFromAI} className="ai-form">
              <div className="form-group">
                <textarea
                  placeholder="Descreva suas atividades em linguagem natural..."
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  disabled={isUsingAI}
                  rows={3}
                  className="task-textarea"
                />
              </div>
              <button type="submit" disabled={isUsingAI} className="btn-ai">
                {isUsingAI ? 'Processando com IA...' : '✨ Melhorar e Criar'}
              </button>
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
                          {task.description && <p className="task-description">{task.description}</p>}
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
                          {task.description && <p className="task-description">{task.description}</p>}
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