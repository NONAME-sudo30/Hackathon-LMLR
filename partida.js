// partida.js · clase Partida y funciones de apoyo
// ERROR 12 y 13: aquí faltaban la clase Partida y las funciones de cookies de partidas.
// (El banco de preguntas ahora está en preguntas.js)

class Partida {
  constructor(nombre, puntos, total, fecha, segundos) {
    this.nombre = nombre;
    this.puntos = puntos;
    this.total = total;
    this.fecha = fecha;
    this.segundos = segundos;
  }

  // función nueva: porcentaje de aciertos
  porcentaje() {
    return Math.round((this.puntos / this.total) * 100);
  }

  // función nueva: texto resumen para la lista
  resumen() {
    return this.nombre + ": " + this.puntos + "/" + this.total +
      " (" + this.porcentaje() + " %) en " + this.segundos + " s";
  }
}

// lee la cookie y convierte cada objeto normal en una Partida con sus métodos
function cargarPartidas() {
  const datos = leerCookie("partidas", []);
  return datos.map(d => new Partida(d.nombre, d.puntos, d.total, d.fecha, d.segundos));
}

// guarda una partida nueva en la cookie (me quedo solo con las 10 últimas)
function guardarPartida(partida) {
  const partidas = cargarPartidas();
  partidas.push(partida);
  guardarCookie("partidas", partidas.slice(-10), 30);
}

// media de puntos de todas las partidas
function mediaPuntos(partidas) {
  const suma = partidas.reduce((acc, p) => acc + p.puntos, 0);
  return suma / partidas.length;
}

// función nueva: fecha ISO a formato español
function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-ES");
}


// función nueva: borra solo las partidas y deja el usuario
function reiniciarPartidas() {
  borrarCookie("partidas");
}