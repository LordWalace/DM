// frontend/src/screens/ConfigScreen.tsx
import React, { useState } from 'react'
import { useTheme } from '../store/ThemeContext'
import { useAuth } from '../store/authProvider'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import api from '../services/api'
import './ConfigScreen.css'

const ConfigScreen: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  const [language, setLanguage] = useState<'pt-BR' | 'en-US'>('pt-BR')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handleSave = async () => {
    try {
      await api.post('/users/preferences', {
        language,
        soundEnabled,
        notificationsEnabled,
        theme,
      })
      alert('Configurações salvas com sucesso.')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações.')
    }
  }

  return (
    <div className={`tasks-screen ${theme}`}>
      <Sidebar />
      <div className="tasks-main">
        <Header />
        <div className="config-container">
          <section className="greeting-section">
            <h1>Configurações ⚙️</h1>
            <p className="current-date">
              Ajuste o DayMind do seu jeito, {user?.name || 'usuário'}.
            </p>
          </section>

          <div className="config-grid">
            <Card title="Tema" subtitle="Aparência do aplicativo" icon={<span>🎨</span>}>
              <div className="config-field-group">
                <label className="config-label">Escolha o tema</label>
                <div className="config-toggle-group">
                  <button
                    type="button"
                    className={`config-toggle-btn ${
                      theme === 'light' ? 'config-toggle-active' : ''
                    }`}
                    onClick={() => setTheme('light')}
                  >
                    Claro
                  </button>
                  <button
                    type="button"
                    className={`config-toggle-btn ${
                      theme === 'dark' ? 'config-toggle-active' : ''
                    }`}
                    onClick={() => setTheme('dark')}
                  >
                    Escuro
                  </button>
                </div>
              </div>
            </Card>

            <Card
              title="Preferências gerais"
              subtitle="Idioma e notificações"
              icon={<span>🌐</span>}
            >
              <div className="config-field-group">
                <label className="config-label" htmlFor="language">
                  Idioma
                </label>
                <select
                  id="language"
                  className="config-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'pt-BR' | 'en-US')}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">Inglês (EUA)</option>
                </select>
              </div>

              <div className="config-field-group">
                <label className="config-checkbox">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                  <span>Ativar notificações do sistema</span>
                </label>
              </div>

              <div className="config-field-group">
                <label className="config-checkbox">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                  />
                  <span>Sons ao lembrar atividades</span>
                </label>
              </div>
            </Card>
          </div>

          <div className="config-footer">
            <button className="btn btn-primary" type="button" onClick={handleSave}>
              Salvar configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigScreen