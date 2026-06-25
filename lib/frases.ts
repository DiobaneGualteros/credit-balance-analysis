export const FRASES_JUBILACION = [
  'Gracias por tantos años de dedicación, ejemplo y liderazgo. Tu huella queda en cada uno de nosotros.',
  'Hoy cierras un capítulo lleno de esfuerzo y abres uno nuevo lleno de descanso y alegría. ¡Te lo mereces!',
  'No es un adiós, es un "hasta siempre". Gracias por todo lo que nos enseñaste.',
  'Que esta nueva etapa esté llena de viajes, tiempo en familia y todo lo que siempre quisiste hacer.',
  'Trabajar a tu lado fue un privilegio. Llévate contigo nuestro cariño y gratitud.',
  'Tu jubilación es el premio a una vida de trabajo bien hecho. Disfrútala al máximo.',
  'Gracias por ser más que un jefe: un guía y un ejemplo a seguir. Te vamos a extrañar.',
  'Que cada día de esta nueva etapa te traiga la paz y la felicidad que tanto sembraste en los demás.',
  'Los buenos líderes dejan recuerdos imborrables. Gracias por dejarnos tantos.',
  'Empieza la mejor aventura: vivir a tu ritmo. ¡Felicidades por tu jubilación!',
  'Tu legado no se jubila; sigue inspirándonos cada día. Gracias por todo.',
  'Deseo que esta nueva etapa esté llena de salud, sonrisas y momentos inolvidables.',
]

export function fraseAleatoria(excepto?: string) {
  const opciones = excepto
    ? FRASES_JUBILACION.filter((f) => f !== excepto)
    : FRASES_JUBILACION
  return opciones[Math.floor(Math.random() * opciones.length)]
}
