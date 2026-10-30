const PAGOS = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
}

export function armarMensaje({
  codigo,
  nombre,
  tipoEntrega,
  direccion,
  items,
  nota,
  metodoPago,
}) {
  const entrega =
    tipoEntrega === 'delivery' ? `Delivery, ${direccion}` : 'Retiro en el local'

  const lineas = [
    `Hola, quiero hacer un pedido (código ${codigo})`,
    `Nombre: ${nombre}`,
    `Entrega: ${entrega}`,
    ...items.map(
      (item) =>
        `${item.cantidad} x ${item.nombre}${
          item.varianteNombre ? ` (${item.varianteNombre})` : ''
        }`,
    ),
  ]

  if (nota.trim()) {
    lineas.push(`Nota: ${nota.trim()}`)
  }

  lineas.push(`Pago: ${PAGOS[metodoPago] ?? metodoPago}`)

  return lineas.join('\n')
}