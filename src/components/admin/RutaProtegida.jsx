import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

// Si no hay una sesión iniciada, manda al login
function RutaProtegida() {
  const { usuario, cargando } = useAuth()

  if (cargando) return <p className="admin-cargando">Cargando...</p>
  if (!usuario) return <Navigate to="/admin/login" replace />

  return <Outlet />
}

export default RutaProtegida