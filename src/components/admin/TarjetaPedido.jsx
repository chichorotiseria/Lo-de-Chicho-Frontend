import { formatearFechaHora } from '../../utils/fechas.js'
import { formatearPrecio } from '../../utils/formato.js'

const PAGOS = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
}

const ENTREGAS = {
  retiro: 'Retiro en el local',
  delivery: 'Delivery',
}

function TarjetaPedido({ pedido, ocupado, alConfirmar, alBorrar }) {
  const pendiente = pedido.estado === 'pendiente'

  return (
    <article className={`admin-pedido ${pendiente ? 'admin-pedido--pendiente' : ''}`}>
      <header className="admin-pedido__encabezado">
        <div>
          <span className="admin-pedido__codigo">{pedido.codigo}</span>
          <span className="admin-pedido__fecha">{formatearFechaHora(pedido.creado_en)}</span>
        </div>

        <span className={`admin-pedido__estado admin-pedido__estado--${pedido.estado}`}>{pendiente ? 'Pendiente' : 'Confirmado'}</span>
      </header>

      <p className="admin-pedido__cliente">
        <strong>{pedido.nombre_cliente}</strong> · {ENTREGAS[pedido.tipo_entrega]} ·{' '}
        {PAGOS[pedido.metodo_pago] ?? pedido.metodo_pago}
      </p>

      <ul className="admin-pedido__items">
        {pedido.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.cantidad} × {item.nombre_plato}
              {item.variante ? ` (${item.variante})` : ''}
            </span>
            <span>{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
          </li>
        ))}

        {pedido.tipo_entrega === 'delivery' && (
          <li>
            <span>Envío</span>
            <span>{formatearPrecio(pedido.costo_envio)}</span>
          </li>
        )}

        <li className="admin-pedido__total">
          <span>Total</span>
          <span>{formatearPrecio(pedido.total)}</span>
        </li>
      </ul>

      <div className="admin-pedido__acciones">
        {pendiente && (
          <button type="button" className="boton boton--principal" onClick={alConfirmar} disabled={ocupado}>
            Confirmar
          </button>
        )}

        <button type="button" className="admin-boton admin-boton--peligro" onClick={alBorrar} disabled={ocupado}>
          Borrar
        </button>
      </div>
    </article>
  )
}

export default TarjetaPedido