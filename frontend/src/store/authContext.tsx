import { createContext } from 'react'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loginWithToken: (token: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)