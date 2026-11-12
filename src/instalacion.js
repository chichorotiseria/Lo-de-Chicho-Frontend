// Guarda el aviso de instalación del navegador apenas llega,
// aunque todavía no haya ningún componente en pantalla
let aviso = null
const suscriptores = new Set()
const notificar = () => suscriptores.forEach((funcion) => funcion())

window.addEventListener('beforeinstallprompt', (evento) => {
  // Evita el cartel automático: la instalación la dispara nuestro botón
  evento.preventDefault()
  aviso = evento
  notificar()
})

window.addEventListener('appinstalled', () => {
  aviso = null
  notificar()
})

export const suscribirse = (funcion) => {
  suscriptores.add(funcion)
  return () => suscriptores.delete(funcion)
}

export const obtenerAviso = () => aviso

export async function instalar() {
  if (!aviso) return
  const guardado = aviso
  aviso = null
  notificar()
  guardado.prompt()
  await guardado.userChoice
}
