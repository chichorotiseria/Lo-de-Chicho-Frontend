import { createContext, useContext, useEffect, useReducer } from 'react'

const CLAVE = 'lo-de-chicho:carrito'
const MAX_CANTIDAD = 50
const VACIO = { items: [], nota: '' }

// El carrito vive en sessionStorage: sobrevive a recargar la página,
// pero se vacía al cerrar la pestaña
function cargarGuardado() {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE))
    if (guardado && Array.isArray(guardado.items)) {
      return { items: guardado.items, nota: guardado.nota ?? '' }
    }
  } catch {
    // si no se puede leer, se empieza con el carrito vacío
  }
  return VACIO
}

function reducer(estado, accion) {
  switch (accion.tipo) {
    case 'agregar': {
      const existe = estado.items.some((i) => i.clave === accion.item.clave)
      const items = existe
        ? estado.items.map((i) =>
            i.clave === accion.item.clave
              ? { ...i, cantidad: Math.min(i.cantidad + 1, MAX_CANTIDAD) }
              : i,
          )
        : [...estado.items, { ...accion.item, cantidad: 1 }]
      return { ...estado, items }
    }

    case 'cantidad':
      return {
        ...estado,
        items: estado.items
          .map((i) =>
            i.clave === accion.clave
              ? { ...i, cantidad: Math.min(accion.cantidad, MAX_CANTIDAD) }
              : i,
          )
          .filter((i) => i.cantidad >= 1),
      }

    case 'quitar':
      return {
        ...estado,
        items: estado.items.filter((i) => i.clave !== accion.clave),
      }

    case 'nota':
      return { ...estado, nota: accion.texto }

    case 'vaciar':
      return VACIO

    default:
      return estado
  }
}

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [estado, dispatch] = useReducer(reducer, undefined, cargarGuardado)

  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      // sin almacenamiento disponible, el carrito funciona igual mientras la página esté abierta
    }
  }, [estado])

  const cantidadTotal = estado.items.reduce((suma, i) => suma + i.cantidad, 0)
  const subtotal = estado.items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)

  const valor = {
    items: estado.items,
    nota: estado.nota,
    cantidadTotal,
    subtotal,

    agregar: (plato, variante = null) =>
      dispatch({
        tipo: 'agregar',
        item: {
          clave: `${plato.id}-${variante ? variante.id : 0}`,
          platoId: plato.id,
          varianteId: variante ? variante.id : null,
          nombre: plato.nombre,
          varianteNombre: variante ? variante.nombre : null,
          precio: variante ? variante.precio : plato.precio,
        },
      }),

    cambiarCantidad: (clave, cantidad) =>
      dispatch({ tipo: 'cantidad', clave, cantidad }),

    quitar: (clave) => dispatch({ tipo: 'quitar', clave }),

    cambiarNota: (texto) => dispatch({ tipo: 'nota', texto }),

    vaciar: () => {
      dispatch({ tipo: 'vaciar' })
      // se borra enseguida, porque después se abre WhatsApp y la página se va
      try {
        sessionStorage.removeItem(CLAVE)
      } catch {
        // nada para hacer
      }
    },
  }

  return (
    <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
  )
}

export const useCarrito = () => useContext(CarritoContext)