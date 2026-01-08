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
  time: string
  read: boolean
  type: 'info' | 'warning' | 'success'
}

const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await api.get<NotificationItem[]>('/notifications')
        setNotifications(response.data)
      } catch (error) {
        console.error('Erro ao buscar notificações:', error)
      }
    }

    loadNotifications()
  }, [])

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
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
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Marcar todas como lidas
            </button>
          </section>

          <section className="notifications-list-section">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <p>📭 Nenhuma notificação no momento.</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notif) => (
                  <Card
                    key={notif.id}
                    className={`notification-card ${
                      notif.read ? 'notification-read' : 'notification-unread'
                    }`}
                  >
                    <div className="notification-header">
                      <div className="notification-title-area">
                        <span className={getBadgeClass(notif.type)}>
                          {notif.type === 'warning'
                            ? 'Atenção'
                            : notif.type === 'success'
                            ? 'Sucesso'
                            : 'Info'}
                        </span>
                        <h3>{notif.title}</h3>
                      </div>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                    <p className="notification-message">{notif.message}</p>
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