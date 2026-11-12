import { useState } from 'react'
import './AvisoIphone.css'

const CLAVE = 'aviso-iphone-cerrado'

const esIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

const yaInstalada = () =>
  window.navigator.standalone === true ||
  window.matchMedia('(display-mode: standalone)').matches

const fueCerrado = () => {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

// Explica cómo agregar la app al inicio del iPhone, donde no se puede
// forzar la instalación. Solo aparece en iPhone, si no está instalada
// y si el cliente no la cerró antes
function AvisoIphone() {
  const [visible, setVisible] = useState(
    () => esIphone() && !yaInstalada() && !fueCerrado(),
  )

  if (!visible) return null

  const cerrar = () => {
    try {
      localStorage.setItem(CLAVE, '1')
    } catch {
      // sin almacenamiento: el aviso vuelve a salir en la próxima visita
    }
    setVisible(false)
  }

  return (
    <aside className="aviso-iphone" role="note">
      <button
        type="button"
        className="aviso-iphone__cerrar"
        onClick={cerrar}
        aria-label="Cerrar aviso"
      >
        ×
      </button>
      <p className="aviso-iphone__titulo">Instalá la app en tu iPhone</p>
      <ol>
        <li>
          Tocá <strong>Compartir</strong>{' '}
          <svg
            className="aviso-iphone__icono"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 15V3" />
            <path d="M8 7l4-4 4 4" />
            <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
          </svg>{' '}
          en la barra del navegador.
        </li>
        <li>
          Elegí <strong>Agregar a inicio</strong>.
        </li>
        <li>
          Confirmá con <strong>Agregar</strong>.
        </li>
      </ol>
    </aside>
  )
}

export default AvisoIphone
