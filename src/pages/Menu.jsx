import { useEffect, useRef, useState } from 'react'
import { obtener } from '../api.js'
import PlatoCard from '../components/PlatoCard.jsx'
import BarraPedido from '../components/BarraPedido.jsx'
import './Menu.css'

function Menu() {
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)
  const [activa, setActiva] = useState(null)
  const barraRef = useRef(null)

  // Trae el menú del backend
  useEffect(() => {
    let cancelado = false

    obtener('/api/menu')
      .then((datos) => !cancelado && setMenu(datos))
      .catch(() => !cancelado && setError(true))

    return () => {
      cancelado = true
    }
  }, [intento])

  // Marca como activa la categoría que se está viendo
  useEffect(() => {
    if (!menu || menu.categorias.length === 0) return

    const ultima = menu.categorias[menu.categorias.length - 1].id
    const estaAlFinal = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4

    const observador = new IntersectionObserver(
      (entradas) => {
        if (estaAlFinal()) return
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            setActiva(Number(entrada.target.dataset.id))
          }
        }
      },
      { rootMargin: '-130px 0px -65% 0px' },
    )

    document
      .querySelectorAll('.menu-categoria')
      .forEach((seccion) => observador.observe(seccion))

    // Al llegar al final de la página, la última categoría puede ser muy corta
    // y no llegar a la zona de detección: se marca a mano
    const alScrollear = () => estaAlFinal() && setActiva(ultima)
    window.addEventListener('scroll', alScrollear, { passive: true })

    return () => {
      observador.disconnect()
      window.removeEventListener('scroll', alScrollear)
    }
  }, [menu])

  const idActiva = activa ?? menu?.categorias[0]?.id

  // Mantiene visible el botón de la categoría activa en la barra
  useEffect(() => {
    barraRef.current
      ?.querySelector('[aria-current="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [idActiva])

  const irA = (id) => {
    setActiva(id)
    const sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document
      .getElementById(`categoria-${id}`)
      ?.scrollIntoView({ behavior: sinAnimacion ? 'auto' : 'smooth', block: 'start' })
  }

  const reintentar = () => {
    setError(false)
    setMenu(null)
    setIntento((n) => n + 1)
  }

  return (
    <>
      <div className="contenedor menu-titulo">
        <h1>Nuestro menú</h1>
      </div>

      {error && (
        <div className="contenedor menu-mensaje">
          <p>No pudimos cargar el menú. Probá de nuevo en unos minutos.</p>
          <button className="boton boton--principal" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      )}

      {!error && !menu && (
        <p className="contenedor menu-mensaje">Cargando menú...</p>
      )}

      {menu && menu.categorias.length === 0 && (
        <p className="contenedor menu-mensaje">
          El menú todavía no está cargado.
        </p>
      )}

      {menu && menu.categorias.length > 0 && (
        <>
          <nav className="menu-barra" aria-label="Categorías del menú">
            <div className="menu-barra__lista" ref={barraRef}>
              {menu.categorias.map((categoria) => (
                <button key={categoria.id} className={`menu-barra__boton ${categoria.id === idActiva ? 'menu-barra__boton--activo' : ''}`} aria-current={categoria.id === idActiva} onClick={() => irA(categoria.id)}>
                  {categoria.nombre}
                </button>
              ))}
            </div>
          </nav>

          <div className="contenedor">
            {menu.categorias.map((categoria) => (
              <section key={categoria.id} id={`categoria-${categoria.id}`} data-id={categoria.id} className="menu-categoria">
                <h2>{categoria.nombre}</h2>
                <div className="menu-platos">
                  {categoria.platos.map((plato) => (
                    <PlatoCard key={plato.id} plato={plato} />
                  ))}
                </div>
              </section>
            ))}
          </div>
          <BarraPedido />
        </>
      )}
    </>
  )
}

export default Menu
