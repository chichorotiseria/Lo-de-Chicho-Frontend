import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import './Admin.css'

function AdminLayout() {
  const { usuario, cerrarSesion } = useAuth()

  return (
    <div className="admin">
      <header className="admin__barra">
        <div className="admin__barra-contenido">
          <strong className="admin__titulo">Panel · Lo de Chicho</strong>

          <nav className="admin__nav" aria-label="Secciones del panel">
            <NavLink to="/admin" end>
              Inicio
            </NavLink>
            <NavLink to="/admin/pedidos">Pedidos</NavLink>
            <NavLink to="/admin/novedades">Novedades</NavLink>
            <NavLink to="/admin/menu">Menú</NavLink>
            <NavLink to="/admin/estadisticas">Estadísticas</NavLink>
          </nav>

          <div className="admin__sesion">
            <Link to="/">Ver sitio</Link>
            <span>{usuario}</span>
            <button type="button" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="admin__contenido">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout