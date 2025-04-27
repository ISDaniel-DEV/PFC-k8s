let desplegable = document.getElementById("desplegable");
let despliege = document.getElementById("despliege");


//Mouse over icono usuario
if (localStorage.getItem("logeado") = true) {
    desplegable.style.display = "flex";
    despliege.style.display = "none";
} else {
    desplegable.addEventListener("mouseover", function () {
        despliege.style.display = "flex";
    })

    desplegable.addEventListener("mouseout", function () {
        if (window.innerWidth < 800) {
            despliege.style.display = "none";
        }
    })


    //Mouse over en el div
    despliege.addEventListener("mouseover", function () {
        despliege.style.display = "flex";
    })

    despliege.addEventListener("mouseout", function () {
        if (window.innerWidth < 800) {
            despliege.style.display = "none";
        }

    })


    window.addEventListener("resize", function () {
        if (window.innerWidth > 800) {
            despliege.style.display = "flex";
        } else {
            despliege.style.display = "none";
        }
    })

}

