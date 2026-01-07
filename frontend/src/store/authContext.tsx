import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../services/api'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get<User>('/auth/me')
          setUser(response.data)
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      })
      const { user, token } = response.data
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao fazer login')
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post<{ user: User; token: string }>('/auth/register', {
        email,
        password,
        name,
      })
      const { user, token } = response.data
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao registrar')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
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