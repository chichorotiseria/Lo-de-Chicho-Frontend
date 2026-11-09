import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatearPrecio } from '../../utils/formato.js'
import FormularioPlato from './FormularioPlato.jsx'

// "Media docena $5.000 · Docena $9.500" o "$6.000"
function resumenPrecio(plato) {
  if (plato.variantes.length === 0) return formatearPrecio(plato.precio)

  return plato.variantes
    .map((variante) => `${variante.nombre} ${formatearPrecio(variante.precio)}`)
    .join(' · ')
}

// version: sube cada vez que algo del menú cambia en otra parte de la pantalla
// alCambiar: avisa a esas otras partes (por ejemplo, la cantidad de platos)
function Platos({ version, alCambiar }) {
  const { pedir } = useAuth()

  const [categorias, setCategorias] = useState(null)
  const [platos, setPlatos] = useState(null)
  const [error, setError] = useState('')
  // null = sin formulario; { plato: null, categoriaId } = nuevo; { plato } = editando
  const [formulario, setFormulario] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const [resCategorias, resPlatos] = await Promise.all([
        pedir('/api/admin/categorias'),
        pedir('/api/admin/platos'),
      ])
      setCategorias(resCategorias.categorias)
      setPlatos(resPlatos.platos)
    } catch (e) {
      setError(e.message)
    }
  }, [pedir])

  useEffect(() => {
    cargar()
  }, [cargar, version])

  const guardar = async (datos) => {
    setError('')
    setGuardando(true)

    try {
      if (formulario.plato) {
        await pedir(`/api/admin/platos/${formulario.plato.id}`, {
          metodo: 'PUT',
          cuerpo: datos,
        })
      } else {
        await pedir('/api/admin/platos', { metodo: 'POST', cuerpo: datos })
      }

      setFormulario(null)
      await cargar()
      alCambiar()
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  // El interruptor de disponibilidad: un toque y listo
  const alternar = async (plato) => {
    setError('')

    try {
      await pedir(`/api/admin/platos/${plato.id}/disponible`, {
        metodo: 'PUT',
        cuerpo: { disponible: !plato.disponible },
      })
      setPlatos((lista) =>
        lista.map((p) => (p.id === plato.id ? { ...p, disponible: !p.disponible } : p)),
      )
    } catch (e) {
      setError(e.message)
    }
  }

  const mover = async (plato, direccion) => {
    setError('')

    try {
      await pedir(`/api/admin/platos/${plato.id}/mover`, {
        metodo: 'PUT',
        cuerpo: { direccion },
      })
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  const borrar = async (plato) => {
    if (!window.confirm(`¿Borrar el plato "${plato.nombre}"? No se puede deshacer.`)) {
      return
    }

    setError('')

    try {
      await pedir(`/api/admin/platos/${plato.id}`, { metodo: 'DELETE' })
      await cargar()
      alCambiar()
    } catch (e) {
      setError(e.message)
    }
  }

  const hayFormulario = Boolean(formulario)

  return (
    <section className="admin-tarjeta">
      <h2>Platos</h2>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {formulario && (
        <FormularioPlato key={formulario.plato?.id ?? `nuevo-${formulario.categoriaId}`} inicial={formulario.plato} categorias={categorias} categoriaInicial={formulario.categoriaId} guardando={guardando} alGuardar={guardar} alCancelar={() => setFormulario(null)} />
      )}

      {(!categorias || !platos) && !error && <p>Cargando...</p>}

      {categorias && categorias.length === 0 && (
        <p>Primero creá una categoría, en la sección de más abajo.</p>
      )}

      {categorias && platos && categorias.map((categoria) => {
          const delGrupo = platos.filter((plato) => plato.categoria_id === categoria.id)

          return (
            <section className="plato-grupo" key={categoria.id}>
              <div className="plato-grupo__encabezado">
                <h3>{categoria.nombre}</h3>
                <button type="button" className="admin-boton" onClick={() => setFormulario({ plato: null, categoriaId: categoria.id })} disabled={hayFormulario}>
                  + Agregar plato
                </button>
              </div>

              {delGrupo.length === 0 ? (
                <p className="plato-grupo__vacio">
                  Todavía no hay platos en esta categoría.
                </p>
              ) : (
                <ul className="plato-lista">
                  {delGrupo.map((plato, i) => (
                    <li className={`plato-fila ${plato.disponible ? '' : 'plato-fila--agotado'}`} key={plato.id}>
                      {plato.imagen_url ? (
                        <img className="plato-fila__foto" src={plato.imagen_url} alt="" />
                      ) : (
                        <div className="plato-fila__foto" aria-hidden="true" />
                      )}

                      <div className="plato-fila__texto">
                        <strong>{plato.nombre}</strong>
                        <span className="plato-fila__precio">{resumenPrecio(plato)}</span>
                      </div>

                      <div className="plato-fila__estado">
                        <button type="button" role="switch" aria-checked={plato.disponible} aria-label={`${plato.nombre}: ${plato.disponible ? 'disponible' : 'no disponible'}`} className={`interruptor ${plato.disponible ? 'interruptor--si' : ''}`} onClick={() => alternar(plato)}>
                          <span className="interruptor__perilla" />
                        </button>
                        <span>{plato.disponible ? 'Disponible' : 'No disponible'}</span>
                      </div>

                      <div className="plato-fila__acciones">
                        <button type="button" className="admin-boton admin-boton--chico" aria-label={`Subir ${plato.nombre}`} onClick={() => mover(plato, 'arriba')} disabled={i === 0}>
                          ↑
                        </button>
                        <button type="button" className="admin-boton admin-boton--chico" aria-label={`Bajar ${plato.nombre}`} onClick={() => mover(plato, 'abajo')} disabled={i === delGrupo.length - 1}>
                          ↓
                        </button>
                        <button type="button" className="admin-boton" onClick={() => setFormulario({ plato, categoriaId: categoria.id })} disabled={hayFormulario}>
                          Editar
                        </button>
                        <button type="button" className="admin-boton admin-boton--peligro" onClick={() => borrar(plato)}>
                          Borrar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
    </section>
  )
}

export default Platos