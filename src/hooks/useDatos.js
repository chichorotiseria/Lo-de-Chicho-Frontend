import { useEffect, useState } from 'react'
import { obtener } from '../api.js'

// Pide datos a la API y devuelve el estado de la carga
export function useDatos(ruta) {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let cancelado = false

    obtener(ruta)
      .then((respuesta) => !cancelado && setDatos(respuesta))
      .catch(() => !cancelado && setError(true))

    return () => {
      cancelado = true
    }
  }, [ruta, intento])

  const reintentar = () => {
    setError(false)
    setDatos(null)
    setIntento((n) => n + 1)
  }

  return { datos, error, cargando: !datos && !error, reintentar }
}