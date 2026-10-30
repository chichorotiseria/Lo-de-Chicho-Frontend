import './NovedadCard.css'

const TIPOS = {
  oferta: 'Oferta',
  combo: 'Combo',
  plato_del_dia: 'Plato del día',
}

function NovedadCard({ novedad }) {
  return (
    <article className="novedad">
      {novedad.imagen_url && (
        <img
          className="novedad__imagen"
          src={novedad.imagen_url}
          alt={novedad.titulo}
          loading="lazy"
        />
      )}

      <div className="novedad__cuerpo">
        <span className={`novedad__tipo novedad__tipo--${novedad.tipo}`}>
          {TIPOS[novedad.tipo] ?? novedad.tipo}
        </span>
        <h3>{novedad.titulo}</h3>
        {novedad.descripcion && <p>{novedad.descripcion}</p>}
      </div>
    </article>
  )
}

export default NovedadCard