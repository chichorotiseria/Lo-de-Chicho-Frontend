import { API_URL } from './api.js'

const CLAVE_TOKEN = 'lo-de-chicho:token'

export function leerToken() {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token) {
  try {
    localStorage.setItem(CLAVE_TOKEN, token)
  } catch {
    // sin almacenamiento, la sesión dura mientras la página siga abierta
  }
}

export function borrarToken() {
  try {
    localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // nada para hacer
  }
}

// Error de la API, con el código HTTP (401, 400, 409...) y un mensaje legible
export class ErrorApi extends Error {
  constructor(estado, mensaje) {
    super(mensaje)
    this.estado = estado
  }
}

// Pedido a la API de administración: agrega la sesión (token) a la consulta
export async function pedirAdmin(ruta, { metodo = 'GET', cuerpo } = {}) {
  const token = leerToken()

  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: {
        ...(cuerpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor.')
  }

  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    // respuesta sin contenido
  }

  if (!respuesta.ok) {
    throw new ErrorApi(
      respuesta.status,
      datos?.error ?? 'Algo salió mal. Probá de nuevo.',
    )
  }

  return datos
}