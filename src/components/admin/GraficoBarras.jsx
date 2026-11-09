const conDiaSemana = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

const soloNumero = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  timeZone: 'UTC',
})

// datos: [{ dia: '2026-11-05', pedidos: 3 }, ...]
function GraficoBarras({ datos }) {
  const maximo = Math.max(1, ...datos.map((punto) => punto.pedidos))

  // Con muchos días se muestra solo el número, para que las etiquetas entren
  const denso = datos.length > 10

  return (
    <div className={`grafico ${denso ? 'grafico--denso' : ''}`} role="img" aria-label="Gráfico de barras con la cantidad de pedidos de cada día">
      {datos.map((punto) => {
        const fecha = new Date(`${punto.dia}T00:00:00Z`)
        const proporcion = punto.pedidos / maximo

        return (
          <div className="grafico__columna" key={punto.dia}>
            <span className="grafico__valor">
              {punto.pedidos > 0 ? punto.pedidos : ''}
            </span>
            <div className={`grafico__barra ${punto.pedidos === 0 ? 'grafico__barra--vacia' : ''}`} style={{ height: `calc((100% - 3rem) * ${proporcion})` }} title={`${conDiaSemana.format(fecha)}: ${punto.pedidos}`} />
            <span className="grafico__dia">
              {denso ? soloNumero.format(fecha) : conDiaSemana.format(fecha)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default GraficoBarras