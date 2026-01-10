// frontend/src/screens/NotificationsScreen.tsx
import React, { useEffect, useState } from 'react'
import { useTheme } from '../store/ThemeContext'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import api from '../services/api'
import './NotificationsScreen.css'

interface NotificationItem {
  id: string
  title: string
  message: string
  read: boolean
  type: 'info' | 'warning' | 'success'
  createdAt: string
}

const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get<NotificationItem[]>('/notifications')
      setNotifications(response.data)
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const notification = notifications.find((n) => n.id === notificationId)
      if (!notification) return

      const response = await api.patch<NotificationItem>(
        `/notifications/${notificationId}`,
        {
          read: !notification.read,
        },
      )

      setNotifications((prev) =>
        prev.map((n) => (n.id === response.data.id ? response.data : n)),
      )
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    if (!window.confirm('Deseja deletar esta notificação?')) return

    try {
      await api.delete(`/notifications/${notificationId}`)
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId),
      )
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read)

    if (unreadNotifications.length === 0) return

    try {
      await Promise.all(
        unreadNotifications.map((notif) =>
          api.patch(`/notifications/${notif.id}`, { read: true }),
        ),
      )

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
        })),
      )
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getBadgeClass = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warning':
        return 'notif-badge notif-badge-warning'
      case 'success':
        return 'notif-badge notif-badge-success'
      default:
        return 'notif-badge notif-badge-info'
    }
  }

  const getBadgeText = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warning':
        return 'Atenção'
      case 'success':
        return 'Sucesso'
      default:
        return 'Info'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000

    if (diffInSeconds < 60) return 'Agora'
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}m atrás`
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h atrás`
    return `${Math.floor(diffInSeconds / 86400)}d atrás`
  }

  return (
    <div className={`tasks-screen ${theme}`}>
      <Sidebar />
      <div className="tasks-main">
        <Header />
        <div className="notifications-container">
          <section className="notifications-header-section">
            <div>
              <h1>Notificações 🔔</h1>
              <p className="current-date">
                Você tem {unreadCount} notificações não lidas.
              </p>
            </div>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              ✓ Marcar todas como lidas
            </button>
          </section>

          <section className="notifications-list-section">
            {loading ? (
              <div className="loading-spinner">Carregando notificações...</div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <p>📭 Nenhuma notificação no momento.</p>
                <p className="empty-state-subtitle">
                  Notificações serão criadas automaticamente quando você usar a
                  IA.
                </p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notif) => (
                  <Card
                    key={notif.id}
                    className={`notification-card ${
                      notif.read
                        ? 'notification-read'
                        : 'notification-unread'
                    }`}
                  >
                    <div className="notification-header">
                      <div className="notification-title-area">
                        <span className={getBadgeClass(notif.type)}>
                          {getBadgeText(notif.type)}
                        </span>
                        <h3>{notif.title}</h3>
                      </div>
                      <span className="notification-time">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="notification-message">{notif.message}</p>

                    <div className="notification-actions">
                      <button
                        className={`btn-read ${notif.read ? 'read' : ''}`}
                        onClick={() => handleMarkAsRead(notif.id)}
                        title={
                          notif.read
                            ? 'Marcar como não lida'
                            : 'Marcar como lida'
                        }
                      >
                        {notif.read ? '✅' : '☐'}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() =>
                          handleDeleteNotification(notif.id)
                        }
                        title="Deletar notificação"
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
  )
}

export default NotificationsScreen