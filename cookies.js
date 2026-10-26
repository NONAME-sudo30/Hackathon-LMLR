// Funciones para guardar, leer y borrar cookies con valores JSON.
// Todas las cookies de este proyecto empiezan por "quiz_".
const PREFIJO = "quiz_";
 
function guardarCookie(nombre, valor, dias) {
  // ERROR 6: días a segundos es *24*60*60 (antes faltaba un *60)
  const segundos = dias * 24 * 60 * 60;
  const texto = JSON.stringify(valor);
  // ERROR 15: c ; o = no rompan la cookie
  document.cookie = PREFIJO + nombre + "=" + encodeURIComponent(texto) + "; max-age=" + segundos + "; path=/";
}
 
function leerCookie(nombre, porDefecto) {
  const clave = PREFIJO + nombre + "=";
  const trozo = document.cookie.split("; ").find(c => c.startsWith(clave));
  if (!trozo) return porDefecto;
  // ERROR 14: si la cookie está rota, JSON.parse falla, así que uso try/catch
  try {
    return JSON.parse(decodeURIComponent(trozo.slice(clave.length)));
  } catch (e) {
    return porDefecto;
  }
}
 
function borrarCookie(nombre) {
  // ERROR 7: el path tiene que ser el mismo que al crearla (antes era /quiz)
  document.cookie = PREFIJO + nombre + "=; max-age=0; path=/";
}
 