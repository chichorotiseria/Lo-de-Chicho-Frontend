import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useConfig } from '../../context/ConfigContext.jsx'
import './Admin.css'

function Inicio() {
  const { usuario, pedir } = useAuth()
  const { refrescar } = useConfig()

  const [config, setConfig] = useState(null)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let cancelado = false

    pedir('/api/admin/configuracion')
      .then((datos) => !cancelado && setConfig(datos))
      .catch((e) => !cancelado && setError(e.message))

    return () => {
      cancelado = true
    }
  }, [pedir])

  const cambiarEstado = async () => {
    setError('')
    setGuardando(true)

    try {
      const datos = await pedir('/api/admin/configuracion', {
        metodo: 'PUT',
        cuerpo: { local_abierto: !config.local_abierto },
      })
      setConfig(datos)
      // El sitio público se entera del cambio sin recargar la página
      refrescar()
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <h1 className="admin__saludo">Hola, {usuario}</h1>

      <section className="admin-tarjeta">
        <h2>Estado del local</h2>

        {config && (
          <>
            <p
              className={`estado ${
                config.local_abierto ? 'estado--abierto' : 'estado--cerrado'
              }`}
            >
              {config.local_abierto
                ? 'Abierto: se reciben pedidos'
                : 'Cerrado: no se reciben pedidos'}
            </p>

            <button
              type="button"
              className="boton boton--principal"
              onClick={cambiarEstado}
              disabled={guardando}
            >
              {config.local_abierto ? 'Cerrar el local' : 'Abrir el local'}
            </button>
          </>
        )}

        {!config && !error && <p>Cargando...</p>}

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </>
  )
}

export default Inicio