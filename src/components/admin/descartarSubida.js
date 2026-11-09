// Borra de Cloudinary una foto que se subió pero no se llegó a guardar.
// Si falla no pasa nada grave: solo queda una foto sin usar.
export async function descartarSubida(pedir, id) {
  try {
    await pedir('/api/admin/imagenes', { metodo: 'DELETE', cuerpo: { id } })
  } catch {
    // se ignora
  }
}