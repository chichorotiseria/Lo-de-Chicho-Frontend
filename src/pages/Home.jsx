import { Link } from 'react-router-dom'
import { LOCAL, enlaceMapa, enlaceWhatsApp } from '../config/local.js'
import BotonInstalar from '../components/BotonInstalar.jsx'
import './Home.css'

function Home() {
  const redes = LOCAL.redes.filter((red) => red.url)

  return (
    <>
      <section className="hero">
        <div className="contenedor">
          <h1>{LOCAL.nombre}</h1>
          <p>{LOCAL.slogan}</p>
          <div className="hero__botones">
            <Link to="/menu" className="boton boton--principal">
              Hacer pedido
            </Link>
            <a href={enlaceWhatsApp()} target="_blank" rel="noreferrer" className="boton boton--secundario">Escribinos por WhatsApp</a>
            <BotonInstalar className="boton boton--secundario" />
          </div>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <h2>Nuestra historia</h2>
          <div className="historia">
            {LOCAL.historia.map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion seccion--oscura">
        <div className="contenedor">
          <h2>Dónde encontrarnos</h2>
          <div className="info">
            <article className="tarjeta">
              <h3>Dirección</h3>
              <p>{LOCAL.direccion}</p>
              <a href={enlaceMapa()} target="_blank" rel="noreferrer">Cómo llegar</a>
            </article>

            <article className="tarjeta">
              <h3>Horarios</h3>
              <ul>
                {LOCAL.horarios.map((h) => (
                  <li key={h.dias}>
                    <strong>{h.dias}:</strong> {h.horas}
                  </li>
                ))}
              </ul>
            </article>

            <article className="tarjeta">
              <h3>Contacto</h3>
              <p>
                <a href={enlaceWhatsApp()} target="_blank" rel="noreferrer">
                  WhatsApp {LOCAL.whatsappVisible}
                </a>
              </p>
              {redes.map((red) => (
                <p key={red.nombre}>
                  <a href={red.url} target="_blank" rel="noreferrer">{red.nombre}</a>
                </p>
              ))}
            </article>
          </div>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor">
          <h2>Galería</h2>
          <div className="galeria">
            {LOCAL.galeria.map((foto, i) => (
              <div className="galeria__item" key={i}>
                {foto.src ? (
                  <img src={foto.src} alt={foto.alt} loading="lazy" />
                ) : (
                  <span>Foto próximamente</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
