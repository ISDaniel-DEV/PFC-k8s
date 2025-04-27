var desplegable = document.getElementById("desplegable");
var despliegue = document.getElementById("despliegue");
var fuera = false;

let logeado1 = localStorage.getItem("logeado");

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

foto_banner.src = fotoBanner;
foto_perfil.src = fotoPerfil;

nombrePerfil.textContent = nombre;


let seguir = document.getElementById("seguir");
if (id == localStorage.getItem("idLogeado")) {
    seguir.style.display = "none";
}

function nuevoSeguidor(id, idSeguidor) {

    fetch(`http://localhost:3000/nuevoSeguidor/${id}/${idSeguidor}`, {
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

fetch(`http://localhost:3000/cantidadSeguidores/${id}`, {
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