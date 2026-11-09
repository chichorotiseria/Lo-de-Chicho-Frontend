import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

function Categorias({ version = 0, alCambiar = () => {} }) {
  const { pedir } = useAuth()

  const [categorias, setCategorias] = useState(null)
  const [error, setError] = useState('')
  const [nueva, setNueva] = useState('')
  const [editando, setEditando] = useState(null) // { id, nombre } o null
  const [ocupado, setOcupado] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const datos = await pedir('/api/admin/categorias')
      setCategorias(datos.categorias)
    } catch (e) {
      setError(e.message)
    }
  }, [pedir])

  useEffect(() => {
    cargar()
  }, [cargar, version])

  // Hace un cambio en el servidor y vuelve a traer la lista
  const ejecutar = async (accion) => {
    setError('')
    setOcupado(true)

    try {
      await accion()
      await cargar()
      alCambiar()
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setOcupado(false)
    }
  }

  const agregar = async (evento) => {
    evento.preventDefault()

    const nombre = nueva.trim()
    if (!nombre) {
      setError('Escribí el nombre de la categoría.')
      return
    }

    const ok = await ejecutar(() =>
      pedir('/api/admin/categorias', { metodo: 'POST', cuerpo: { nombre } }),
    )
    if (ok) setNueva('')
  }

  const guardarNombre = async (evento) => {
    evento.preventDefault()

    const nombre = editando.nombre.trim()
    if (!nombre) {
      setError('El nombre no puede quedar vacío.')
      return
    }

    const ok = await ejecutar(() =>
      pedir(`/api/admin/categorias/${editando.id}`, {
        metodo: 'PUT',
        cuerpo: { nombre },
      }),
    )
    if (ok) setEditando(null)
  }

  const mover = (categoria, direccion) =>
    ejecutar(() =>
      pedir(`/api/admin/categorias/${categoria.id}/mover`, {
        metodo: 'PUT',
        cuerpo: { direccion },
      }),
    )

  const borrar = async (categoria) => {
    if (!window.confirm(`¿Borrar la categoría "${categoria.nombre}"?`)) return

    await ejecutar(() =>
      pedir(`/api/admin/categorias/${categoria.id}`, { metodo: 'DELETE' }),
    )
  }

  return (
    <section className="admin-tarjeta">
      <h2>Categorías</h2>

      <p className="admin-tarjeta__ayuda">Se muestran en el menú en este orden. Usá las flechas para subirlas o bajarlas.</p>

      {!categorias && !error && <p>Cargando...</p>}

      {categorias && categorias.length === 0 && (
        <p>Todavía no hay categorías. Agregá la primera acá abajo.</p>
      )}

      {categorias && categorias.length > 0 && (
        <ul className="categorias">
          {categorias.map((categoria, i) => (
            <li className="categoria" key={categoria.id}>
              {editando?.id === categoria.id ? (
                <form className="categoria__edicion" onSubmit={guardarNombre}>
                  <input aria-label="Nombre de la categoría" value={editando.nombre} maxLength="80" autoFocus onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} />
                  <button type="submit" className="admin-boton" disabled={ocupado}>
                    Guardar
                  </button>
                  <button type="button" className="admin-boton admin-boton--texto" onClick={() => setEditando(null)}>
                    Cancelar
                  </button>
                </form>
              ) : (
                <>
                  <div className="categoria__nombre">
                    <strong>{categoria.nombre}</strong>
                    <span>
                      {categoria.cantidad_platos}{' '}
                      {categoria.cantidad_platos === 1 ? 'plato' : 'platos'}
                    </span>
                  </div>

                  <div className="categoria__acciones">
                    <button type="button" className="admin-boton admin-boton--chico" aria-label={`Subir ${categoria.nombre}`} onClick={() => mover(categoria, 'arriba')} disabled={ocupado || i === 0}>
                      ↑
                    </button>
                    <button type="button" className="admin-boton admin-boton--chico" aria-label={`Bajar ${categoria.nombre}`} onClick={() => mover(categoria, 'abajo')} disabled={ocupado || i === categorias.length - 1}>
                      ↓
                    </button>
                    <button type="button" className="admin-boton" onClick={() => setEditando({ id: categoria.id, nombre: categoria.nombre })} disabled={ocupado}>
                      Renombrar
                    </button>
                    <button type="button" className="admin-boton admin-boton--peligro" onClick={() => borrar(categoria)} disabled={ocupado}>
                      Borrar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <form className="categoria-nueva" onSubmit={agregar} noValidate>
        <input aria-label="Nombre de la nueva categoría" placeholder="Nueva categoría (por ejemplo: Postres)" value={nueva} maxLength="80" onChange={(e) => setNueva(e.target.value)} />
        <button type="submit" className="admin-boton" disabled={ocupado}>
          Agregar
        </button>
      </form>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}

export default Categorias