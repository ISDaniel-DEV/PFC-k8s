localStorage.getItem("logeado");
localStorage.getItem("id");

let desplegable1 = document.getElementById("desplegable");
let logeado2 = localStorage.getItem("logeado");
desplegable1.addEventListener("click", function () {
    if (logeado) {
        window.location.href = "perfil";
        localStorage.setItem("id", localStorage.getItem("idLogeado"));
        localStorage.setItem("nombre", localStorage.getItem("nombreLogeado"));
        localStorage.setItem("email", localStorage.getItem("emailLogeado"));
    }
})  