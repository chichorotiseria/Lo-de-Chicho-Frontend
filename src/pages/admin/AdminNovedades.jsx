import { useCallback, useEffect, useState } from 'react'
import FormularioNovedad from '../../components/admin/FormularioNovedad.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import './AdminNovedades.css'

const TIPOS = {
  oferta: 'Oferta',
  combo: 'Combo',
  plato_del_dia: 'Plato del día',
}

function AdminNovedades() {
  const { pedir } = useAuth()

  const [novedades, setNovedades] = useState(null)
  const [error, setError] = useState('')
  // null = sin formulario; { id: null } = nueva; { id: 3, ... } = editando
  const [formulario, setFormulario] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const datos = await pedir('/api/admin/novedades')
      setNovedades(datos.novedades)
    } catch (e) {
      setError(e.message)
    }
  }, [pedir])

  useEffect(() => {
    cargar()
  }, [cargar])

  const guardar = async (datos) => {
    setError('')
    setGuardando(true)

    try {
      if (formulario.id) {
        await pedir(`/api/admin/novedades/${formulario.id}`, {
          metodo: 'PUT',
          cuerpo: datos,
        })
      } else {
        await pedir('/api/admin/novedades', { metodo: 'POST', cuerpo: datos })
      }
      setFormulario(null)
      await cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const borrar = async (novedad) => {
    if (!window.confirm(`¿Borrar la novedad "${novedad.titulo}"? No se puede deshacer.`)) {
      return
    }

    setError('')
    try {
      await pedir(`/api/admin/novedades/${novedad.id}`, { metodo: 'DELETE' })
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  const borrarTodas = async () => {
    const cantidad = novedades.length
    const aviso = `Se van a borrar las ${cantidad} novedades, con sus fotos. No se puede deshacer. ¿Querés continuar?`
    if (!window.confirm(aviso)) return

    setError('')
    try {
      await pedir('/api/admin/novedades?todas=si', { metodo: 'DELETE' })
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <>
      <div className="admin-encabezado">
        <h1 className="admin__saludo">Novedades</h1>

        {!formulario && (
          <div className="admin-encabezado__acciones">
            <button type="button" className="boton boton--principal" onClick={() => setFormulario({ id: null })} >
              + Nueva novedad
            </button>
            {novedades && novedades.length > 0 && (
              <button type="button" className="admin-boton admin-boton--peligro" onClick={borrarTodas}>
                Borrar todas
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {formulario && (
        <FormularioNovedad key={formulario.id ?? 'nueva'} inicial={formulario.id ? formulario : null} guardando={guardando} alGuardar={guardar} alCancelar={() => setFormulario(null)} />
      )}

      {!novedades && !error && <p>Cargando...</p>}

      {novedades && novedades.length === 0 && !formulario && (
        <p>Todavía no hay novedades. Creá la primera con el botón de arriba.</p>
      )}

      {novedades && novedades.length > 0 && (
        <ul className="lista-novedades">
          {novedades.map((novedad) => (
            <li className="item-novedad" key={novedad.id}>
              {novedad.imagen_url ? (
                <img src={novedad.imagen_url} alt="" className="item-novedad__foto" />
              ) : (
                <div className="item-novedad__foto item-novedad__foto--vacia">Sin foto</div>
              )}

              <div className="item-novedad__texto">
                <span className={`tipo tipo--${novedad.tipo}`}>{TIPOS[novedad.tipo]}</span>
                <h3>{novedad.titulo}</h3>
                {novedad.descripcion && <p>{novedad.descripcion}</p>}
              </div>

              <div className="item-novedad__acciones">
                <button type="button" className="admin-boton" onClick={() => setFormulario(novedad)} disabled={Boolean(formulario)} >
                  Editar
                </button>
                <button type="button" className="admin-boton admin-boton--peligro" onClick={() => borrar(novedad)}>
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default AdminNovedades