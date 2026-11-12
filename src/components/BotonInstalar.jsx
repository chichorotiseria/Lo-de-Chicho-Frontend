import { useSyncExternalStore } from 'react'
import { suscribirse, obtenerAviso, instalar } from '../instalacion.js'
import './BotonInstalar.css'

// Solo se muestra cuando el navegador permite instalar la app
// (Android con Chrome o similares; nunca en iPhone ni si ya está instalada)
function BotonInstalar({ className = '' }) {
  const aviso = useSyncExternalStore(suscribirse, obtenerAviso)

  if (!aviso) return null

  return (
    <button
      type="button"
      className={`boton-instalar ${className}`.trim()}
      onClick={instalar}
    >
      <svg
        className="boton-instalar__icono"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v12" />
        <path d="M7 11l5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
      Instalar app
    </button>
  )
}

export default BotonInstalar
