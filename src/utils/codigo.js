const CARACTERES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generarCodigo(largo = 6) {
  const bytes = new Uint8Array(largo)
  crypto.getRandomValues(bytes)

  return Array.from(bytes, (byte) => CARACTERES[byte % CARACTERES.length]).join('')
}