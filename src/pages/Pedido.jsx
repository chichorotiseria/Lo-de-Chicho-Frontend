import { useState } from 'react'
import { Link } from 'react-router-dom'
import { enviarPedido } from '../api.js'
import { enlaceWhatsApp } from '../config/local.js'
import { useCarrito } from '../context/CarritoContext.jsx'
import { useConfig } from '../context/ConfigContext.jsx'
import { generarCodigo } from '../utils/codigo.js'
import { formatearPrecio } from '../utils/formato.js'
import { armarMensaje } from '../utils/mensajeWhatsApp.js'
import './Pedido.css'

const CLAVE_DATOS = 'lo-de-chicho:datos-cliente'

// Nombre y dirección de la última vez, guardados en este navegador
function leerDatosGuardados() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_DATOS)) ?? {}
  } catch {
    return {}
  }
}

function guardarDatos(datos) {
  try {
    localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos))
  } catch {
    // si no se puede guardar, no pasa nada
  }
}

function Pedido() {
  const { items, nota, subtotal, cambiarCantidad, quitar, cambiarNota, vaciar } =
    useCarrito()
  const { config } = useConfig()

  const [tipoEntrega, setTipoEntrega] = useState('')
  const [nombre, setNombre] = useState(() => leerDatosGuardados().nombre ?? '')
  const [direccion, setDireccion] = useState(
    () => leerDatosGuardados().direccion ?? '',
  )
  const [metodoPago, setMetodoPago] = useState('')
  const [intentado, setIntentado] = useState(false)

  const cerrado = config !== null && !config.local_abierto
  const esDelivery = tipoEntrega === 'delivery'
  const costoEnvio = esDelivery ? (config?.costo_envio ?? null) : 0
  const total = costoEnvio === null ? null : subtotal + costoEnvio

  const errores = {
    tipoEntrega: !tipoEntrega && 'Elegí si querés retirar o delivery.',
    nombre: !nombre.trim() && 'Escribí tu nombre.',
    direccion: esDelivery && !direccion.trim() && 'Escribí tu dirección.',
    metodoPago: !metodoPago && 'Elegí la forma de pago.',
  }
  const hayErrores = Object.values(errores).some(Boolean)

  const enviar = (evento) => {
    evento.preventDefault()
    if (cerrado) return

    setIntentado(true)
    if (hayErrores) return

    const codigo = generarCodigo()
    const nombreLimpio = nombre.trim()
    const direccionLimpia = direccion.trim()

    guardarDatos({
      nombre: nombreLimpio,
      direccion: esDelivery
        ? direccionLimpia
        : (leerDatosGuardados().direccion ?? ''),
    })

    // 1) Intenta guardar el pedido. Si falla, se sigue igual:
    //    el pedido le llega al local por WhatsApp.
    enviarPedido({
      codigo,
      nombre: nombreLimpio,
      tipo_entrega: tipoEntrega,
      metodo_pago: metodoPago,
      items: items.map((item) => ({
        plato_id: item.platoId,
        variante_id: item.varianteId,
        cantidad: item.cantidad,
      })),
    }).catch(() => {})

    // 2) Abre WhatsApp con el mensaje armado
    const mensaje = armarMensaje({
      codigo,
      nombre: nombreLimpio,
      tipoEntrega,
      direccion: direccionLimpia,
      items,
      nota,
      metodoPago,
    })

    vaciar()
    window.location.assign(enlaceWhatsApp(mensaje))
  }

  if (items.length === 0) {
    return (
      <section className="pedido">
        <div className="contenedor pedido__vacio">
          <h1>Mi pedido</h1>
          <p>Todavía no agregaste nada.</p>
          <Link to="/menu" className="boton boton--principal">
            Ver el menú
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="pedido">
      <div className="contenedor">
        <h1>Mi pedido</h1>

        {cerrado && (
          <p className="pedido__aviso">
            El local está cerrado por el momento, así que no se pueden enviar pedidos.
          </p>
        )}

        <form className="pedido__columnas" onSubmit={enviar} noValidate>
          <div>
            <section className="pedido__tarjeta">
              <h2>Tu pedido</h2>

              <ul className="lineas">
                {items.map((item) => (
                  <li className="linea" key={item.clave}>
                    <div>
                      <p className="linea__nombre">{item.nombre}</p>
                      {item.varianteNombre && (
                        <p className="linea__detalle">{item.varianteNombre}</p>
                      )}
                      <p className="linea__detalle">
                        {formatearPrecio(item.precio)} c/u
                      </p>
                    </div>

                    <p className="linea__total">
                      {formatearPrecio(item.precio * item.cantidad)}
                    </p>

                    <div className="linea__acciones">
                      <div className="cantidad">
                        <button type="button" aria-label={`Quitar una unidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.clave, item.cantidad - 1)}>
                          −
                        </button>
                        <span>{item.cantidad}</span>
                        <button type="button" aria-label={`Agregar una unidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.clave, item.cantidad + 1)}>
                          +
                        </button>
                      </div>

                      <button type="button" className="linea__quitar" onClick={() => quitar(item.clave)}>
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="campo">
                <label htmlFor="nota">Nota para el local (opcional)</label>
                <textarea id="nota" rows="3" maxLength="300" placeholder="Por ejemplo: sin cebolla" value={nota} onChange={(e) => cambiarNota(e.target.value)} />
              </div>

              <Link to="/menu" className="pedido__seguir">
                + Agregar más platos
              </Link>
            </section>
          </div>

          <div>
            <section className="pedido__tarjeta">
              <h2>Entrega y pago</h2>

              <fieldset className="grupo">
                <legend>¿Cómo querés recibirlo?</legend>
                <div className="opciones">
                  <label className="opcion">
                    <input type="radio" name="entrega" value="retiro" checked={tipoEntrega === 'retiro'} onChange={(e) => setTipoEntrega(e.target.value)} />
                    Retiro en el local
                  </label>
                  <label className="opcion">
                    <input type="radio" name="entrega" value="delivery" checked={tipoEntrega === 'delivery'} onChange={(e) => setTipoEntrega(e.target.value)} />
                    Delivery
                    {config && (
                      <small>+ {formatearPrecio(config.costo_envio)}</small>
                    )}
                  </label>
                </div>
                {intentado && errores.tipoEntrega && (
                  <p className="error" role="alert">
                    {errores.tipoEntrega}
                  </p>
                )}
              </fieldset>

              <div className="campo">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" type="text" autoComplete="name" maxLength="120" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                {intentado && errores.nombre && (
                  <p className="error" role="alert">
                    {errores.nombre}
                  </p>
                )}
              </div>

              {esDelivery && (
                <div className="campo">
                  <label htmlFor="direccion">Dirección</label>
                  <input id="direccion" type="text" autoComplete="street-address" maxLength="200" placeholder="Calle, número y referencias" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                  {intentado && errores.direccion && (
                    <p className="error" role="alert">
                      {errores.direccion}
                    </p>
                  )}
                </div>
              )}

              <fieldset className="grupo">
                <legend>Forma de pago</legend>
                <div className="opciones">
                  <label className="opcion">
                    <input type="radio" name="pago" value="efectivo" checked={metodoPago === 'efectivo'} onChange={(e) => setMetodoPago(e.target.value)} />
                    Efectivo
                  </label>
                  <label className="opcion">
                    <input type="radio" name="pago" value="transferencia" checked={metodoPago === 'transferencia'} onChange={(e) => setMetodoPago(e.target.value)} />
                    Transferencia
                  </label>
                </div>
                {intentado && errores.metodoPago && (
                  <p className="error" role="alert">
                    {errores.metodoPago}
                  </p>
                )}
              </fieldset>

              <div className="resumen">
                <div className="resumen__fila">
                  <span>Subtotal</span>
                  <span>{formatearPrecio(subtotal)}</span>
                </div>
                {esDelivery && (
                  <div className="resumen__fila">
                    <span>Envío</span>
                    <span>
                      {costoEnvio === null
                        ? 'A confirmar'
                        : formatearPrecio(costoEnvio)}
                    </span>
                  </div>
                )}
                <div className="resumen__fila resumen__total">
                  <span>Total</span>
                  <span>{total === null ? '—' : formatearPrecio(total)}</span>
                </div>
              </div>

              <button type="submit" className="boton boton--principal pedido__enviar" disabled={cerrado}>
                Enviar pedido
              </button>
              <p className="pedido__ayuda">
                Se abre WhatsApp con tu pedido para confirmarlo con el local.
              </p>
            </section>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Pedido