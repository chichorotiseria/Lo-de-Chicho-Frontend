import { Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext.jsx'
import { formatearPrecio } from '../utils/formato.js'
import './BarraPedido.css'

// Barra fija abajo del Menú que aparece cuando hay algo en el carrito
function BarraPedido() {
  const { cantidadTotal, subtotal } = useCarrito()

  if (cantidadTotal === 0) return null

  return (
    <Link to="/pedido" className="barra-pedido">
      <span>Ver mi pedido ({cantidadTotal})</span>
      <strong>{formatearPrecio(subtotal)}</strong>
    </Link>
  )
}

export default BarraPedido