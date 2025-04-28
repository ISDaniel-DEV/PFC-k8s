

var s1 = document.getElementById("s1");
var s2 = document.getElementById("s2");
var s3 = document.getElementById("s3");

var d1 = document.getElementById("d1");
var d2 = document.getElementById("d2");
var d3 = document.getElementById("d3");

document.addEventListener("DOMContentLoaded", function () {
    flecha1.classList.add("iDerecha");
    d1.classList.add("sDerecha");
    flecha2.classList.add("iDerecha");
    d2.classList.add("sDerecha");
    flecha3.classList.add("iDerecha");
    d3.classList.add("sDerecha");
})

var flecha1 = document.getElementById("i1");
var posicion1 = true;
flecha1.addEventListener("click", function () {

    if (posicion1) {
        s1.scrollLeft = 3000;
        posicion1 = false;
    } else {
        s1.scrollLeft = 0;
        posicion1 = true;
    }
    d1.classList.toggle("sDerecha");
    flecha1.classList.toggle("iDerecha");
    d1.classList.toggle("sIzquierda");
    flecha1.classList.toggle("iIzquierda");

});

var flecha2 = document.getElementById("i2");
var posicion2 = true;
flecha2.addEventListener("click", function () {
    if (posicion2) {
        s2.scrollLeft = 3000;
        posicion2 = false;
    } else {
        s2.scrollLeft = 0;
        posicion2 = true;
    }
    d2.classList.toggle("sDerecha");
    flecha2.classList.toggle("iDerecha");
    d2.classList.toggle("sIzquierda");
    flecha2.classList.toggle("iIzquierda");
});

var flecha3 = document.getElementById("i3");
var posicion3 = true;
flecha3.addEventListener("click", function () {
    if (posicion3) {
        s3.scrollLeft = 3000;
        posicion3 = false;
    } else {
        s3.scrollLeft = 0;
        posicion3 = true;
    }
    d3.classList.toggle("sDerecha");
    flecha3.classList.toggle("iDerecha");
    d3.classList.toggle("sIzquierda");
    flecha3.classList.toggle("iIzquierda");
});

var desplegable = document.getElementById("desplegable");
var despliegue = document.getElementById("despliegue");
var fuera = false;

let logeado1 = localStorage.getItem("logeado");


if(!logeado1){
    desplegable.classList.add("nav1");
    desplegable.classList.remove("nav2");
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

