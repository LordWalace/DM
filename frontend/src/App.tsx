import { useState, useEffect } from 'react'
import { useAuth } from './store/AuthProvider'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginScreen from './screens/LoginScreen'
import TasksScreen from './screens/TasksScreen'
import './App.css'

function App() {
  const { isAuthenticated, loading } = useAuth()
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) setIsDark(savedTheme === 'dark')
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  if (loading) {
    return <div className="loading">Carregando...</div>
  }

  return (
    <div className="app-container">
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDark ? '☀️' : '🌙'}
      </button>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <LoginScreen />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <TasksScreen /> : <Navigate to="/login" />} 
        />
      </Routes>
    </div>
  )
}

export default App
