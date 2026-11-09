import { useEffect, useState } from 'react'
import GraficoBarras from '../../components/admin/GraficoBarras.jsx'
import RankingPlatos from '../../components/admin/RankingPlatos.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatearPrecio } from '../../utils/formato.js'
import './AdminEstadisticas.css'

const PERIODOS = [
  { valor: 'hoy', texto: 'Hoy' },
  { valor: '7dias', texto: 'Últimos 7 días' },
  { valor: '30dias', texto: 'Últimos 30 días' },
  { valor: 'mes', texto: 'Este mes' },
]

function AdminEstadisticas() {
  const { pedir } = useAuth()

  const [periodo, setPeriodo] = useState('7dias')
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let cancelado = false

    pedir(`/api/admin/estadisticas?periodo=${periodo}`)
      .then((respuesta) => {
        if (cancelado) return
        setDatos(respuesta)
        setError('')
      })
      .catch((e) => !cancelado && setError(e.message))
      .finally(() => !cancelado && setCargando(false))

    return () => {
      cancelado = true
    }
  }, [pedir, periodo])

  const elegirPeriodo = (valor) => {
    setCargando(true)
    setPeriodo(valor)
  }

  return (
    <div className="estadisticas">
      <h1 className="admin__saludo">Estadísticas</h1>

      <p className="estadisticas__ayuda">Solo cuentan los pedidos confirmados. Si un pedido no se confirma en la sección Pedidos, no aparece acá.</p>

      <div className="admin-filtros" role="group" aria-label="Período">
        {PERIODOS.map((opcion) => (
          <button key={opcion.valor} type="button" className={`admin-filtro ${periodo === opcion.valor ? 'admin-filtro--activo' : ''}`} aria-pressed={periodo === opcion.valor} onClick={() => elegirPeriodo(opcion.valor)}>
            {opcion.texto}
          </button>
        ))}
      </div>

      {error && (
        <p className="admin-error" role="alert">{error}</p>
      )}

      {!datos && !error && <p>Cargando...</p>}

      {datos && (
        <div className={cargando ? 'estadisticas__contenido--cargando' : ''}>
          <div className="estadisticas__tarjetas">
            <div className="estadisticas__tarjeta">
              <span className="estadisticas__numero">{datos.pedidos}</span>
              <span>Pedidos confirmados</span>
            </div>

            <div className="estadisticas__tarjeta">
              <span className="estadisticas__numero">{formatearPrecio(datos.facturado)}</span>
              <span>Total facturado (incluye los envíos)</span>
            </div>
          </div>

          <div className="estadisticas__paneles">
            <section className="admin-tarjeta">
              <h2>Pedidos por día</h2>
              <GraficoBarras datos={datos.por_dia} />
            </section>

            <section className="admin-tarjeta">
              <h2>Platos más pedidos</h2>

              {datos.ranking.length === 0 ? (
                <p>No hay pedidos confirmados en este período.</p>
              ) : (
                <RankingPlatos datos={datos.ranking} />
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEstadisticas