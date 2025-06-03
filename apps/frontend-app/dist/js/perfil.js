var desplegable = document.getElementById("desplegable");
var despliegue = document.getElementById("despliegue");
var fuera = false;

let logeado1 = localStorage.getItem("logeado");

let subir = document.getElementById("subir");

subir.addEventListener("click", function () {
    window.location.href = "publicar";
})


if (!logeado1) {
    desplegable.classList.add("nav1");
    desplegable.classList.remove("nav2");
    window.location.href = "index";
}

let id = localStorage.getItem("id");
let nombre = localStorage.getItem("nombre");
let email = localStorage.getItem("email");
let fotoPerfil = localStorage.getItem("foto_perfilLogeado");
let fotoBanner = localStorage.getItem("foto_bannerLogeado");
console.log(fotoPerfil, fotoBanner);

let nombrePerfil = document.getElementById("nombrePerfil");
let cantidadSeguidores = document.getElementById("cantidadSeguidores");
let cantidadSeguidos = document.getElementById("cantidadSeguidos");
let foto_perfil = document.getElementById("foto_perfil");
let foto_banner = document.getElementById("foto_banner");

// Función para normalizar la ruta de la imagen
function normalizeImagePath(imgPath) {
    if (!imgPath) return imgPath;
    
    // Si la ruta ya es absoluta o comienza con http, dejarla como está
    if (imgPath.startsWith('http') || imgPath.startsWith('/node')) {
        return imgPath;
    }
    
    // Si la ruta no comienza con /, agregar /node/
    if (!imgPath.startsWith('/')) {
        return '/node/' + imgPath;
    }
    
    // Si la ruta comienza con / pero no con /node, agregar /node al principio
    return '/node' + imgPath;
}

if (foto_banner) {
    foto_banner.src = fotoBanner ? normalizeImagePath(fotoBanner) : './img/perfil/banner_default.png';
}
if (foto_perfil) {
    foto_perfil.src = fotoPerfil ? normalizeImagePath(fotoPerfil) : './img/perfil/perfil_default.png';
}

if (nombrePerfil) {
    nombrePerfil.textContent = nombre;
} else {
    console.error('Elemento nombrePerfil no encontrado en el DOM');
}


let seguir = document.getElementById("seguir");
if (id == localStorage.getItem("idLogeado")) {
    seguir.style.display = "none";
}

function nuevoSeguidor(id, idSeguidor) {

    fetch(`node/nuevoSeguidor/${id}/${idSeguidor}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // If you were sending JSON in the body.
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // or response.text() if your server sends plain text.
        })
        .then(data => {
            console.log('Server response:', data);
            // Handle the successful response from the server.
        })
        .catch(error => {
            console.error('Error creating JSON file:', error);
            // Handle the error.
        });


}


fetch(`node/cantidadSeguidores/${id}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json', // If you were sending JSON in the body.
    },
    // If you were sending json in the body.
    // body: JSON.stringify({ id: id })
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // or response.text() if your server sends plain text.
    })
    .then(data => {
        console.log('Server response:', data);
        if (!(data.cantidadSeguidores == undefined)) {
            cantidadSeguidores.textContent = data.cantidadSeguidores;
        } else {
            cantidadSeguidores.textContent = 0;
        }

        if (!(data.cantidadSeguidos == undefined)) {
            cantidadSeguidos.textContent = data.cantidadSeguidos;
        } else {
            cantidadSeguidos.textContent = 0;
        }


        // Handle the successful response from the server.
    })
    .catch(error => {
        console.error('Error creating JSON file:', error);
        // Handle the error.
    });

/*
let url1 = "http://localhost:8888/api/UsuarioEmail?dato=" + localStorage.getItem("emailLogeado");
fetch(url1, {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }
})
    .then(response => response.text())
    .then(data => {
        let parseado = JSON.parse(data);
        if (data == "") {
            console.log(data);
            let error = document.getElementById('error');
            error.textContent = "Email invalido";

        } else if (!(parseado.password == password.value)) {
            console.log(data);
            console.log(parseado.password);
            console.log(typeof data);


            let error = document.getElementById('error');
            error.textContent = "Contraseña incorrecta";
        } else {
            console.log(data);
            let error = document.getElementById('error');
            error.textContent = "";

            let url1 = "http://localhost:8888/api/UsuarioEmail?dato=" + email.value + "";

            console.log("funciono");
        }
    })
*/