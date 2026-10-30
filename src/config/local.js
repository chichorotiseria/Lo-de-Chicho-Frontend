// Datos del local. Los que dicen "a confirmar" los tiene que dar el dueño.
export const LOCAL = {
  nombre: 'Lo de Chicho',
  slogan: 'Mirá el menú y pedí online para retirar o con delivery.',

  whatsapp: '5493772586623',
  whatsappVisible: '3772 586623',

  direccion: 'Dirección a confirmar, Alvear, Corrientes',

  horarios: [
    { dias: 'Lunes a viernes', horas: 'A confirmar' },
    { dias: 'Sábados y domingos', horas: 'A confirmar' },
  ],

  // Las redes sin url no se muestran
  redes: [
    { nombre: 'Instagram', url: '' },
    { nombre: 'Facebook', url: '' },
  ],

  // Un texto por párrafo
  historia: [
    'Acá va la historia del local.',
    'Se pueden agregar tantos párrafos como se quiera.',
  ],

  // Reemplazar src por la ruta de la foto cuando el dueño las entregue
  galeria: [
    { src: null, alt: 'Foto del local' },
    { src: null, alt: 'Foto de un plato' },
    { src: null, alt: 'Foto de un plato' },
    { src: null, alt: 'Foto de un plato' },
    { src: null, alt: 'Foto de un plato' },
    { src: null, alt: 'Foto de un plato' },
  ],
}

export const enlaceWhatsApp = (mensaje = '') =>
  `https://wa.me/${LOCAL.whatsapp}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`

export const enlaceMapa = () =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LOCAL.direccion)}`