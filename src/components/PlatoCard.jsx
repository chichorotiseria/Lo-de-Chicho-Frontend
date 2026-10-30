import { useEffect, useState } from 'react'
import { useCarrito } from '../context/CarritoContext.jsx'
import { useConfig } from '../context/ConfigContext.jsx'
import { formatearPrecio } from '../utils/formato.js'
import './PlatoCard.css'

function PlatoCard({ plato }) {
  const [elegida, setElegida] = useState(0)
  const [agregado, setAgregado] = useState(false)
  const { agregar } = useCarrito()
  const { config } = useConfig()

  const tieneVariantes = plato.variantes.length > 0
  const precio = tieneVariantes ? plato.variantes[elegida].precio : plato.precio
  const cerrado = config !== null && !config.local_abierto

  // El aviso "Agregado" dura un momento
  useEffect(() => {
    if (!agregado) return

    const temporizador = setTimeout(() => setAgregado(false), 1200)
    return () => clearTimeout(temporizador)
  }, [agregado])

  const alAgregar = () => {
    agregar(plato, tieneVariantes ? plato.variantes[elegida] : null)
    setAgregado(true)
  }

  return (
    <article className={`plato ${plato.disponible ? '' : 'plato--agotado'}`}>
      {plato.imagen_url && (
        <img
          className="plato__imagen"
          src={plato.imagen_url}
          alt={plato.nombre}
          loading="lazy"
        />
      )}

      <div className="plato__cuerpo">
        {!plato.disponible && (
          <span className="plato__etiqueta">No disponible</span>
        )}

        <div className="plato__encabezado">
          <h3>{plato.nombre}</h3>
          <span className="plato__precio">{formatearPrecio(precio)}</span>
        </div>

        {plato.descripcion && (
          <p className="plato__descripcion">{plato.descripcion}</p>
        )}

        {tieneVariantes && (
          <div
            className="plato__variantes"
            role="group"
            aria-label={`Opciones de ${plato.nombre}`}
          >
            {plato.variantes.map((variante, i) => (
              <button
                key={variante.id}
                type="button"
                className={`variante ${i === elegida ? 'variante--activa' : ''}`}
                aria-pressed={i === elegida}
                onClick={() => setElegida(i)}
              >
                {variante.nombre}
              </button>
            ))}
          </div>
        )}

        {plato.disponible && (
          <button
            type="button"
            className="plato__agregar"
            onClick={alAgregar}
            disabled={cerrado}
          >
            {cerrado ? 'Local cerrado' : agregado ? 'Agregado ✓' : 'Agregar'}
          </button>
        )}
      </div>
    </article>
  )
}

export default PlatoCard