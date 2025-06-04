document.addEventListener('DOMContentLoaded', function () {
    // Define logeado1 from localStorage to check login status
    let logeado1 = localStorage.getItem("logeado");
    console.log("Login status (logeado1):", logeado1);
    
    const tagInput = document.getElementById('tagInput');
    const tagsContainer = document.getElementById('tagsContainer');
    const tagsPreview = document.getElementById('tagsPreview');
    const suggestionsContainer = document.getElementById('suggestions');

    let subir = document.getElementById("subir");

    subir.addEventListener("click", function () {
        window.location.href = "publicar";
    })

    if (!logeado1) {
        window.location.href = "index";
    }

    // Etiquetas sugeridas (puedes reemplazar esto con una llamada a tu API)
    const suggestedTags = [
        'diseño', 'web', 'app', 'ui', 'ux', 'ilustración',
        'gráficos', 'tipografía', 'logo', 'marca', '3d',
        'animación', 'fotografía', 'arte', 'digital', 'impresión'
    ];

    let selectedTags = [];

    // Mostrar sugerencias cuando el input tiene foco
    tagInput.addEventListener('focus', showSuggestions);

    // Ocultar sugerencias al hacer clic fuera
    document.addEventListener('click', function (e) {
        if (!tagsContainer.contains(e.target)) {
            suggestionsContainer.classList.remove('visible');
        }
    });

    // Manejar la entrada de etiquetas
    tagInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            console.log("'Enter' key pressed on tagInput.");
            const tag = tagInput.value.trim().toLowerCase();
            if (tag && !selectedTags.includes(tag)) {
                console.log(`Adding tag: '${tag}'`);
                addTag(tag);
                tagInput.value = '';
            }
        } else if (e.key === 'Backspace' && !tagInput.value) {
            // Eliminar la última etiqueta al presionar Backspace con el campo vacío
            const tags = document.querySelectorAll('.tag-item');
            if (tags.length > 0) {
                const lastTag = tags[tags.length - 1];
                removeTag(lastTag.textContent.trim().slice(0, -1)); // Eliminar el × del final
            }
        }
        showSuggestions();
    });

    // Función para mostrar sugerencias
    function showSuggestions() {
        const input = tagInput.value.toLowerCase();
        suggestionsContainer.innerHTML = '';

        if (!input) {
            suggestionsContainer.classList.remove('visible');
            return;
        }

        const filtered = suggestedTags
            .filter(tag => tag.includes(input) && !selectedTags.includes(tag))
            .slice(0, 5); // Mostrar máximo 5 sugerencias

        if (filtered.length === 0) {
            suggestionsContainer.classList.remove('visible');
            return;
        }

        filtered.forEach(tag => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = tag;
            div.addEventListener('click', () => {
                addTag(tag);
                tagInput.value = '';
                suggestionsContainer.classList.remove('visible');
                tagInput.focus();
            });
            suggestionsContainer.appendChild(div);
        });

        suggestionsContainer.classList.add('visible');
    }

    // Función para añadir una etiqueta
    function addTag(tag) {
        console.log(`addTag function called with tag: '${tag}'`);
        if (!tag || selectedTags.includes(tag)) return;

        selectedTags.push(tag);
        console.log('Updated selectedTags array:', selectedTags);
        
        // Update the tags preview section
        updatePreview();
        
        // Crear elemento de etiqueta
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            ${tag}
            <span class="tag-remove">&times;</span>
        `;

        // Insertar antes del input
        tagsContainer.insertBefore(tagElement, tagsContainer.querySelector('.tags-input-wrapper'));

        // Añadir evento para eliminar la etiqueta
        tagElement.querySelector('.tag-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            removeTag(tag);
        });

        // Actualizar vista previa
        updatePreview();
    }

    // Función para eliminar una etiqueta
    function removeTag(tag) {
        selectedTags = selectedTags.filter(t => t !== tag);
        updateTagsDisplay();
        updatePreview();
    }

    // Función para actualizar la visualización de etiquetas
    function updateTagsDisplay() {
        const tagElements = document.querySelectorAll('.tag-item');
        tagElements.forEach(el => {
            const tagText = el.textContent.trim().slice(0, -1); // Eliminar el ×
            if (!selectedTags.includes(tagText)) {
                el.remove();
            }
        });
    }

    // updatePreview function is already defined below

    // Función para eliminar una etiqueta
    function removeTag(tag) {
        console.log(`Removing tag: '${tag}'`);
        // Eliminar de la lista de etiquetas seleccionadas
        const index = selectedTags.indexOf(tag);
        if (index !== -1) {
            selectedTags.splice(index, 1);
            console.log('Updated selectedTags after removal:', selectedTags);
        }
        
        // Eliminar el elemento visual
        const tagElements = document.querySelectorAll('.tag-item');
        tagElements.forEach(el => {
            if (el.textContent.trim().includes(tag)) {
                el.remove();
            }
        });
        
        // Actualizar la vista previa
        updatePreview();
    }

    // Función para actualizar la vista previa
    function updatePreview() {
        tagsPreview.innerHTML = selectedTags.length > 0
            ? selectedTags.map(tag =>
                `<span class="tag-preview">${tag}</span>`
            ).join('')
            : '<p>No hay etiquetas seleccionadas</p>';
    }

    // Función para obtener los parámetros de la URL
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const data = {};

        // Obtener los datos de la publicación de la URL
        const id_publicacion = params.get('id_publicacion');
        const titulo = params.get('titulo');
        const descripcion = params.get('descripcion');
        const imagenPortada = params.get('imagenPortada');
        // Archivos no son necesarios en esta página para la lógica de tags, pero los dejamos por si se usan en la UI
        const archivos = params.get('archivos'); 

        if (id_publicacion) data.id_publicacion = decodeURIComponent(id_publicacion);
        if (titulo) data.titulo = decodeURIComponent(titulo);
        if (descripcion) data.descripcion = decodeURIComponent(descripcion);
        if (imagenPortada) data.imagenPortada = decodeURIComponent(imagenPortada);
        if (archivos) {
            try {
                data.archivos = JSON.parse(decodeURIComponent(archivos));
            } catch (e) {
                console.error('Error parsing archivos from URL:', e);
                data.archivos = []; // o null, o manejar el error como prefieras
            }
        }
        return data;
    }

    // Manejar el botón de publicar
    const publicarButton = document.getElementById('publicar');
    if (publicarButton) {
        publicarButton.addEventListener('click', async function () {
            console.log("'Publicar' button (id='publicar') clicked.");
            if (selectedTags.length === 0) {
                alert('Por favor, añade al menos una etiqueta a tu publicación.');
                return;
            }

            const publicarBtn = document.getElementById('publicar');
            const originalBtnText = publicarBtn.textContent;

            try {
                // Mostrar indicador de carga
                publicarBtn.disabled = true;
                publicarBtn.textContent = 'Guardando tags...';

                // Obtener id_publicacion de la URL
                const publicacionData = getUrlParams();
                const id_publicacion = publicacionData.id_publicacion;

                if (!id_publicacion) {
                    alert('Error: No se encontró el ID de la publicación. Asegúrate de que la URL es correcta.');
                    throw new Error('ID de publicación no encontrado en la URL.');
                }

                const payload = {
                    tags: selectedTags
                };
                
                const apiUrl = `/node/publicaciones/${id_publicacion}/tags`;
                
                console.log('Enviando tags a:', apiUrl);
                console.log('Payload:', JSON.stringify(payload));
                
                // Enviar los tags al backend
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    credentials: 'include' // Mantener si se manejan cookies/sesiones
                });
                
                console.log('Respuesta del servidor:', response);
                const result = await response.json(); // Intentar parsear JSON siempre para obtener detalles

                if (!response.ok) {
                    throw new Error(result.error || result.message || `Error ${response.status} al guardar los tags`);
                }

                console.log('Tags guardados:', result);

                // Mostrar mensaje de éxito y redirigir
                alert('¡Tags añadidos con éxito a la publicación!');
                // Considerar redirigir a la página de la publicación o a una página de confirmación
                window.location.href = 'index.html'; // O, por ejemplo, `verPublicacion.html?id=${id_publicacion}`

            } catch (error) {
                console.error('Error al guardar los tags:', error);
                alert(`Error al guardar los tags: ${error.message}`);
            } finally {
                // Restaurar el botón
                publicarBtn.disabled = false;
                publicarBtn.textContent = originalBtnText;
            }
        });
    } else {
        console.error("Button with id 'publicar' not found for event listener.");
    }

    // Manejar el botón de volver atrás
    const volverButton = document.getElementById('anterior');
    if (volverButton) {
        volverButton.addEventListener('click', function() {
            console.log("'Volver atrás' button (id='anterior') clicked.");
            window.history.back(); // Navegar a la página anterior
        });
    } else {
        console.error("Button with id 'anterior' not found.");
    }
});
