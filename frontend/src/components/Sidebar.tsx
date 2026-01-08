import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/authProvider'
import {
  MdDashboard,
  MdTaskAlt,
  MdAutoAwesome,
  MdNotifications,
  MdSettings,
  MdLogout,
  MdMenu,
  MdClose,
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import './Sidebar.css'

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { icon: MdDashboard, label: 'Dashboard', path: '/' },
    { icon: MdTaskAlt, label: 'Tarefas', path: '/tasks' },
    { icon: MdAutoAwesome, label: 'Criar com IA', path: '/ai' },
    { icon: MdNotifications, label: 'Notificações', path: '/notifications' },
    { icon: MdSettings, label: 'Configurações', path: '/config' },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsOpen(false)
  }

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        {isOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        exit={{ x: -300 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sidebar-logo">
          <span>🧠</span>
          <h2>DayMind</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <motion.button
              key={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path)
                setIsOpen(false)
              }}
              whileHover={{ x: 8 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <MdLogout size={20} />
            <span>Sair</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar