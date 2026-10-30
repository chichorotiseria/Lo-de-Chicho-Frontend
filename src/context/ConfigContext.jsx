import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { obtener } from '../api.js'

const ConfigContext = createContext({ config: null, refrescar: () => {} })

// Trae el estado del local (abierto o cerrado) y el costo de envío
export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null)

  const refrescar = useCallback(() => {
    obtener('/api/configuracion')
      .then(setConfig)
      .catch(() => setConfig(null))
  }, [])

  useEffect(() => {
    refrescar()
  }, [refrescar])

  return (
    <ConfigContext.Provider value={{ config, refrescar }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => useContext(ConfigContext)