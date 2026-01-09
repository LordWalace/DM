import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authProvider'

const AuthCallback = () => {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      loginWithToken(token)
        .then(() => navigate('/', { replace: true }))
        .catch(() => navigate('/login', { replace: true }))
    } else {
      navigate('/login', { replace: true })
    }
  }, [loginWithToken, navigate])

  return <div>Autenticando com Google...</div>
}

export default AuthCallback