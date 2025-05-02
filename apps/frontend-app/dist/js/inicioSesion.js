let boton = document.getElementById('login');

let email = document.getElementById('email');
let password = document.getElementById('password');

//Crea un json en el servidor con el id del usuario logeado
//para almacenar quienes le siguen



boton.addEventListener('click', function () {
    console.log(email.value);
    console.log(password.value);

    let url1 = "/api/api/UsuarioEmail?dato=" + email.value + "";
    fetch(url1, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.text())
        .then(data => {
            console.log(data)
            let parseado = JSON.parse(data);
            if (data == "") {
                console.log(data);
                let error = document.getElementById('error');
                error.textContent = "Email invalido";
                
            } else if(!(parseado.password == password.value)){
                console.log(data);
                console.log(parseado.password);
                console.log(typeof data);

                let error = document.getElementById('error');
                error.textContent = "Contraseña incorrecta";
            }else{
                console.log(data);
                let error = document.getElementById('error');
                error.textContent = "";

                let url1 = "api/api/UsuarioEmail?dato=" + email.value + "";

                console.log("funciono");
                localStorage.setItem("idLogeado", parseado.id);
                localStorage.setItem("emailLogeado", email.value);
                localStorage.setItem("nombreLogeado", parseado.nombre);
                localStorage.setItem("npubliacionesLogeado", parseado.npublicaciones);
                localStorage.setItem("foto_perfilLogeado", parseado.foto_perfil);
                localStorage.setItem("foto_bannerLogeado", parseado.foto_banner);
                localStorage.setItem("logeado", true);
                console.log(localStorage.getItem("id"), localStorage.getItem("email"), localStorage.getItem("nombre"), localStorage.getItem("apellido"), localStorage.getItem("password"), localStorage.getItem("npubliaciones"));
                

                let link = "./index";
                window.location.href = link;


            }
        })
})