let volver = document.getElementById("volver");
let muro1 = document.getElementById("muro1");
let muro2 = document.getElementById("muro2");

let irlogin = document.getElementById("irlogin");

volver.addEventListener("click", function(){
    console.log("si");
    muro1.style.display = "block";
    muro2.style.display = "block";
    setTimeout(function(){
        window.location.href = "./index"},700);
});



irlogin.addEventListener("click", function(){
    window.scrollTo({
        top:2000,
        behavior: "smooth"
    });
});