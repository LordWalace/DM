import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from "./store/authContext";
import LoginScreen from './screens/LoginScreen'
import TasksScreen from './screens/TasksScreen'
import './App.css'

function App() {
  const [token, setToken] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedTheme = localStorage.getItem('theme')
    
    if (savedToken) setToken(savedToken)
    if (savedTheme) setIsDark(savedTheme === 'dark')
    
    setLoading(false)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  const login = (newToken: string) => {
    setToken(newToken)
    localStorage.setItem('authToken', newToken)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('authToken')
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      <Router>
        <div className="app-container">
          {token && (
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDark ? '☀️ Claro' : '🌙 Escuro'}
            </button>
          )}
          <Routes>
            <Route path="/login" element={token ? <Navigate to="/" /> : <LoginScreen />} />
            <Route path="/" element={token ? <TasksScreen /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  )
}

export default App