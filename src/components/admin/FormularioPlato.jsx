import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { descartarSubida } from './descartarSubida.js'
import SelectorFoto from './SelectorFoto.jsx'

const PRECIO_MAXIMO = 1000000
const MAX_OPCIONES = 10

// Contador para darle a cada fila de opciones una clave que no cambie
let contadorClaves = 0
const nuevaClave = () => ++contadorClaves

const opcionVacia = () => ({ clave: nuevaClave(), id: null, nombre: '', precio: '' })

// Solo números enteros, sin puntos, entre 1 y 1.000.000
const precioValido = (texto) =>
  /^\d{1,7}$/.test(texto.trim()) &&
  Number(texto) >= 1 &&
  Number(texto) <= PRECIO_MAXIMO

// inicial: el plato que se edita (con sus variantes) o null si es nuevo
function FormularioPlato({
  inicial,
  categorias,
  categoriaInicial,
  guardando,
  alGuardar,
  alCancelar,
}) {
  const { pedir } = useAuth()

  const idGuardado = inicial?.imagen_id ?? null

  const [categoriaId, setCategoriaId] = useState(
    String(inicial?.categoria_id ?? categoriaInicial ?? categorias[0]?.id ?? ''),
  )
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [disponible, setDisponible] = useState(inicial?.disponible ?? true)
  const [conOpciones, setConOpciones] = useState((inicial?.variantes.length ?? 0) > 0)
  const [precio, setPrecio] = useState(
    inicial?.precio != null ? String(inicial.precio) : '',
  )
  const [opciones, setOpciones] = useState(() =>
    inicial && inicial.variantes.length > 0
      ? inicial.variantes.map((variante) => ({
          clave: nuevaClave(),
          id: variante.id,
          nombre: variante.nombre,
          precio: String(variante.precio),
        }))
      : [],
  )
  const [imagen, setImagen] = useState(
    inicial?.imagen_url ? { url: inicial.imagen_url, id: inicial.imagen_id } : null,
  )
  const [error, setError] = useState('')

  const alternarOpciones = (evento) => {
    const activar = evento.target.checked
    setConOpciones(activar)

    // Al activarlo por primera vez se ofrecen dos filas para completar
    if (activar && opciones.length === 0) {
      setOpciones([opcionVacia(), opcionVacia()])
    }
  }

  const cambiarOpcion = (clave, campo, valor) =>
    setOpciones((lista) =>
      lista.map((opcion) =>
        opcion.clave === clave ? { ...opcion, [campo]: valor } : opcion,
      ),
    )

  const agregarOpcion = () => setOpciones((lista) => [...lista, opcionVacia()])

  const quitarOpcion = (clave) =>
    setOpciones((lista) => lista.filter((opcion) => opcion.clave !== clave))

  const enviar = (evento) => {
    evento.preventDefault()

    if (!nombre.trim()) {
      setError('Escribí el nombre del plato.')
      return
    }

    if (!categoriaId) {
      setError('Elegí una categoría.')
      return
    }

    if (conOpciones) {
      if (opciones.length === 0) {
        setError('Agregá al menos una opción.')
        return
      }

      for (const opcion of opciones) {
        if (!opcion.nombre.trim()) {
          setError('Cada opción necesita un nombre (por ejemplo: Media docena).')
          return
        }
        if (!precioValido(opcion.precio)) {
          setError(`Revisá el precio de "${opcion.nombre.trim()}": solo números enteros, sin puntos.`)
          return
        }
      }
    } else if (!precioValido(precio)) {
      setError('Escribí el precio con solo números, sin puntos (por ejemplo 6000).')
      return
    }

    setError('')
    alGuardar({
      categoria_id: Number(categoriaId),
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      disponible,
      precio: conOpciones ? null : Number(precio),
      variantes: conOpciones
        ? opciones.map((opcion) => ({
            id: opcion.id,
            nombre: opcion.nombre.trim(),
            precio: Number(opcion.precio),
          }))
        : [],
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
    <form className="admin-tarjeta formulario-plato" onSubmit={enviar} noValidate>
      <h2>{inicial ? 'Editar plato' : 'Nuevo plato'}</h2>

      <div className="admin-campo">
        <label htmlFor="plato-categoria">Categoría</label>
        <select id="plato-categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-campo">
        <label htmlFor="plato-nombre">Nombre</label>
        <input id="plato-nombre" type="text" maxLength="120" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>

      <div className="admin-campo">
        <label htmlFor="plato-descripcion">Descripción (opcional)</label>
        <textarea id="plato-descripcion" rows="3" maxLength="500" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>

      <fieldset>
        <legend>Precio</legend>

        <label className="formulario-plato__casilla">
          <input type="checkbox" checked={conOpciones} onChange={alternarOpciones} />
          <span>Tiene varias opciones con precio distinto (por ejemplo, media docena y docena)</span>
        </label>

        {!conOpciones ? (
          <div className="admin-campo">
            <label htmlFor="plato-precio">Precio</label>
            <div className="precio-entrada">
              <span>$</span>
              <input id="plato-precio" type="text" inputMode="numeric" maxLength="7" value={precio} onChange={(e) => setPrecio(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="opciones-plato">
            {opciones.map((opcion, i) => (
              <div className="opcion-plato" key={opcion.clave}>
                <input aria-label={`Nombre de la opción ${i + 1}`} placeholder="Ej: Media docena" maxLength="80" value={opcion.nombre} onChange={(e) => cambiarOpcion(opcion.clave, 'nombre', e.target.value)} />
                <span>$</span>
                <input aria-label={`Precio de la opción ${i + 1}`} inputMode="numeric" placeholder="5000" maxLength="7" value={opcion.precio} onChange={(e) => cambiarOpcion(opcion.clave, 'precio', e.target.value)} />
                <button type="button" className="admin-boton admin-boton--texto" onClick={() => quitarOpcion(opcion.clave)}>
                  Quitar
                </button>
              </div>
            ))}

            <button type="button" className="admin-boton" onClick={agregarOpcion} disabled={opciones.length >= MAX_OPCIONES}>
              + Agregar opción
            </button>
          </div>
        )}
      </fieldset>

      <label className="formulario-plato__casilla">
        <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)} />
        <span>Disponible (si lo destildás, se ve en gris y no se puede pedir)</span>
      </label>

      <SelectorFoto valor={imagen} idGuardado={idGuardado} carpeta="platos" alCambiar={setImagen} />

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <div className="formulario-plato__acciones">
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

export default FormularioPlato