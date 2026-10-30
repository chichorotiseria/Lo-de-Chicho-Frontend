import { useConfig } from '../context/ConfigContext.jsx'

// Franja que aparece en todas las páginas cuando el dueño marca el local como cerrado
function AvisoCerrado() {
  const { config } = useConfig()

  if (!config || config.local_abierto) return null

  return (
    <div className="aviso-cerrado" role="status">
      El local está cerrado por el momento. Podés ver el menú, pero no se reciben pedidos.
    </div>
  )
}

export default AvisoCerrado