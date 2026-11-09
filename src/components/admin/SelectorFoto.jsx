import { useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { descartarSubida } from './descartarSubida.js'
import './SelectorFoto.css'

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 10

// valor: la foto elegida ({ url, id }) o null
// idGuardado: el id de la foto que ya está guardada en la base (si la hay)
// carpeta: 'novedades' o 'platos'
function SelectorFoto({ valor, idGuardado = null, carpeta, alCambiar }) {
  const { pedir } = useAuth()
  const entrada = useRef(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  // Una foto "sin guardar" es una que se subió en este formulario
  const sinGuardar = valor && valor.id !== idGuardado

  const elegir = async (evento) => {
    const archivo = evento.target.files[0]
    evento.target.value = '' // permite volver a elegir el mismo archivo
    if (!archivo) return

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      setError('Elegí una foto en formato JPG, PNG o WebP.')
      return
    }
    if (archivo.size > MAX_MB * 1024 * 1024) {
      setError(`La foto pesa demasiado: el máximo es ${MAX_MB} MB.`)
      return
    }

    setError('')
    setSubiendo(true)

    try {
      // 1) El servidor da una firma para poder subir a Cloudinary
      const firma = await pedir(`/api/admin/imagenes/firma?carpeta=${carpeta}`)

      // 2) El navegador sube la foto directo a Cloudinary
      const datos = new FormData()
      datos.append('file', archivo)
      datos.append('api_key', firma.api_key)
      datos.append('timestamp', firma.timestamp)
      datos.append('signature', firma.signature)
      datos.append('folder', firma.folder)
      datos.append('allowed_formats', firma.allowed_formats)
      datos.append('transformation', firma.transformation)

      const respuesta = await fetch(
        `https://api.cloudinary.com/v1_1/${firma.cloud_name}/image/upload`,
        { method: 'POST', body: datos },
      )
      const resultado = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(resultado.error?.message ?? 'No se pudo subir la foto.')
      }

      // Si se reemplaza una foto que ya se había subido sin guardar, se descarta
      if (sinGuardar) await descartarSubida(pedir, valor.id)

      alCambiar({ url: resultado.secure_url, id: resultado.public_id })
    } catch (e) {
      setError(e.message)
    } finally {
      setSubiendo(false)
    }
  }

  const quitar = async () => {
    if (sinGuardar) await descartarSubida(pedir, valor.id)
    alCambiar(null)
  }

  return (
    <div className="selector-foto">
      <span className="selector-foto__titulo">Foto (opcional)</span>

      <input ref={entrada} type="file" accept="image/jpeg,image/png,image/webp" className="selector-foto__entrada" onChange={elegir} aria-label="Elegir una foto" />

      {valor ? (
        <div className="selector-foto__vista">
          <img src={valor.url} alt="Foto elegida" />
          <div className="selector-foto__botones">
            <button type="button" className="admin-boton" onClick={() => entrada.current.click()} disabled={subiendo}>
              {subiendo ? 'Subiendo...' : 'Cambiar foto'}
            </button>
            <button type="button" className="admin-boton admin-boton--texto" onClick={quitar} disabled={subiendo}>
              Quitar foto
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="selector-foto__vacio" onClick={() => entrada.current.click()} disabled={subiendo}>
          {subiendo ? 'Subiendo...' : '+ Elegir una foto'}
        </button>
      )}

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default SelectorFoto