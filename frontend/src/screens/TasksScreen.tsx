// frontend/src/screens/TasksScreen.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../store/ThemeContext'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import TaskModal from '../components/TaskModal'
import api from '../services/api'
import { Task, CreateTaskDto } from '../services/types'
import './TasksScreen.css'

const TasksScreen: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('Usuário')
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUserData(), fetchTasks()])
    }
    loadData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me')
      setUserName(response.data.name || 'Usuário')
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await api.get<Task[]>('/tasks')
      setTasks(response.data)
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (data: CreateTaskDto) => {
    try {
      const response = await api.post<Task>('/tasks', data)
      setTasks((prev) => [...prev, response.data])
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      throw error
    }
  }

  const handleUpdateTask = async (data: CreateTaskDto) => {
    if (!editingTask) return
    try {
      const response = await api.patch<Task>(`/tasks/${editingTask.id}`, data)
      setTasks((prev) =>
        prev.map((t) => (t.id === response.data.id ? response.data : t)),
      )
      setEditingTask(null)
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      throw error
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      const current = tasks.find((t) => t.id === taskId)
      if (!current) return

      const response = await api.patch<Task>(`/tasks/${taskId}`, {
        done: !current.done,
      })

      const updated = response.data
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      )
    } catch (error) {
      console.error('Erro ao marcar tarefa como concluída:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Deseja deletar esta atividade?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
    }
  }

  const getFilteredTasks = () => {
    switch (filter) {
      case 'pending':
        return tasks.filter((t) => !t.done)
      case 'completed':
        return tasks.filter((t) => t.done)
      default:
        return tasks
    }
  }

  const sortedTasks = getFilteredTasks().sort((a, b) =>
    a.date.localeCompare(b.date),
  )

  const today = new Date()
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const formatTimeRange = (task: Task) => {
    if (task.allDay) return 'Dia todo'
    const start = new Date(task.date)
    const startStr = start.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    if (task.endDate) {
      const end = new Date(task.endDate)
      const endStr = end.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
      return `${startStr} - ${endStr}`
    }
    return startStr
  }

  const getProgress = (task: Task) => {
    if (task.allDay || !task.endDate) return 0
    const now = Date.now()
    const start = new Date(task.date).getTime()
    const end = new Date(task.endDate).getTime()
    if (now <= start) return 0
    if (now >= end) return 100
    return ((now - start) / (end - start)) * 100
  }

  const openNewTaskModal = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  return (
    <div className={`tasks-screen ${theme}`}>
      <Sidebar />
      <div className="tasks-main">
        <Header />
        <div className="tasks-container">
          <section className="greeting-section">
            <h1>Olá, {userName}! 👋</h1>
            <p className="current-date">
              {dateFormatter.format(today).charAt(0).toUpperCase() +
                dateFormatter.format(today).slice(1)}
            </p>
          </section>

          <section className="action-buttons">
            <button
              className="btn btn-primary"
              title="Nova atividade"
              onClick={openNewTaskModal}
            >
              ➕ Nova atividade
            </button>
            <button className="btn btn-secondary" title="Falar">
              🎤 Falar
            </button>
            <button
              className="btn btn-secondary"
              title="IA"
              onClick={() => navigate('/ai')}
            >
              🧠 IA
            </button>
          </section>

          <section className="filter-section">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas ({tasks.length})
            </button>
            <button
              className={`filter-btn ${
                filter === 'pending' ? 'active' : ''
              }`}
              onClick={() => setFilter('pending')}
            >
              Pendentes ({tasks.filter((t) => !t.done).length})
            </button>
            <button
              className={`filter-btn ${
                filter === 'completed' ? 'active' : ''
              }`}
              onClick={() => setFilter('completed')}
            >
              Concluídas ({tasks.filter((t) => t.done).length})
            </button>
          </section>

          <section className="tasks-list-section">
            {loading ? (
              <div className="loading-spinner">Carregando tarefas...</div>
            ) : sortedTasks.length === 0 ? (
              <div className="empty-state">
                <p>📭 Nenhuma tarefa {filter !== 'all' ? `${filter}` : ''}.</p>
                <button
                  className="btn btn-primary"
                  onClick={openNewTaskModal}
                >
                  Criar primeira atividade
                </button>
              </div>
            ) : (
              <div className="tasks-grid">
                {sortedTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`task-card ${
                      task.done ? 'completed' : 'pending'
                    }`}
                  >
                    <div className="task-header">
                      <div>
                        <h3 className={task.done ? 'strike' : ''}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="task-description">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <span className="task-time">
                        ⏰ {formatTimeRange(task)}
                      </span>
                    </div>

                    {!task.allDay && task.endDate && (
                      <div className="task-progress-bar">
                        <div
                          className="task-progress-fill"
                          style={{ width: `${getProgress(task)}%` }}
                        />
                      </div>
                    )}

                    <div className="task-actions">
                      <button
                        className={`btn-check ${task.done ? 'checked' : ''}`}
                        onClick={() => handleCompleteTask(task.id)}
                        title={
                          task.done
                            ? 'Marcar como pendente'
                            : 'Marcar como concluída'
                        }
                      >
                        {task.done ? '✅' : '☐'}
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => openEditTaskModal(task)}
                        title="Editar atividade"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Deletar atividade"
                      >
                        🗑️
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        isEditMode={!!editingTask}
      />
    </div>
  )
}

export default TasksScreen