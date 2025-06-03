

var s1 = document.getElementById("s1");
// var s2 = document.getElementById("s2"); // Removed, element no longer exists
// var s3 = document.getElementById("s3"); // Removed, element no longer exists

// var d1 = document.getElementById("d1"); // Removed, element no longer exists
// var d2 = document.getElementById("d2"); // Removed, element no longer exists
// var d3 = document.getElementById("d3"); // Removed, element no longer exists

let subir = document.getElementById("subir");
let logeado1 = localStorage.getItem("logeado"); // Moved logeado1 definition higher for clarity

if (subir) { // Check if subir element exists before adding listener
    subir.addEventListener("click", function () {
        if(logeado1){
            window.location.href = "publicar";
        }else{
            window.location.href = "login";
        }
    });
}

// Removed DOMContentLoaded listener and related code for flecha1-3, d1-3, i1-3 as elements were removed from HTML

var desplegable = document.getElementById("desplegable");
// var despliegue = document.getElementById("despliegue"); // Assuming despliegue might also be related or non-existent, commented out for safety
var fuera = false; // This variable seems unused in the provided snippet, might be part of other logic

if (desplegable) { // Check if desplegable element exists
    if(!logeado1){ // If NOT logged in
        desplegable.classList.add("nav1");
        desplegable.classList.remove("nav2");
    } else { // User IS logged in
        desplegable.classList.remove("nav1");
        desplegable.classList.add("nav2");
    }
}

function crearJSON(id, tipo) {

    fetch(`node/crearJSON/${id}/${tipo}`, {
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
            // Handle the successful response from the server.
        })
        .catch(error => {
            console.error('Error creating JSON file:', error);
            // Handle the error.
        });

}

if(logeado1){
    crearJSON(localStorage.getItem("idLogeado"), "perfil");
}

