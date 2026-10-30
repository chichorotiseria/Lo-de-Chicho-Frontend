import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Al cambiar de página, vuelve arriba de todo
function ScrollAlInicio() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default ScrollAlInicio