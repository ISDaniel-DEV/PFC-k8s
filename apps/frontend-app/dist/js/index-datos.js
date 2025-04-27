console.log(localStorage.getItem("idLogeado"), localStorage.getItem("emailLogeado"), localStorage.getItem("nombreLogeado"), localStorage.getItem("passwordLogeado"), localStorage.getItem("npubliacionesLogeado"), localStorage.getItem("logeado"));

let logeado = localStorage.getItem("logeado");
let logout = document.getElementById("logout");

if (logeado) {
   logout.textContent = "Cerrar sesión";
   logout.addEventListener('click', function () {
      localStorage.clear();
      location.reload();
   })
}

if (!logeado) {
   logout.textContent = "Iniciar sesión";
   logout.addEventListener('click', function () {
      window.location.href = "./login";
   })
}

if (logeado) {
   desplegable.classList.add("nav2");
   desplegable.classList.remove("nav1");

   let link = "./perfil";
   desplegable.addEventListener("click", function () {
      window.location.href = link;
   })
}

