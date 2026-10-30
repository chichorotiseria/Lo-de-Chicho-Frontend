const formatoPesos = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,  
})

// 6000 -> "$ 6.000"
export const formatearPrecio = (valor) => formatoPesos.format(valor)