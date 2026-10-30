import { LOCAL, enlaceWhatsApp } from '../config/local.js'
import './Footer.css'

function Footer() {
  const redes = LOCAL.redes.filter((red) => red.url)

  return (
    <footer className="footer">
      <div className="contenedor footer__contenido">
        <p className="footer__nombre">{LOCAL.nombre}</p>
        <p>{LOCAL.direccion}</p>
        <p>
          <a href={enlaceWhatsApp()} target="_blank" rel="noreferrer">
            WhatsApp {LOCAL.whatsappVisible}
          </a>
        </p>{redes.length > 0 && (
          <p>{redes.map((red) => (
              <a key={red.nombre} href={red.url} target="_blank" rel="noreferrer">
                {red.nombre}
              </a>
            ))}
          </p>
        )}
      </div>
    </footer>
  )
}

export default Footer