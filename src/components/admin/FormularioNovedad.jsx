import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { descartarSubida } from './descartarSubida.js'
import SelectorFoto from './SelectorFoto.jsx'

const TIPOS = [
  { valor: 'oferta', texto: 'Oferta' },
  { valor: 'combo', texto: 'Combo' },
  { valor: 'plato_del_dia', texto: 'Plato del día' },
]

// inicial: { id, tipo, titulo, descripcion, imagen_url, imagen_id } o null si es nueva
function FormularioNovedad({ inicial, guardando, alGuardar, alCancelar }) {
  const { pedir } = useAuth()

  const idGuardado = inicial?.imagen_id ?? null

  const [tipo, setTipo] = useState(inicial?.tipo ?? 'oferta')
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [imagen, setImagen] = useState(
    inicial?.imagen_url ? { url: inicial.imagen_url, id: inicial.imagen_id } : null,
  )
  const [error, setError] = useState('')

  const enviar = (evento) => {
    evento.preventDefault()

    if (!titulo.trim()) {
      setError('Escribí un título.')
      return
    }

    setError('')
    alGuardar({
      tipo,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      imagen_url: imagen ? imagen.url : null,
      imagen_id: imagen ? imagen.id : null,
    })
  }

  const cancelar = async () => {
    // Si se subió una foto nueva y no se guardó, se descarta
    if (imagen && imagen.id !== idGuardado) {
      await descartarSubida(pedir, imagen.id)
    }
    alCancelar()
  }

  return (
    <form className="admin-tarjeta formulario-novedad" onSubmit={enviar} noValidate>
      <h2>{inicial ? 'Editar novedad' : 'Nueva novedad'}</h2>

      <div className="admin-campo">
        <label htmlFor="tipo">Tipo</label>
        <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-campo">
        <label htmlFor="titulo">Título</label>
        <input id="titulo" type="text" maxLength="120" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </div>

      <div className="admin-campo">
        <label htmlFor="descripcion">Descripción (opcional)</label>
        <textarea id="descripcion" rows="4" maxLength="1000" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>

      <SelectorFoto valor={imagen} idGuardado={idGuardado} carpeta="novedades" alCambiar={setImagen} />

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <div className="formulario-novedad__acciones">
        <button type="submit" className="boton boton--principal" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="admin-boton" onClick={cancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioNovedad