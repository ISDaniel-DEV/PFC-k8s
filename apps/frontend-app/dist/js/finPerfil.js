let fotoPerfil = localStorage.getItem("foto_perfilLogeado");
let fotoBanner = localStorage.getItem("foto_bannerLogeado");

let fotoPerfilElement = document.getElementById("fotoPerfil");
let fotoBannerElement = document.getElementById("banner");

let fotoInput = document.getElementById("fotoInput");
let bannerInput = document.getElementById("fotoBannerInput");

let nombre = document.getElementById("nombre");

console.log(fotoPerfil, fotoBanner);

nombre.textContent = localStorage.getItem("nombreLogeado");

fotoPerfilElement.src = localStorage.getItem("foto_perfilLogeado");
fotoBannerElement.src = localStorage.getItem("foto_bannerLogeado");



