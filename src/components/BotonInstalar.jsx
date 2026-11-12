import { useSyncExternalStore } from 'react'
import { suscribirse, obtenerAviso, instalar } from '../instalacion.js'

// Solo se muestra cuando el navegador permite instalar la app
// (Android con Chrome o similares; nunca en iPhone ni si ya está instalada)
function BotonInstalar({ className = 'boton' }) {
  const aviso = useSyncExternalStore(suscribirse, obtenerAviso)

  if (!aviso) return null

  return (
    <button type="button" className={className} onClick={instalar}>
      Instalar app
    </button>
  )
}

export default BotonInstalar
