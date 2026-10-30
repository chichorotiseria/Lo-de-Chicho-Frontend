import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import './Admin.css'

function Login() {
  const { usuario, iniciarSesion } = useAuth()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Si ya hay una sesión iniciada, no tiene sentido mostrar el login
  if (usuario) return <Navigate to="/admin" replace />

  const enviar = async (evento) => {
    evento.preventDefault()
    setError('')
    setEnviando(true)

    try {
      await iniciarSesion(nombre, password)
      navigate('/admin', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login">
      <form className="login__tarjeta" onSubmit={enviar}>
        <h1>Panel de Lo de Chicho</h1>

        <div className="admin-campo">
          <label htmlFor="usuario">Usuario</label>
          <input id="usuario" type="text" autoComplete="username" autoCapitalize="none" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div className="admin-campo">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="boton boton--principal login__boton" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

export default Login