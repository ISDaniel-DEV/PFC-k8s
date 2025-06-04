document.addEventListener('DOMContentLoaded', async () => {
    const desplegable = document.getElementById("desplegable");
    const despliegue = document.getElementById("despliegue"); // Assuming this is for the dropdown menu
    // var fuera = false; // This variable was not used, can be removed or kept if planned for future use

    const logeadoLocal = localStorage.getItem("logeado"); // Check if any user is logged in
    const id_logeado = localStorage.getItem("idLogeado"); // ID of the logged-in user (key changed from "id")

    const subirButton = document.getElementById("subir");
    if (subirButton) {
        subirButton.addEventListener("click", function () {
            window.location.href = "publicar.html"; // Assuming 'publicar' is 'publicar.html'
        });
    }

    // Handle dropdown menu visibility based on login state
    if (!logeadoLocal && desplegable) { // If not logged in, adjust nav
        desplegable.classList.add("nav1");
        desplegable.classList.remove("nav2");
    }
    // If not logged in and no profile ID in URL, redirect (handled further down)

    const urlParams = new URLSearchParams(window.location.search);
    let id_usuario_perfil = urlParams.get('id_usuario');

    // DOM Elements for profile page
    const nombrePerfilElement = document.getElementById("nombrePerfil");
    const cantidadSeguidoresElement = document.getElementById("cantidadSeguidores");
    const cantidadSeguidosElement = document.getElementById("cantidadSeguidos");
    const fotoPerfilElement = document.getElementById("foto_perfil");
    const fotoBannerElement = document.getElementById("foto_banner");
    const seguirButton = document.getElementById("seguir");

    // If no user ID in URL and no one is logged in, redirect to index.
    // If there's an ID in URL, or someone is logged in, proceed.
    if (!id_usuario_perfil && !id_logeado) {
        window.location.href = "index.html";
        return; // Stop script execution
    }

    // If no id_usuario in URL, assume it's the logged-in user's own profile
    if (!id_usuario_perfil) {
        if (id_logeado) {
            id_usuario_perfil = id_logeado;
        } else {
            // This case should be caught by the check above, but as a fallback:
            console.error("No se pudo determinar el ID del perfil a cargar y nadie está logeado.");
            if(nombrePerfilElement) nombrePerfilElement.textContent = "Error: Perfil no especificado.";
            if(seguirButton) seguirButton.style.display = 'none';
            return; // Stop further execution
        }
    }

    // Función para normalizar la ruta de la imagen (ensure it's available)
    function normalizeImagePath(imgPath) {
        if (!imgPath) return imgPath;
        if (imgPath.startsWith('http') || imgPath.startsWith('/node')) {
            return imgPath;
        }
        if (!imgPath.startsWith('/')) {
            return '/node/' + imgPath;
        }
        return '/node' + imgPath;
    }

    async function cargarPerfilUsuario(userId) {
        console.log(`Cargando perfil para el usuario ID: ${userId}`);
        try {
            const response = await fetch(`/node/usuario/${userId}/info`);
            if (!response.ok) {
                let errorMsg = 'Error al cargar el perfil.';
                if (response.status === 404) errorMsg = 'Usuario no encontrado.';
                else errorMsg = `Error del servidor: ${response.status}`;
                throw new Error(errorMsg);
            }
            const data = await response.json();
            if (data.success && data.usuario) {
                const usuario = data.usuario;
                console.log("Datos del perfil recibidos:", usuario);
                if (nombrePerfilElement) nombrePerfilElement.textContent = usuario.nombre;
                // Use normalizeImagePath for consistency, though backend now provides full URLs
                if (fotoPerfilElement) fotoPerfilElement.src = usuario.foto_perfil_url ? usuario.foto_perfil_url : './img/perfil/perfil_default.png';
                if (fotoBannerElement) fotoBannerElement.src = usuario.foto_banner_url ? usuario.foto_banner_url : './img/perfil/banner_default.png';
                
                // Update follow button visibility
                if (seguirButton) {
                    if (id_logeado && id_logeado === userId) { // Viewing own profile
                        seguirButton.style.display = "none";
                    } else if (id_logeado) { // Logged in, viewing someone else's profile
                        seguirButton.style.display = "block"; // Or "inline-block"
                        // TODO: Check if already following and set button text (e.g., "Dejar de seguir")
                    } else { // Not logged in, viewing someone's profile
                        seguirButton.style.display = "block"; // Or hide if login is required to follow
                    }
                }
            } else {
                throw new Error(data.message || 'No se pudieron obtener los datos del usuario.');
            }
        } catch (error) {
            console.error('Error en cargarPerfilUsuario:', error.message);
            if (nombrePerfilElement) nombrePerfilElement.textContent = error.message;
            if (fotoPerfilElement) fotoPerfilElement.src = './img/perfil/perfil_default.png';
            if (fotoBannerElement) fotoBannerElement.src = './img/perfil/banner_default.png';
            if (seguirButton) seguirButton.style.display = "none";
        }
    }

    async function cargarContadoresSeguidores(userId) {
        console.log(`Cargando contadores de seguidores para el usuario ID: ${userId}`);
        try {
            // Assuming the backend endpoint /node/cantidadSeguidores/:id is POST as per original code
            // If it's GET, change method and remove body/headers if not needed
            const response = await fetch(`/node/cantidadSeguidores/${userId}`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                // body: JSON.stringify({ id: userId }) // Send userId in body if backend expects it
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('Respuesta de cantidadSeguidores:', data);
            if (cantidadSeguidoresElement) cantidadSeguidoresElement.textContent = data.cantidadSeguidores !== undefined ? data.cantidadSeguidores : 0;
            if (cantidadSeguidosElement) cantidadSeguidosElement.textContent = data.cantidadSeguidos !== undefined ? data.cantidadSeguidos : 0;
        } catch (error) {
            console.error('Error al cargar contadores de seguidores:', error);
            if (cantidadSeguidoresElement) cantidadSeguidoresElement.textContent = 0;
            if (cantidadSeguidosElement) cantidadSeguidosElement.textContent = 0;
        }
    }
    
    // Function to follow/unfollow a user
    function nuevoSeguidor(idPerfilASeguir, idUsuarioQueSigue) {
        console.log(`Usuario ${idUsuarioQueSigue} intentando seguir a ${idPerfilASeguir}`);
        // The original function took (id, idSeguidor) where 'id' was the one being followed.
        fetch(`/node/nuevoSeguidor/${idPerfilASeguir}/${idUsuarioQueSigue}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Respuesta de nuevoSeguidor:', data);
            if(data.success){
                // Refresh follower counts and update button state (e.g., to "Dejar de seguir")
                cargarContadoresSeguidores(idPerfilASeguir);
                // TODO: Update button text/state
                alert(data.message || "Acción completada.");
            } else {
                alert(data.message || "No se pudo completar la acción.");
            }
        })
        .catch(error => {
            console.error('Error en nuevoSeguidor:', error);
            alert("Error al intentar seguir/dejar de seguir.");
        });
    }

    async function cargarPublicacionesUsuario(userId) {
        const container = document.getElementById('publicaciones-container');
        if (!container) {
            console.error('El contenedor de publicaciones no fue encontrado.');
            return;
        }
        container.innerHTML = ''; // Limpiar contenido previo

        console.log(`Cargando publicaciones para el usuario ID: ${userId}`);
        try {
            const response = await fetch(`/node/usuario/${userId}/publicaciones`);
            if (!response.ok) {
                throw new Error(`Error al cargar las publicaciones: ${response.status}`);
            }
            const data = await response.json();

            if (data.success && data.publicaciones && data.publicaciones.length > 0) {
                // No intermediate 'publications-grid' div, append directly to container
                data.publicaciones.forEach(publicacion => {
                    const objetoDiv = document.createElement('div');
                    objetoDiv.classList.add('objeto');

                    const linkElement = document.createElement('a');
                    linkElement.href = `publicacion.html?id=${publicacion.id}`;

                    const contentDiv = document.createElement('div'); // Inner div for image and title

                    const img = document.createElement('img');
                    img.src = publicacion.foto_portada_url ? publicacion.foto_portada_url : './img/ejemplo.png'; 
                    img.alt = publicacion.titulo || 'Publicación';
                    img.onerror = () => { img.src = './img/ejemplo.png'; }; 
                    contentDiv.appendChild(img);

                    const h3 = document.createElement('h3');
                    h3.textContent = publicacion.titulo || 'Sin título';
                    contentDiv.appendChild(h3);

                    linkElement.appendChild(contentDiv);
                    objetoDiv.appendChild(linkElement);

                    // Add author link, identical to index.html feed
                    const authorP = document.createElement('p');
                    const authorLink = document.createElement('a');
                    // publicacion.user_id is id_autor from backend, publicacion.nombre_usuario is u.nombre
                    authorLink.href = `perfil.html?id_usuario=${publicacion.user_id}`;
                    authorLink.textContent = `#${publicacion.nombre_usuario || 'Autor desconocido'}`;
                    authorP.appendChild(authorLink);
                    objetoDiv.appendChild(authorP);
                    
                    // Tags are not displayed in index.html feed, so remove them here for exact match
                    // if (publicacion.tags && publicacion.tags.length > 0) { ... }
                    
                    container.appendChild(objetoDiv); // Append directly to the main container
                });
            } else if (data.success && data.publicaciones && data.publicaciones.length === 0) {
                container.innerHTML = '<p>Este usuario aún no tiene publicaciones.</p>';
            } else {
                throw new Error(data.message || 'No se pudieron obtener las publicaciones del usuario.');
            }
        } catch (error) {
            console.error('Error en cargarPublicacionesUsuario:', error.message);
            container.innerHTML = '<p>Error al cargar las publicaciones. Inténtalo de nuevo más tarde.</p>';
        }
    }

    // Event listener for the follow button
    if (seguirButton) {
        seguirButton.addEventListener('click', function() {
            if (!id_logeado) {
                alert("Debes iniciar sesión para seguir a otros usuarios.");
                window.location.href = "login.html"; // Or your login page
                return;
            }
            // Ensure we are not trying to follow oneself (though button should be hidden)
            if (id_logeado !== id_usuario_perfil) {
                nuevoSeguidor(id_usuario_perfil, id_logeado); 
            }
        });
    }

    // Initial data load for the profile page
    if (id_usuario_perfil) {
        await cargarPerfilUsuario(id_usuario_perfil);
        await cargarContadoresSeguidores(id_usuario_perfil);
        await cargarPublicacionesUsuario(id_usuario_perfil);
    } else {
        // This case should ideally not be reached if logic above is correct
        console.error("ID de perfil de usuario no determinado para la carga inicial.");
        if(nombrePerfilElement) nombrePerfilElement.textContent = "Error al cargar perfil.";
    }

    // The old commented-out fetch call is removed.
    // Ensure desplegable/despliegue logic for menu is handled if still needed
    // For example, if it's a user dropdown menu:
    if (desplegable && despliegue && logeadoLocal) {
        desplegable.addEventListener('click', function() {
            despliegue.classList.toggle('mostrar'); // 'mostrar' would be a CSS class to show the menu
        });
        // Logic to close dropdown if clicked outside might be needed
    }
});