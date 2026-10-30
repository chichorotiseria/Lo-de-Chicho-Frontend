// En desarrollo se usa el proxy de Vite (ruta relativa).
// En producción se define VITE_API_URL con la dirección del backend.
export const API_URL = import.meta.env.VITE_API_URL ?? ''

export async function obtener(ruta) {
  const respuesta = await fetch(`${API_URL}${ruta}`)

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} al pedir ${ruta}`)
  }

  return respuesta.json()
}

// Envía el pedido. Va como text/plain (y no application/json) para que el
// navegador no haga una consulta previa de CORS, y con keepalive para que el
// pedido salga aunque la página se cierre al abrir WhatsApp.
export function enviarPedido(pedido) {
  return fetch(`${API_URL}/api/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(pedido),
    keepalive: true,
  })
}