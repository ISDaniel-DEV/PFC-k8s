let registrar = document.getElementById('registrar');
let registrado = document.getElementById('registrado');

let errGeneral = document.getElementById('errGeneral');
let errNombre = document.getElementById('errNombre');
let errEmail = document.getElementById('errEmail');
let errPassword = document.getElementById('errPassword');
let errRepassword = document.getElementById('errRepassword');

async function createUser(userData) {
    try {
        const response = await 
        fetch('/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('User created successfully:', data);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;

registrar.addEventListener('click', function () {

    let validador = true;

    let nombre = document.getElementById('nombre').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let repassword = document.getElementById('repassword').value;
    let fotoPerfil = './img/perfil/perfil_default.png';
    let fotoBanner = './img/perfil/banner_default.png';
 
    

    errGeneral.textContent = "";
    errNombre.textContent = "";
    errEmail.textContent = "";
    errPassword.textContent = "";
    errRepassword.textContent = "";


    //General
    if (nombre == "" || email == "" || password == "" || repassword == "") {
        validador = false;
        console.log("campos vacios");
        errGeneral.textContent = "Rellena todos los campos";
    }else if (nombre == email || nombre == password || nombre == repassword || email == password || email == repassword) {
        validador = false;
        errGeneral.textContent = "Los campos no pueden ser iguales";
        console.log("campos iguales");
    }

    //Password
    if (password.length < 6 && password.length > 0) {
        validador = false;
        errPassword.textContent = "Contraseña muy corta (mínimo 6 caracteres)";
        console.log("contraseña muy corta");
    }else
     if (password.length > 20 ) {
        validador = false;
        errPassword.textContent = "Contraseña muy larga (máximo 20 caracteres)";
        console.log("contraseña muy larga");
    }else if (!passwordRegex.test(password) && password.length > 0) {
        validador = false;
        errPassword.textContent = "Minimo 1 mayúscula, 1 minúscula y 1 número";
        console.log("La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número, y no debe contener símbolos.");
    }else

    if (password != repassword && password.length > 0) {
        validador = false;
        errRepassword.textContent = "Las contraseñas no coinciden";
        console.log("contraseñas no coinciden");
    }

    //Email
    if (email.indexOf("@") == -1 && password.length > 0)  {
        errEmail.textContent = "Email invalido";
        validador = false;
        console.log("email invalido");
    }else
    if (email.indexOf(".") == -1 && password.length > 0) {
        errEmail.textContent = "Email invalido";
        validador = false;
        console.log("email invalido");
    }
    //Nombre
    if (nombre.length < 3 && nombre.length > 0) {
        validador = false;
        errNombre.textContent = "Nombre muy corto";
        console.log("nombre muy corto");
    }else
    if (nombre.length > 20) {
        validador = false;
        errNombre.textContent = "Nombre muy largo";
        console.log("nombre muy largo");
    }

    setTimeout(function () {
        errGeneral.textContent = "";
        errNombre.textContent = "";
        errEmail.textContent = "";
        errPassword.textContent = "";
        errRepassword.textContent = "";
    }, 5000);

    const newUser = {
        nombre: nombre,
        email: email,
        password: password,
        npublicaciones: 0,
        foto_perfil: fotoPerfil,
        foto_banner: fotoBanner
    };

    if (validador == true){
        createUser(newUser);
        console.log(nombre, email, password, repassword);
        registrado.style.display = "flex";



        setTimeout(() => {
            window.location.href = "./login";
        }, 2000);
        
    }
});



