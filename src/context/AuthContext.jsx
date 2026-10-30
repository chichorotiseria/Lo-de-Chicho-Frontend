import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ErrorApi, borrarToken, guardarToken, leerToken, pedirAdmin } from '../apiAdmin.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  // Si hay una sesión guardada, hay que comprobarla antes de mostrar nada
  const [cargando, setCargando] = useState(() => Boolean(leerToken()))

  useEffect(() => {
    if (!leerToken()) return

    let cancelado = false

    pedirAdmin('/api/auth/yo')
      .then((datos) => !cancelado && setUsuario(datos.usuario))
      .catch((error) => {
        // La sesión solo se borra si el servidor la rechazó
        if (error.estado === 401) borrarToken()
      })
      .finally(() => !cancelado && setCargando(false))

    return () => {
      cancelado = true
    }
  }, [])

  const cerrarSesion = useCallback(() => {
    borrarToken()
    setUsuario(null)
  }, [])

  const iniciarSesion = async (nombre, password) => {
    const datos = await pedirAdmin('/api/auth/login', {
      metodo: 'POST',
      cuerpo: { usuario: nombre, password },
    })
    guardarToken(datos.token)
    setUsuario(datos.usuario)
  }

  // Igual que pedirAdmin, pero si la sesión venció cierra la sesión
  const pedir = useCallback(
    async (ruta, opciones) => {
      try {
        return await pedirAdmin(ruta, opciones)
      } catch (error) {
        if (error instanceof ErrorApi && error.estado === 401) cerrarSesion()
        throw error
      }
    },
    [cerrarSesion],
  )

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, pedir }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)