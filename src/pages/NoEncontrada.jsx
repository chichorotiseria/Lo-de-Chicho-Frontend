import { Link } from 'react-router-dom'

function NoEncontrada() {
  return (
    <section className="seccion">
      <div className="contenedor" style={{ textAlign: 'center' }}>
        <h2>Página no encontrada</h2>
        <p>La página que buscás no existe.</p>
        <Link to="/" className="boton boton--principal">Volver al inicio</Link>
      </div>
    </section>
  )
}

export default NoEncontrada