import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { ahoraArgentina, aIsoDesdeArgentina } from '../../utils/fechas.js'
import { formatearPrecio } from '../../utils/formato.js'

const MAX_CANTIDAD = 50

function FormularioPedidoExterno({ alGuardar, alCancelar }) {
  const { pedir } = useAuth()

  // El menú y el costo de envío, que se piden una sola vez al abrir el formulario
  const [menu, setMenu] = useState(null)
  const [errorCarga, setErrorCarga] = useState('')

  const [nombre, setNombre] = useState('')
  const [tipoEntrega, setTipoEntrega] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [fechaHora, setFechaHora] = useState(ahoraArgentina)
  const [cantidades, setCantidades] = useState({}) // clave de fila -> cantidad
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let cancelado = false

    Promise.all([
      pedir('/api/admin/categorias'),
      pedir('/api/admin/platos'),
      pedir('/api/admin/configuracion'),
    ])
      .then(([resCategorias, resPlatos, resConfig]) => {
        if (cancelado) return
        setMenu({
          categorias: resCategorias.categorias,
          platos: resPlatos.platos,
          envio: resConfig.costo_envio,
        })
      })
      .catch((e) => !cancelado && setErrorCarga(e.message))

    return () => {
      cancelado = true
    }
  }, [pedir])

  // Cada fila es un plato, o una opción de un plato (media docena, docena...)
  const grupos = useMemo(() => {
    if (!menu) return []

    return menu.categorias
      .map((categoria) => ({
        id: categoria.id,
        nombre: categoria.nombre,
        filas: menu.platos
          .filter((plato) => plato.categoria_id === categoria.id)
          .flatMap((plato) =>
            plato.variantes.length > 0
              ? plato.variantes.map((variante) => ({
                  clave: `${plato.id}-${variante.id}`,
                  platoId: plato.id,
                  varianteId: variante.id,
                  nombre: plato.nombre,
                  variante: variante.nombre,
                  precio: variante.precio,
                  disponible: plato.disponible,
                }))
              : [
                  {
                    clave: `${plato.id}-0`,
                    platoId: plato.id,
                    varianteId: null,
                    nombre: plato.nombre,
                    variante: null,
                    precio: plato.precio,
                    disponible: plato.disponible,
                  },
                ],
          )
          .filter((fila) => fila.precio !== null),
      }))
      .filter((grupo) => grupo.filas.length > 0)
  }, [menu])

  const texto = busqueda.trim().toLowerCase()
  const gruposVisibles = grupos
    .map((grupo) => ({
      ...grupo,
      filas: grupo.filas.filter(
        (fila) =>
          !texto || `${fila.nombre} ${fila.variante ?? ''}`.toLowerCase().includes(texto),
      ),
    }))
    .filter((grupo) => grupo.filas.length > 0)

  const elegidas = grupos
    .flatMap((grupo) => grupo.filas)
    .filter((fila) => (cantidades[fila.clave] ?? 0) > 0)

  const subtotal = elegidas.reduce(
    (suma, fila) => suma + fila.precio * cantidades[fila.clave],
    0,
  )
  const envio = tipoEntrega === 'delivery' ? (menu?.envio ?? 0) : 0
  const total = subtotal + envio

  const cambiarCantidad = (clave, diferencia) =>
    setCantidades((actuales) => {
      const nueva = Math.min(
        MAX_CANTIDAD,
        Math.max(0, (actuales[clave] ?? 0) + diferencia),
      )
      return { ...actuales, [clave]: nueva }
    })

  const enviar = async (evento) => {
    evento.preventDefault()

    if (!nombre.trim()) {
      setError('Escribí el nombre del cliente.')
      return
    }
    if (!tipoEntrega) {
      setError('Elegí si es retiro o delivery.')
      return
    }
    if (!metodoPago) {
      setError('Elegí la forma de pago.')
      return
    }
    if (!fechaHora) {
      setError('Elegí la fecha y la hora.')
      return
    }
    if (fechaHora > ahoraArgentina()) {
      setError('La fecha y la hora no pueden ser futuras.')
      return
    }
    if (elegidas.length === 0) {
      setError('Agregá al menos un plato.')
      return
    }

    setError('')
    setGuardando(true)

    try {
      await pedir('/api/admin/pedidos', {
        metodo: 'POST',
        cuerpo: {
          nombre: nombre.trim(),
          tipo_entrega: tipoEntrega,
          metodo_pago: metodoPago,
          creado_en: aIsoDesdeArgentina(fechaHora),
          items: elegidas.map((fila) => ({
            plato_id: fila.platoId,
            variante_id: fila.varianteId,
            cantidad: cantidades[fila.clave],
          })),
        },
      })

      // El formulario se cierra desde afuera
      await alGuardar()
    } catch (e) {
      setError(e.message)
      setGuardando(false)
    }
  }

  return (
    <form className="admin-tarjeta formulario-externo" onSubmit={enviar} noValidate>
      <h2>Agregar un pedido</h2>

      <p className="admin-tarjeta__ayuda">
        Para pedidos que llegaron por teléfono, en el mostrador o por WhatsApp. Queda
        confirmado y el total se calcula con los precios actuales del menú.
      </p>

      {errorCarga && (
        <p className="admin-error" role="alert">{errorCarga}</p>
      )}

      {!menu && !errorCarga && <p>Cargando el menú...</p>}

      {menu && (
        <>
          <div className="admin-campo">
            <label htmlFor="externo-nombre">Nombre del cliente</label>
            <input id="externo-nombre" type="text" maxLength="120" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div className="externo-grupos">
            <fieldset className="externo-fieldset">
              <legend>Entrega</legend>
              <label className="externo-opcion">
                <input type="radio" name="externo-entrega" checked={tipoEntrega === 'retiro'} onChange={() => setTipoEntrega('retiro')} />
                Retiro
              </label>
              <label className="externo-opcion">
                <input type="radio" name="externo-entrega" checked={tipoEntrega === 'delivery'} onChange={() => setTipoEntrega('delivery')} />
                Delivery
              </label>
            </fieldset>

            <fieldset className="externo-fieldset">
              <legend>Forma de pago</legend>
              <label className="externo-opcion">
                <input type="radio" name="externo-pago" checked={metodoPago === 'efectivo'} onChange={() => setMetodoPago('efectivo')} />
                Efectivo
              </label>
              <label className="externo-opcion">
                <input type="radio" name="externo-pago" checked={metodoPago === 'transferencia'} onChange={() => setMetodoPago('transferencia')} />
                Transferencia
              </label>
            </fieldset>
          </div>

          <div className="admin-campo">
            <label htmlFor="externo-fecha">Fecha y hora (hora argentina)</label>
            <input id="externo-fecha" type="datetime-local" value={fechaHora} max={ahoraArgentina()} onChange={(e) => setFechaHora(e.target.value)} />
          </div>

          <h3 className="externo-titulo">Platos</h3>

          <div className="admin-campo">
            <label htmlFor="externo-buscar">Buscar un plato</label>
            <input id="externo-buscar" type="search" placeholder="Por ejemplo: empanadas" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>

          <div className="externo-menu">
            {gruposVisibles.length === 0 && <p>No hay platos que coincidan.</p>}

            {gruposVisibles.map((grupo) => (
              <section key={grupo.id}>
                <h4>{grupo.nombre}</h4>

                {grupo.filas.map((fila) => {
                  const cantidad = cantidades[fila.clave] ?? 0

                  return (
                    <div className={`externo-fila ${cantidad > 0 ? 'externo-fila--elegida' : ''}`} key={fila.clave}>
                      <div className="externo-fila__texto">
                        <span>
                          {fila.nombre}
                          {fila.variante ? ` (${fila.variante})` : ''}
                          {!fila.disponible && (
                            <em className="externo-fila__agotado"> · no disponible hoy</em>
                          )}
                        </span>
                        <small>{formatearPrecio(fila.precio)}</small>
                      </div>

                      <div className="externo-cantidad">
                        <button type="button" aria-label={`Quitar uno: ${fila.nombre} ${fila.variante ?? ''}`} onClick={() => cambiarCantidad(fila.clave, -1)} disabled={cantidad === 0}>
                          −
                        </button>
                        <span>{cantidad}</span>
                        <button type="button" aria-label={`Agregar uno: ${fila.nombre} ${fila.variante ?? ''}`} onClick={() => cambiarCantidad(fila.clave, 1)}>
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
              </section>
            ))}
          </div>

          <div className="externo-resumen">
            <h3 className="externo-titulo">Resumen</h3>

            {elegidas.length === 0 ? (
              <p>Todavía no agregaste ningún plato.</p>
            ) : (
              <ul>
                {elegidas.map((fila) => (
                  <li key={fila.clave}>
                    <span>
                      {cantidades[fila.clave]} × {fila.nombre}
                      {fila.variante ? ` (${fila.variante})` : ''}
                    </span>
                    <span>{formatearPrecio(fila.precio * cantidades[fila.clave])}</span>
                  </li>
                ))}

                {tipoEntrega === 'delivery' && (
                  <li>
                    <span>Envío</span>
                    <span>{formatearPrecio(envio)}</span>
                  </li>
                )}

                <li className="externo-resumen__total">
                  <span>Total</span>
                  <span>{formatearPrecio(total)}</span>
                </li>
              </ul>
            )}
          </div>

          {error && (
            <p className="admin-error" role="alert">{error}</p>
          )}

          <div className="externo-acciones">
            <button type="submit" className="boton boton--principal" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar pedido'}
            </button>
            <button type="button" className="admin-boton" onClick={alCancelar} disabled={guardando}>
              Cancelar
            </button>
          </div>
        </>
      )}

      {errorCarga && (
        <button type="button" className="admin-boton" onClick={alCancelar}>
          Cerrar
        </button>
      )}
    </form>
  )
}

export default FormularioPedidoExterno