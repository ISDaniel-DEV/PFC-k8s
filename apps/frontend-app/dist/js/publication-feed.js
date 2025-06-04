document.addEventListener('DOMContentLoaded', async () => {
    const publicationsContainer = document.getElementById('s1');

    if (!publicationsContainer) {
        console.error('Error: Contenedor de publicaciones (div#s1) no encontrado.');
        return;
    }

    // Limpiar contenido hardcodeado o placeholders si es necesario
    publicationsContainer.innerHTML = ''; 

    try {
        const response = await fetch('/node/publicaciones');
        if (!response.ok) {
            throw new Error(`Error al obtener publicaciones: ${response.status} ${response.statusText}`);
        }
        const publications = await response.json();

        if (publications.length === 0) {
            publicationsContainer.innerHTML = '<p>No hay publicaciones disponibles en este momento.</p>';
            return;
        }

        publications.forEach(pub => {
            const objetoDiv = document.createElement('div');
            objetoDiv.classList.add('objeto');

            const linkElement = document.createElement('a');
            linkElement.href = `publicacion.html?id=${pub.id}`; 

            const contentDiv = document.createElement('div');

            const img = document.createElement('img');
            img.src = pub.imagen_url ? pub.imagen_url : './img/ejemplo.png'; // Usar placeholder si no hay imagen_url
            img.alt = pub.titulo || 'Publicación';
            contentDiv.appendChild(img);

            const h3 = document.createElement('h3');
            h3.textContent = pub.titulo || 'Sin título';
            contentDiv.appendChild(h3);

            linkElement.appendChild(contentDiv);
            objetoDiv.appendChild(linkElement);

            const authorP = document.createElement('p');
            const authorLink = document.createElement('a');
            authorLink.href = `perfil.html?id_usuario=${pub.id_autor}`;
            authorLink.textContent = `#${pub.autor_nombre || 'Autor desconocido'}`;
            authorP.appendChild(authorLink);
            objetoDiv.appendChild(authorP);

            // Omitimos la línea de "downloads - days ago" por ahora ya que no tenemos esos datos
            // const statsP = document.createElement('p');
            // statsP.textContent = 'Información no disponible';
            // objetoDiv.appendChild(statsP);

            publicationsContainer.appendChild(objetoDiv);
        });

    } catch (error) {
        console.error('Error al cargar las publicaciones:', error);
        publicationsContainer.innerHTML = '<p>Error al cargar las publicaciones. Intente de nuevo más tarde.</p>';
    }
});
