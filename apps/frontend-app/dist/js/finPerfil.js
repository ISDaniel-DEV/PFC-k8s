let fotoPerfil = document.getElementById("fotoPerfil");
let fotoBanner = document.getElementById("banner");

let fotoPerfilElement = document.getElementById("fotoPerfil");
let fotoBannerElement = document.getElementById("banner");

let fotoInput = document.getElementById("fotoInput");
let bannerInput = document.getElementById("fotoBannerInput");

let nombre = document.getElementById("nombre");
let guardarCambiosBtn = document.getElementById("guardarCambios");

let perfil_img = localStorage.getItem("foto_perfilLogeado");
let banner_img = localStorage.getItem("foto_bannerLogeado");

console.log(fotoPerfil, fotoBanner);

nombre.textContent = localStorage.getItem("nombreLogeado");

// Obtener las rutas de las imágenes del localStorage
let perfilImgPath = localStorage.getItem("foto_perfilLogeado");
let bannerImgPath = localStorage.getItem("foto_bannerLogeado");

const defaultPerfilImg = './img/perfil/perfil_default.png';
const defaultBannerImg = './img/perfil/banner_default.png';

// Función para determinar la URL final de la imagen
function getImageUrl(imagePath, defaultImagePath) {
    if (!imagePath) {
        return defaultImagePath; // No hay imagen guardada, usar la predeterminada
    }
    // Si la ruta guardada es una de las predeterminadas (o una ruta relativa que no sea de 'uploads')
    if (imagePath.includes('img/perfil/') || imagePath.startsWith('./img/perfil/')) {
        // Asegurarse de que sea una ruta relativa correcta para el frontend
        return imagePath.startsWith('.') ? imagePath : './' + imagePath.substring(imagePath.indexOf('img/perfil/'));
    }
    // Si es una imagen subida (debería empezar con 'uploads/' o ya tener '/node/uploads/')
    if (imagePath.startsWith('uploads/')) {
        return '/node/' + imagePath; 
    }
    if (imagePath.startsWith('/node/uploads/')) {
        return imagePath; // Ya tiene el formato correcto
    }
    // Si es una URL completa, usarla tal cual
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    // Como último recurso, si no coincide con nada, intentar usar la predeterminada
    // o si es una ruta inesperada, podría ser un error y mostrar la predeterminada.
    return defaultImagePath; 
}

fotoPerfilElement.src = getImageUrl(perfilImgPath, defaultPerfilImg);
fotoBannerElement.src = getImageUrl(bannerImgPath, defaultBannerImg);

// Preview images when selected
fotoInput.addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            fotoPerfilElement.src = e.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    }
});

bannerInput.addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            fotoBannerElement.src = e.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    }
});

// Handle save changes
guardarCambiosBtn.addEventListener('click', async function () {
    try {
        // Upload profile image if selected
        let perfil_img = null;
        if (fotoInput.files && fotoInput.files[0]) {
            const formData = new FormData();
            formData.append('profileImage', fotoInput.files[0], 'profileImage.png');

            const response = await fetch('/node/upload/profile', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success && data.fileUpdated) {
                perfil_img = data.filePath;
            }
        }

        // Upload banner image if selected
        let banner_img = null;
        if (bannerInput.files && bannerInput.files[0]) {
            const formData = new FormData();
            formData.append('bannerImage', bannerInput.files[0], 'bannerImage.png');

            const response = await fetch('/node/upload/banner', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success && data.fileUpdated) {
                banner_img = data.filePath;
            }
        }

        // Store the file paths in localStorage for use in the continue button
        if (perfil_img) localStorage.setItem('foto_perfilLogeado', perfil_img);
        if (banner_img) localStorage.setItem('foto_bannerLogeado', banner_img);

        console.log('Files uploaded successfully');
    } catch (error) {
        console.error('Error al guardar los cambios:', error);
        console.log('Error al guardar los cambios');
    }
});

let siguienteBtn = document.getElementById("siguiente");

siguienteBtn.addEventListener("click", async function () {
    localStorage.setItem("primera_vez", 0);

    try {
        // Update primera_vez in database
        const email = localStorage.getItem("emailLogeado");
        console.log('Making request to /api/updatePrimeraVez with email:', email);
        const response = await fetch(`/api/UsuarioEmail?dato=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Response status:', response.status);
        const text = await response.json();
        console.log('Response text:', text);
        console.log('Response text:', text.nombre);
        // Get file paths from localStorage
        const foto_perfil = localStorage.getItem('foto_perfilLogeado') || text.foto_perfil;
        const foto_banner = localStorage.getItem('foto_bannerLogeado') || text.foto_banner;

        const newUser = {
            id: text.id,
            nombre: text.nombre,
            email: text.email,
            password: text.password,
            npublicaciones: text.npublicaciones,
            foto_perfil: foto_perfil,
            foto_banner: foto_banner,
            primera_vez: false
        };
        console.log(newUser);


        if (text != null) {
            const response = await fetch(`/api/updateUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            if (!response.ok) {
                throw new Error('Error updating user information');
            }

            console.log('User information updated successfully');
        } else {
            throw new Error('User data not found');
        }

        location.href = "./index";
    } catch (error) {
        console.error('Error:', error);
    }
})
