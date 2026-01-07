import { createContext, useContext } from 'react'

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthContext.Provider')
  }
  return context
}