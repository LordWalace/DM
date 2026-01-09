import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/authProvider'
import TasksScreen from './screens/TasksScreen'
import AIScreen from './screens/AIScreen'
import NotificationsScreen from './screens/NotificationsScreen'
import ConfigScreen from './screens/ConfigScreen'
import Dashboard from './screens/Dashboard'
import LoginScreen from './screens/LoginScreen'
import AuthCallback from './screens/AuthCallback'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <TasksScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/ai"
        element={
          <PrivateRoute>
            <AIScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <NotificationsScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/config"
        element={
          <PrivateRoute>
            <ConfigScreen />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App