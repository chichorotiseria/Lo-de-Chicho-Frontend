const ZONA = 'America/Argentina/Buenos_Aires'

const formatoMostrar = new Intl.DateTimeFormat('es-AR', {
  timeZone: ZONA,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

// "2026-11-03T19:05:00.000Z" -> "03/11/2026, 16:05"
export const formatearFechaHora = (iso) => formatoMostrar.format(new Date(iso))

const formatoPartes = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

// El momento actual en hora argentina, con el formato de un campo de fecha y hora:
// "2026-11-05T15:30"
export function ahoraArgentina() {
  const valores = Object.fromEntries(
    formatoPartes.formatToParts(new Date()).map((parte) => [parte.type, parte.value]),
  )

  return `${valores.year}-${valores.month}-${valores.day}T${valores.hour}:${valores.minute}`
}

// "2026-11-05T15:30" (hora argentina) -> "2026-11-05T18:30:00.000Z"
// Argentina no cambia la hora en verano, así que siempre es UTC-3
export const aIsoDesdeArgentina = (valor) =>
  new Date(`${valor}:00-03:00`).toISOString()