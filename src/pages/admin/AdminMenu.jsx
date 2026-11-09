import { useState } from 'react'
import Categorias from '../../components/admin/Categorias.jsx'
import CostoEnvio from '../../components/admin/CostoEnvio.jsx'
import Platos from '../../components/admin/Platos.jsx'
import './AdminMenu.css'

function AdminMenu() {
  // Cuando algo cambia en una sección, las demás se vuelven a cargar
  const [version, setVersion] = useState(0)
  const alCambiar = () => setVersion((v) => v + 1)

  return (
    <>
      <h1 className="admin__saludo">Menú</h1>

      <div className="admin-menu">
        <Platos version={version} alCambiar={alCambiar} />
        <Categorias version={version} alCambiar={alCambiar} />
        <CostoEnvio />
      </div>
    </>
  )
}

export default AdminMenu