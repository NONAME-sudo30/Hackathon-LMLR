// QuizDAW · lógica de la página
let usuario = null;
let preguntas = [];
let indice = 0;
let puntos = 0;
let inicio = 0;
let respondida = false;

/* ---------- Usuario y apariencia ---------- */
function pedirNombre() {
  // ERROR 1: si le das a Cancelar, prompt() devuelve null y null.trim() da error.
  // Lo vi al cancelar el diálogo y salir el error rojo en la consola.
  // Lo arreglé poniendo || "" para que siempre haya un texto antes del trim().
  const nombre = (prompt("¿Cómo te llamas?") || "").trim();
  return nombre || "invitado";
}

function aplicarTema() {
  // ERROR 2: antes ponía document.body.class y no funciona, hay que usar className.
  // Lo vi porque el tema oscuro no se aplicaba al pulsar el botón.
  document.body.className = usuario.tema === "oscuro" ? "oscuro" : "";
}

function cambiarTema() {
  usuario.tema = usuario.tema === "oscuro" ? "claro" : "oscuro";
  guardarCookie("usuario", usuario, 30);
  aplicarTema();
}

/* ---------- Datos del navegador ---------- */
function datosDelNavegador() {
  return {
    // ERROR 3 (a): innerWidth e innerHeight son de window, no de document.
    // Lo vi porque abajo salía "undefined × undefined".
    ventana: window.innerWidth + " × " + window.innerHeight,
    idioma: navigator.language,
    // ERROR 3 (b): el título es document.title, window.title no existe.
    // Lo vi porque en "Página:" salía undefined.
    pagina: document.title,
    ruta: location.pathname
  };
}

function pintarInfo() {
  const d = datosDelNavegador();
  document.getElementById("info").textContent =
    "Ventana: " + d.ventana + " · Idioma: " + d.idioma + " · Página: " + d.pagina + " · Ruta: " + d.ruta;
}

/* ---------- Preguntas al azar ---------- */
function elegirPreguntas(todas, cuantas) {
  const disponibles = [...todas];
  const elegidas = [];
  while (elegidas.length < Math.min(cuantas, todas.length)) {
    // ERROR 4: el + 1 estaba mal. Los arrays empiezan en 0, así que
    // nunca salía la primera pregunta y a veces se pasaba del final (undefined).
    // Lo vi haciendo console.log(posicion) varias veces.
    const posicion = Math.floor(Math.random() * disponibles.length);
    elegidas.push(disponibles.splice(posicion, 1)[0]);
  }
  return elegidas;
}

/* ---------- La partida ---------- */
function mostrarSeccion(id, visible) {
  document.getElementById(id).hidden = !visible;
}

function iniciarPartida() {
  preguntas = elegirPreguntas(PREGUNTAS, 5);
  indice = 0;
  puntos = 0;
  inicio = Date.now();
  mostrarSeccion("inicio", false);
  mostrarSeccion("final", false);
  mostrarSeccion("juego", true);
  mostrarPregunta();
}

function mostrarPregunta() {
  const q = preguntas[indice];
  respondida = false;
  document.title = "QuizDAW · " + (indice + 1) + "/" + preguntas.length;
  document.getElementById("textoPregunta").textContent = (indice + 1) + "/" + preguntas.length + " · " + q.pregunta;

  const contenedor = document.getElementById("opciones");
  contenedor.innerHTML = "";
  q.opciones.forEach((texto, i) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "opcion";
    boton.textContent = texto;
    boton.dataset.i = i;
    contenedor.appendChild(boton);
  });

  document.getElementById("feedback").textContent = "";
  document.getElementById("btnSiguiente").hidden = true;
  document.getElementById("marcador").textContent = "Puntos: " + puntos;
}

function manejarOpcion(evento) {
  const dato = evento.target.dataset.i;
  if (dato === undefined || respondida) return;
  // ERROR 5: dataset.i siempre es texto ("2") y q.correcta es un número (2),
  // y con === no son iguales. Por eso nunca puntuaba ninguna respuesta.
  // Lo vi con console.log(typeof i, typeof q.correcta). Lo arreglé con Number().
  responder(Number(dato));
}

function responder(i) {
  respondida = true;
  const q = preguntas[indice];
  const botones = document.getElementById("opciones").children;
  const acierto = i === q.correcta;
  if (acierto) puntos++;

  botones[q.correcta].className = "opcion ok";
  if (!acierto) botones[i].className = "opcion mal";
  // ERROR 16 (extra): el mensaje ponía "¡-¡Correcto!", sobraba un "-¡". Lo vi al acertar.
  document.getElementById("feedback").textContent =
    acierto ? "¡Correcto!" : "Incorrecto. La respuesta era: " + q.opciones[q.correcta];
  document.getElementById("marcador").textContent = "Puntos: " + puntos;

  const siguiente = document.getElementById("btnSiguiente");
  siguiente.textContent = indice === preguntas.length - 1 ? "Ver resultado" : "Siguiente";
  siguiente.hidden = false;
}

function siguiente() {
  indice++;
  if (indice < preguntas.length) mostrarPregunta();
  else terminar();
}

function terminar() {
  const segundos = Math.round((Date.now() - inicio) / 1000);
  // (ERROR 13 está en partida.js: faltaba la clase Partida)
  const partida = new Partida(usuario.nombre, puntos, preguntas.length, new Date().toISOString(), segundos);
  guardarPartida(partida);

  mostrarSeccion("juego", false);
  mostrarSeccion("final", true);
  document.title = "QuizDAW";
  document.getElementById("textoFinal").textContent = partida.resumen();
  pintarPartidas();
}

/* ---------- Lista de partidas y ventana de resultados ---------- */
function pintarPartidas() {
  // (ERROR 12 está en partida.js: faltaban cargarPartidas y mediaPuntos)
  const partidas = cargarPartidas();
  const lista = document.getElementById("listaPartidas");
  lista.innerHTML = "";
  for (const p of partidas) {
    const li = document.createElement("li");
    li.textContent = p.resumen();
    lista.appendChild(li);
  }
  document.getElementById("media").textContent =
    partidas.length > 0 ? "Media: " + mediaPuntos(partidas).toFixed(1) + " puntos" : "Aún no hay partidas.";
}

function abrirResultados() {
  // ERROR 9: abría "resultado.html" pero el archivo se llama "resultados.html" (con s).
  // Lo vi porque la ventana emergente daba error 404.
  window.open("resultados.html", "resultados", "popup=yes,width=520,height=460");
}

function manejarBorrar() {
  // (ERROR 7 está en cookies.js: el path al borrar no coincidía con el de crear)
  if (confirm("¿Borrar todos tus datos del quiz?")) {
    borrarCookie("usuario");
    borrarCookie("partidas");
    pintarPartidas();
    document.getElementById("saludo").textContent = "Datos borrados. Recarga la página.";
  }
}

/* ---------- Arranque ---------- */
function iniciar() {
  // ERROR 17 (extra): después de leerCookie había unas comillas '' sueltas. Las quité.
  usuario = leerCookie("usuario", null);
  if (usuario === null) {
    usuario = { nombre: pedirNombre(), tema: "claro" };
    guardarCookie("usuario", usuario, 30);
  }
  document.getElementById("saludo").textContent = "Hola, " + usuario.nombre;
  aplicarTema();
  pintarPartidas();
  pintarInfo();
// en app.js: función del botón "Repasar fallos"
// (la llamo verFallos porque repasarFallos ya es la función que juega los fallos)
function verFallos() {
  const seccion = document.getElementById("fallos");
  seccion.hidden = !seccion.hidden;

  const fallos = leerCookie("fallos", []);      // array de posiciones
  const lista = document.getElementById("listaFallos");
  lista.innerHTML = "";

  if (fallos.length === 0) {
    lista.innerHTML = "<li>No tienes fallos. ¡Bien!</li>";
    return;
  }
  for (const pos of fallos) {
    const q = PREGUNTAS[pos];
    const li = document.createElement("li");
    li.textContent = q.pregunta + " → " + q.opciones[q.correcta];
    lista.appendChild(li);
  }
}
  function anotarFallo(q, acierto) {
  const fallos = leerCookie("fallos", []);
  const pos = PREGUNTAS.indexOf(q);
  const yaEsta = fallos.includes(pos);

  if (!acierto && !yaEsta) fallos.push(pos);
  if (acierto && yaEsta) fallos.splice(fallos.indexOf(pos), 1);
  guardarCookie("fallos", fallos, 30);

  // si el botón no existe, no pasa nada (antes se rompía aquí)
  const boton = document.getElementById("btnRepaso");
  if (boton) boton.textContent = "Repetir fallos (" + fallos.length + ")";
}
  // FUNCIÓN NUEVA: ranking de jugadores (suma los puntos de todas sus partidas)
// La cookie "ranking" es un array de objetos { nombre, puntos, partidas }
function actualizarRanking(partida) {
  const ranking = leerCookie("ranking", []);

  if (partida) {
    // busco si el jugador ya está; si no, lo creo
    let jugador = ranking.find(j => j.nombre === partida.nombre);
    if (!jugador) {
      jugador = { nombre: partida.nombre, puntos: 0, partidas: 0 };
      ranking.push(jugador);
    }
    jugador.puntos += partida.puntos;
    jugador.partidas++;
    ranking.sort((a, b) => b.puntos - a.puntos);   // más puntos primero
    ranking.splice(10);                            // máximo 10 jugadores
    guardarCookie("ranking", ranking, 30);
  }

  const lista = document.getElementById("listaRanking");
  lista.innerHTML = "";
  if (ranking.length === 0) {
    lista.innerHTML = "<li>Aún no hay ranking.</li>";
    return;
  }
  for (let i = 0; i < ranking.length; i++) {
    const li = document.createElement("li");
    li.textContent = (i + 1) + "º " + ranking[i].nombre + " · " + ranking[i].puntos + " puntos en " +
      ranking[i].partidas + (ranking[i].partidas === 1 ? " partida" : " partidas");
    lista.appendChild(li);
  }
}
// en terminar(), después de guardarPartida(partida);
actualizarRanking(partida);

// en iniciar(), con los demás addEventListener
document.getElementById("btnRanking").addEventListener("click", mostrarRanking);

// en manejarBorrar(), junto a borrarCookie("partidas");
borrarCookie("fallos");
borrarCookie("ranking");
function mostrarRanking() {
  const seccion = document.getElementById("ranking");
  seccion.hidden = !seccion.hidden;
  actualizarRanking();
}
  document.getElementById("btnEmpezar").addEventListener("click", iniciarPartida);
  document.getElementById("btnOtra").addEventListener("click", iniciarPartida);
  document.getElementById("btnSiguiente").addEventListener("click", siguiente);
  document.getElementById("opciones").addEventListener("click", manejarOpcion);
  document.getElementById("btnTema").addEventListener("click", cambiarTema);
  // ERROR 8: ponía abrirResultados() con paréntesis, y así la función se ejecuta
  // nada más cargar la página en vez de al hacer clic. Hay que pasar solo el nombre.
  // Lo vi porque la ventana se abría sola al recargar.
  document.getElementById("btnResultados").addEventListener("click", abrirResultados);
  document.getElementById("btnBorrar").addEventListener("click", manejarBorrar);
}
document.addEventListener("DOMContentLoaded", iniciar);
document.getElementById("btnVerFallos").addEventListener("click", verFallos);
