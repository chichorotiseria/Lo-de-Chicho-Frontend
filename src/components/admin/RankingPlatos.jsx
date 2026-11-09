// datos: [{ nombre: 'Hamburguesa completa', unidades: 12 }, ...]
function RankingPlatos({ datos }) {
  const maximo = Math.max(1, ...datos.map((plato) => plato.unidades))

  return (
    <ol className="ranking">
      {datos.map((plato, i) => (
        <li className="ranking__fila" key={plato.nombre}>
          <span className="ranking__puesto">{i + 1}</span>

          <div className="ranking__contenido">
            <div className="ranking__linea">
              <span className="ranking__nombre">{plato.nombre}</span>
              <span className="ranking__unidades">{plato.unidades} {plato.unidades === 1 ? 'unidad' : 'unidades'}</span>
            </div>

            <div className="ranking__pista">
              <div className="ranking__barra" style={{ width: `${(plato.unidades / maximo) * 100}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default RankingPlatos