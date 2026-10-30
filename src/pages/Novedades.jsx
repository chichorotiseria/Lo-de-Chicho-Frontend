import NovedadCard from '../components/NovedadCard.jsx'
import { useDatos } from '../hooks/useDatos.js'
import './Novedades.css'

function Novedades() {
  const { datos, error, cargando, reintentar } = useDatos('/api/novedades')

  return (
    <section className="novedades">
      <div className="contenedor">
        <h1>Novedades</h1>

        {error && (
          <div className="novedades__mensaje">
            <p>No pudimos cargar las novedades. Probá de nuevo en unos minutos.</p>
            <button className="boton boton--principal" onClick={reintentar}>
              Reintentar
            </button>
          </div>
        )}

        {cargando && <p className="novedades__mensaje">Cargando novedades...</p>}

        {datos && datos.novedades.length === 0 && (
          <p className="novedades__mensaje">Por ahora no hay novedades.</p>
        )}

        {datos && datos.novedades.length > 0 && (
          <div className="novedades__lista">
            {datos.novedades.map((novedad) => (
              <NovedadCard key={novedad.id} novedad={novedad} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Novedades