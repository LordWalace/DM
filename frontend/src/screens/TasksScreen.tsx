import React, { useState, useEffect } from 'react';
import { useTheme } from '../store/ThemeContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import './TasksScreen.css';

interface Task {
  id: string;
  title: string;
  datetime: string;
  completed: boolean;
  description?: string;
}

const TasksScreen: React.FC = () => {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Usuário');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    // Simular carregamento de dados do backend
    fetchUserData();
    fetchTodayTasks();
  }, []);

  const fetchUserData = async () => {
    try {
      // const response = await fetch('http://localhost:3000/api/users/profile');
      // const data = await response.json();
      // setUserName(data.name);
      setUserName('João Silva'); // Mock data
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
    }
  };

  const fetchTodayTasks = async () => {
    try {
      setLoading(true);
      // const response = await fetch('http://localhost:3000/api/tasks/today');
      // const data = await response.json();
      // setTasks(data);

      // Mock data para desenvolvimento
      setTasks([
        {
          id: '1',
          title: 'Reunião com o time',
          datetime: '09:00',
          completed: false,
          description: 'Semanal de planejamento',
        },
        {
          id: '2',
          title: 'Almoço',
          datetime: '12:30',
          completed: false,
          description: 'Restaurante X',
        },
        {
          id: '3',
          title: 'Finalizar projeto',
          datetime: '14:00',
          completed: true,
          description: 'Frontend DayMind',
        },
        {
          id: '4',
          title: 'Reunião com cliente',
          datetime: '16:00',
          completed: false,
          description: 'Apresentação final',
        },
      ]);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      // const response = await fetch(`http://localhost:3000/api/tasks/${taskId}/complete`, {
      //   method: 'PATCH',
      // });
      // if (response.ok) {
      //   setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
      // }

      // Mock update
      setTasks(
        tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      console.error('Erro ao marcar tarefa como concluída:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      //   method: 'DELETE',
      // });
      // if (response.ok) {
      //   setTasks(tasks.filter(t => t.id !== taskId));
      // }

      // Mock delete
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'pending':
        return tasks.filter((t) => !t.completed);
      case 'completed':
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  };

  const sortedTasks = getFilteredTasks().sort((a, b) => {
    const timeA = parseInt(a.datetime.replace(':', ''));
    const timeB = parseInt(b.datetime.replace(':', ''));
    return timeA - timeB;
  });

  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className={`tasks-screen ${theme}`}>
      <Sidebar />
      <div className="tasks-main">
        <Header />
        <div className="tasks-container">
          {/* Saudação */}
          <section className="greeting-section">
            <h1>Olá, {userName}! 👋</h1>
            <p className="current-date">
              {dateFormatter.format(today).charAt(0).toUpperCase() +
                dateFormatter.format(today).slice(1)}
            </p>
          </section>

          {/* Botões de ação */}
          <section className="action-buttons">
            <button className="btn btn-primary" title="Nova atividade">
              ➕ Nova atividade
            </button>
            <button className="btn btn-secondary" title="Falar">
              🎤 Falar
            </button>
            <button className="btn btn-secondary" title="IA">
              🧠 IA
            </button>
          </section>

          {/* Filtros */}
          <section className="filter-section">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas ({tasks.length})
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pendentes ({tasks.filter((t) => !t.completed).length})
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Concluídas ({tasks.filter((t) => t.completed).length})
            </button>
          </section>

          {/* Lista de tarefas */}
          <section className="tasks-list-section">
            {loading ? (
              <div className="loading-spinner">Carregando tarefas...</div>
            ) : sortedTasks.length === 0 ? (
              <div className="empty-state">
                <p>📭 Nenhuma tarefa {filter !== 'all' ? `${filter}` : ''}.</p>
                <button className="btn btn-primary">Criar primeira tarefa</button>
              </div>
            ) : (
              <div className="tasks-grid">
                {sortedTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`task-card ${
                      task.completed ? 'completed' : 'pending'
                    }`}
                  >
                    <div className="task-header">
                      <div>
                        <h3 className={task.completed ? 'strike' : ''}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="task-description">{task.description}</p>
                        )}
                      </div>
                      <span className="task-time">⏰ {task.datetime}</span>
                    </div>
                    <div className="task-actions">
                      <button
                        className={`btn-check ${
                          task.completed ? 'checked' : ''
                        }`}
                        onClick={() => handleCompleteTask(task.id)}
                        title={
                          task.completed
                            ? 'Marcar como pendente'
                            : 'Marcar como concluída'
                        }
                      >
                        {task.completed ? '✅' : '☐'}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Deletar tarefa"
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
    </div>
  );
};

export default TasksScreen;