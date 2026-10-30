import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LOCAL } from '../config/local.js'
import { useCarrito } from '../context/CarritoContext.jsx'
import './Navbar.css'

const ENLACES = [
  { to: '/', texto: 'Inicio' },
  { to: '/novedades', texto: 'Novedades' },
  { to: '/menu', texto: 'Menú' },
  { to: '/pedido', texto: 'Mi pedido' },
]

function Navbar() {
  const [abierto, setAbierto] = useState(false)
  const { cantidadTotal } = useCarrito()

  // Con el panel abierto: sin scroll de fondo y la tecla Escape lo cierra
  useEffect(() => {
    if (!abierto) return

    document.body.style.overflow = 'hidden'
    const alTeclear = (e) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', alTeclear)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', alTeclear)
    }
  }, [abierto])

  const cerrar = () => setAbierto(false)

  return (
    <header className="navbar">
      <div className="navbar__barra">
        <NavLink to="/" className="navbar__logo">
          {LOCAL.nombre}
        </NavLink>

        <button
          className="navbar__boton"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          aria-controls="menu-principal"
          onClick={() => setAbierto(true)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className={`navbar__fondo ${abierto ? 'navbar__fondo--visible' : ''}`}
          onClick={cerrar}
        />

        <nav
          id="menu-principal"
          aria-label="Principal"
          className={`navbar__menu ${abierto ? 'navbar__menu--abierto' : ''}`}
        >
          <button
            className="navbar__cerrar"
            aria-label="Cerrar menú"
            onClick={cerrar}
          >
            ×
          </button>
          <ul>
            {ENLACES.map((enlace) => (
              <li key={enlace.to}>
                <NavLink
                  to={enlace.to}
                  end={enlace.to === '/'}
                  className={({ isActive }) => (isActive ? 'activo' : '')}
                  onClick={cerrar}
                >
                  {enlace.texto}
                  {enlace.to === '/pedido' && cantidadTotal > 0 && (
                    <span className="navbar__contador">{cantidadTotal}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar