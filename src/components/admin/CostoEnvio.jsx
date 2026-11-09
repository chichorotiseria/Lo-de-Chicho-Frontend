import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useConfig } from '../../context/ConfigContext.jsx'
import { formatearPrecio } from '../../utils/formato.js'

const MAXIMO = 1000000

function CostoEnvio() {
  const { pedir } = useAuth()
  const { refrescar } = useConfig()

  const [actual, setActual] = useState(null) // el valor guardado en la base
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let cancelado = false

    pedir('/api/admin/configuracion')
      .then((datos) => {
        if (cancelado) return
        setActual(datos.costo_envio)
        setTexto(String(datos.costo_envio))
      })
      .catch((e) => !cancelado && setError(e.message))

    return () => {
      cancelado = true
    }
  }, [pedir])

  const guardar = async (evento) => {
    evento.preventDefault()
    setError('')
    setMensaje('')

    const limpio = texto.trim()

    if (!/^\d{1,7}$/.test(limpio)) {
      setError('Escribí solo números, sin puntos ni símbolos (por ejemplo 1500).')
      return
    }

    const valor = Number(limpio)

    if (valor > MAXIMO) {
      setError('El valor es demasiado alto.')
      return
    }

    setGuardando(true)
    try {
      const datos = await pedir('/api/admin/configuracion', {
        metodo: 'PUT',
        cuerpo: { costo_envio: valor },
      })

      setActual(datos.costo_envio)
      setTexto(String(datos.costo_envio))
      // El carrito del sitio usa este valor
      refrescar()
      setMensaje('Guardado.')
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="admin-tarjeta">
      <h2>Costo de envío</h2>

      <p className="admin-tarjeta__ayuda">
        Es un valor único que se suma a los pedidos con delivery.
      </p>

      {actual !== null && (
        <p className="envio__actual">
          Valor actual: <strong>{formatearPrecio(actual)}</strong>
        </p>
      )}

      <form className="envio__formulario" onSubmit={guardar} noValidate>
        <div className="envio__campo">
          <label htmlFor="costo-envio">Nuevo valor</label>
          <div className="envio__entrada">
            <span>$</span>
            <input id="costo-envio" type="text" inputMode="numeric" maxLength="7" value={texto} onChange={(e) => setTexto(e.target.value)} />
          </div>
        </div>

        <button type="submit" className="boton boton--principal" disabled={guardando || actual === null}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </form>

      {mensaje && <p className="envio__ok">{mensaje}</p>}

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}

export default CostoEnvio