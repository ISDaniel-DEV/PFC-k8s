var desplegable = document.getElementById("desplegable");
var despliegue = document.getElementById("despliegue");
var fuera = false;

let logeado1 = localStorage.getItem("logeado");

if(!logeado1){
    desplegable.classList.add("nav1");
    desplegable.classList.remove("nav2");
    window.location.href = "index";
}

