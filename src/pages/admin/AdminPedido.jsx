import { useCallback, useEffect, useState } from 'react'
import FormularioPedidoExterno from '../../components/admin/FormularioPedidoExterno.jsx'
import TarjetaPedido from '../../components/admin/TarjetaPedido.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import './AdminPedido.css'

const FILTROS = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'pendiente', texto: 'Pendientes' },
  { valor: 'confirmado', texto: 'Confirmados' },
]

// Cada cuánto se vuelve a pedir la lista, para ver los pedidos nuevos
const CADA_CUANTO_MS = 30000

function AdminPedidos() {
  const { pedir } = useAuth()

  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [ocupado, setOcupado] = useState(false)
  const [agregando, setAgregando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      setDatos(await pedir('/api/admin/pedidos'))
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }, [pedir])

  useEffect(() => {
    cargar()

    const temporizador = setInterval(cargar, CADA_CUANTO_MS)
    return () => clearInterval(temporizador)
  }, [cargar])

  // Hace un cambio en el servidor y vuelve a traer la lista
  const ejecutar = async (accion) => {
    setError('')
    setOcupado(true)

    try {
      await accion()
      await cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado(false)
    }
  }

  const confirmar = (pedido) =>
    ejecutar(() =>
      pedir(`/api/admin/pedidos/${pedido.id}/confirmar`, { metodo: 'PUT' }),
    )

  const borrar = (pedido) => {
    const aviso = `¿Borrar el pedido ${pedido.codigo} de ${pedido.nombre_cliente}? No se puede deshacer.`
    if (!window.confirm(aviso)) return

    return ejecutar(() =>
      pedir(`/api/admin/pedidos/${pedido.id}`, { metodo: 'DELETE' }),
    )
  }

  const borrarPendientes = () => {
    const cantidad = datos.total_pendientes
    const cuales =
      cantidad === 1 ? 'el pedido pendiente' : `los ${cantidad} pedidos pendientes`

    if (!window.confirm(`Se van a borrar ${cuales}. No se puede deshacer. ¿Querés continuar?`)) {
      return
    }

    // Solo se borran los pendientes que llegaron hasta la última vez que se cargó la lista
    return ejecutar(() =>
      pedir(`/api/admin/pedidos/pendientes?hasta=${datos.ultimo_id}`, {
        metodo: 'DELETE',
      }),
    )
  }

  // Cuando se guarda un pedido externo: se cierra el formulario y se actualiza la lista
  const alGuardarExterno = async () => {
    setAgregando(false)
    await cargar()
  }

  const visibles = datos
    ? datos.pedidos.filter((pedido) => filtro === 'todos' || pedido.estado === filtro)
    : []

  return (
    <>
      <div className="admin-encabezado">
        <h1 className="admin__saludo">Pedidos</h1>

        {datos && (
          <div className="admin-encabezado__acciones">
            {!agregando && (
              <button type="button" className="boton boton--principal" onClick={() => setAgregando(true)}>
                + Agregar pedido
              </button>
            )}

            <button type="button" className="admin-boton" onClick={cargar} disabled={ocupado}>
              Actualizar
            </button>

            {datos.total_pendientes > 0 && (
              <button type="button" className="admin-boton admin-boton--peligro" onClick={borrarPendientes} disabled={ocupado}>
                Borrar pendientes ({datos.total_pendientes})
              </button>
            )}
          </div>
        )}
      </div>

      <p className="admin-pedidos__ayuda">
        La lista se actualiza sola cada 30 segundos. Confirmá los pedidos que se
        concretaron. La dirección y la nota de cada pedido llegan por WhatsApp.
      </p>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {agregando && (
        <FormularioPedidoExterno
          alGuardar={alGuardarExterno}
          alCancelar={() => setAgregando(false)}
        />
      )}

      {!datos && !error && <p>Cargando...</p>}

      {datos && (
        <>
          <div className="admin-filtros" role="group" aria-label="Filtrar pedidos">
            {FILTROS.map((opcion) => (
              <button key={opcion.valor} type="button" className={`admin-filtro ${filtro === opcion.valor ? 'admin-filtro--activo' : ''}`} aria-pressed={filtro === opcion.valor} onClick={() => setFiltro(opcion.valor)}>
                {opcion.texto}
                {opcion.valor === 'pendiente' && ` (${datos.total_pendientes})`}
              </button>
            ))}
          </div>

          {datos.pedidos.length === 0 && <p>Todavía no hay pedidos.</p>}

          {datos.pedidos.length > 0 && visibles.length === 0 && (
            <p>No hay pedidos en esta vista.</p>
          )}

          <div className="admin-pedidos__lista">
            {visibles.map((pedido) => (
              <TarjetaPedido key={pedido.id} pedido={pedido} ocupado={ocupado} alConfirmar={() => confirmar(pedido)} alBorrar={() => borrar(pedido)} />
            ))}
          </div>

          {datos.hay_mas && (
            <p className="admin-pedidos__ayuda">Se muestran solo los 200 pedidos más recientes.</p>
          )}
        </>
      )}
    </>
  )
}

export default AdminPedidos