import { useAuth } from '../store/authProvider'
import { useTheme } from '../store/ThemeContext'
import { MdNotifications, MdDarkMode, MdLightMode } from 'react-icons/md'
import { motion } from 'framer-motion'
import './Header.css'

export function Header() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="header">
      <div className="header-left">
        <h2>Bem-vindo, {user?.name || 'Usuário'}!</h2>
      </div>

      <div className="header-right">
        <motion.button
          className="header-icon-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MdNotifications size={24} />
          <span className="notification-badge">0</span>
        </motion.button>

        <motion.button
          className="header-icon-btn"
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {theme === 'light' ? (
            <MdDarkMode size={24} />
          ) : (
            <MdLightMode size={24} />
          )}
        </motion.button>
      </div>
    </header>
  )
}

export default Header