import { useState, useEffect, ReactNode, useContext } from 'react'
import api from '../services/api'
import { AuthContext, User } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          setUser(null)
          return
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        const response = await api.get<User>('/auth/me')
        setUser(response.data)
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err)
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<{ accessToken: string; user: User }>(
        '/auth/login',
        { email, password },
      )

      const { accessToken, user } = response.data

      localStorage.setItem('token', accessToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      setUser(user)
    } catch (err: any) {
      console.error('Erro no login:', err.response?.data)
      throw new Error(err.response?.data?.message || 'Erro ao fazer login')
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post<{ accessToken: string; user: User }>(
        '/auth/register',
        { email, password, name },
      )

      const { user, accessToken } = response.data

      localStorage.setItem('token', accessToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      setUser(user)
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao registrar')
    }
  }

  const loginWithToken = async (token: string) => {
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    const response = await api.get<User>('/auth/me')
    setUser(response.data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        loginWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}