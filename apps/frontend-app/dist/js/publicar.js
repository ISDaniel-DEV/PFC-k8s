// Variables globales
let archivosSeleccionados = [];
let imagenPortada = null;
const MAX_ARCHIVOS_PRINCIPALES = 1; // Max 1 main publication file
const ALLOWED_MAIN_FILE_TYPES = {
    extensions: ['.html', '.zip', '.rar', '.7z', '.tar', '.gz'],
    mimeTypes: [
        'text/html',
        'application/zip', 'application/x-zip-compressed',
        'application/vnd.rar', 'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip', 'application/x-gzip',
        'application/x-compressed',
        'application/octet-stream' // Allow generic for extension match
    ]
};
const MAX_TAMANO_MB = 50; // 50MB por archivo (coincide con el backend)
const MAX_TAMANO_PORTADA_MB = 10; // 10MB para la imagen de portada

// Inicialización cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    const inputArchivos = document.getElementById('archivos');
    const contenedorArchivos = document.getElementById('archivos-seleccionados');
    const dropZone = document.getElementById('drop-zone');
    const formulario = document.querySelector('form') || document.querySelector('section');
    const fotoInput = document.getElementById('fotoInput');
    const portadaPreview = document.getElementById('portadaPreview');
    const portadaSeleccionada = document.getElementById('portadaSeleccionada');
    const portadaEliminar = document.getElementById('portadaEliminar');
    const subirBtn = document.getElementById('subir');

    // Redirigir si no está logueado
    if (typeof logeado1 !== 'undefined' && !logeado1) {
        window.location.href = 'index';
    }

    // Configurar el botón de subir
    if (subirBtn) {
        subirBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'publicar';
        });
    }

    // Flag to ensure styles are injected only once
    let stylesInjected = false;

    // Función para mostrar notificaciones
    function showNotification(message, type = 'info') {
        if (!stylesInjected) {
            const style = document.createElement('style');
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 4px;
                    color: white;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transform: translateX(120%); /* Start off-screen */
                    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
                    max-width: 300px;
                }
                
                .notification.show {
                    transform: translateX(0); /* Slide in */
                }
                
                .notification.fade-out {
                    opacity: 0;
                    /* transform: translateX(120%); Optional: slide out again */
                }
                
                .notification.info {
                    background-color: #2196F3;
                }
                
                .notification.success {
                    background-color: #4CAF50;
                }
                
                .notification.warning {
                    background-color: #FF9800;
                }
                
                .notification.error {
                    background-color: #F44336;
                }
            `;
            document.head.appendChild(style);
            stylesInjected = true;
        }

        const notification = document.createElement('div');
        // Set initial class without 'show'. 'show' will be added after appending to DOM to trigger transition.
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Force a reflow before adding the 'show' class for the transition to work reliably.
        // Accessing offsetWidth is a common way to trigger reflow.
        void notification.offsetWidth; 

        // Add 'show' class to trigger the slide-in animation
        notification.classList.add('show');

        // Eliminar la notificación después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show'); // Remove 'show' to potentially trigger slide-out if CSS is set up for it
            notification.classList.add('fade-out'); // Start fade-out
            // Wait for fade-out transition to complete before removing from DOM
            setTimeout(() => {
                notification.remove();
            }, 300); // This duration should match the opacity transition time
        }, 5000);
    }

    // Helper functions for cover image UI
    function mostrarPreviewPortada() {
        const placeholder = document.getElementById('portada-placeholder-icon');
        const seleccionadaCont = document.getElementById('portadaSeleccionada');
        if (placeholder) placeholder.style.display = 'none';
        if (seleccionadaCont) seleccionadaCont.style.display = 'block';
        // Optionally update text if placeholder also carries text like 'Cambiar imagen'
        // For example: if (placeholder) placeholder.innerHTML = '<i class="fas fa-image"></i> Cambiar imagen';
    }

    function ocultarPreviewPortada() {
        const placeholder = document.getElementById('portada-placeholder-icon');
        const seleccionadaCont = document.getElementById('portadaSeleccionada');
        const fotoInputElement = document.getElementById('fotoInput'); // Get fotoInput directly

        if (placeholder) {
            placeholder.style.display = 'block'; // Or 'flex', 'inline-flex' depending on its CSS
            placeholder.innerHTML = '<i class="fas fa-image"></i> Seleccionar imagen'; // Reset text
        }
        if (seleccionadaCont) {
            seleccionadaCont.innerHTML = ''; // Clear actual preview content
            seleccionadaCont.style.display = 'none';
        }
        if (fotoInputElement) fotoInputElement.value = ''; // Reset the file input
        imagenPortada = null; // Clear the global variable
    }

    // Manejar la selección de la imagen de portada
    if (fotoInput && portadaSeleccionada) {
        fotoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;

            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                showNotification('Por favor, selecciona un archivo de imagen válido', 'error');
                ocultarPreviewPortada(); // Ensure input is cleared and UI reset
                return;
            }

            // Validar tamaño (máximo 10MB)
            if (file.size > MAX_TAMANO_PORTADA_MB * 1024 * 1024) {
                showNotification(`La imagen de portada no debe superar los ${MAX_TAMANO_PORTADA_MB}MB`, 'error');
                ocultarPreviewPortada(); // Ensure input is cleared and UI reset
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const maxSize = 1200;
                    let width = img.width;
                    let height = img.height;
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        console.log('Inside canvas.toBlob callback. Blob:', blob); // DEBUG
                        if (blob) {
                            const fileName = `portada_${Date.now()}.jpg`;
                            const resizedFile = new File([blob], fileName, { type: 'image/jpeg', lastModified: Date.now() });
                            console.log('resizedFile created:', resizedFile); // DEBUG
                            imagenPortada = resizedFile;
                            console.log('imagenPortada DESPUÉS de asignación:', imagenPortada, '; Type:', typeof imagenPortada); // DEBUG

                            try {
                                const previewUrl = URL.createObjectURL(blob);
                                const previewContainer = document.getElementById('portadaSeleccionada'); // Get fresh reference
                                if (!previewContainer) { // Guard clause
                                    console.error('portadaSeleccionada container not found for preview.');
                                    ocultarPreviewPortada();
                                    return;
                                }
                                previewContainer.innerHTML = ''; // Clear previous content

                                const previewImg = document.createElement('img');
                                previewImg.onload = () => URL.revokeObjectURL(previewUrl);
                                previewImg.src = previewUrl;
                                previewImg.alt = 'Vista previa de la portada';
                                previewImg.style.maxWidth = '100%';
                                previewImg.style.height = 'auto';
                                previewImg.style.borderRadius = '8px';

                                const eliminarBtn = document.createElement('button');
                                eliminarBtn.innerHTML = '&times;';
                                eliminarBtn.className = 'btn-eliminar-portada';
                                eliminarBtn.onclick = function(ev) {
                                    ev.preventDefault();
                                    ev.stopPropagation();
                                    ocultarPreviewPortada();
                                    showNotification('Imagen de portada eliminada', 'info');
                                };
                                previewContainer.appendChild(previewImg);
                                previewContainer.appendChild(eliminarBtn);
                                mostrarPreviewPortada();
                                showNotification('Imagen de portada cargada y previsualizada', 'success');
                            } catch (error) {
                                console.error('Error al crear la vista previa:', error);
                                showNotification('Error al mostrar la vista previa de la portada', 'error');
                                ocultarPreviewPortada();
                            }
                        } else {
                            console.error('Blob creation failed in canvas.toBlob.');
                            showNotification('Error al procesar la imagen de portada (blob nulo)', 'error');
                            ocultarPreviewPortada();
                        }
                    }, 'image/jpeg', 0.8);
                }; // Closes img.onload
                // Iniciar la carga de la imagen para activar img.onload
                img.src = event.target.result;
            }; // Closes reader.onload
        
        reader.readAsDataURL(file); // Correctly trigger reader.onload to process the selected cover image
    }); // End of fotoInput.addEventListener('change', ...)
} // End of if (fotoInput && portadaSeleccionada)

// --- Start of new/corrected code for main file handling ---

// Función para validar el archivo principal de la publicación
function validarArchivo(archivo) {
    // Validar tamaño (máximo 50MB)
    if (archivo.size > MAX_TAMANO_MB * 1024 * 1024) {
        showNotification(`El archivo "${archivo.name}" supera el tamaño máximo de ${MAX_TAMANO_MB}MB.`, 'error');
        return false;
    }

    const fileName = archivo.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

    // Check if it's an HTML file by extension
    if (ALLOWED_MAIN_FILE_TYPES.extensions.includes(fileExtension) && fileExtension === '.html') {
        return true;
    }
    // Check if it's an allowed compressed file type by extension
    if (ALLOWED_MAIN_FILE_TYPES.extensions.includes(fileExtension) && fileExtension !== '.html') {
        return true;
    }
    
    showNotification(`Tipo de archivo no permitido: "${fileName}". Solo se aceptan HTML (.html) o archivos comprimidos (${ALLOWED_MAIN_FILE_TYPES.extensions.join(', ')}).`, 'error');
    return false;
}

// Manejar la selección de archivos principales
function manejarSeleccionArchivos(archivosNuevos) {
    const inputArchivosElement = document.getElementById('archivos');
    archivosSeleccionados.length = 0; // Limpiar previos, solo permitimos uno

    if (archivosNuevos.length === 0) {
        if (inputArchivosElement) inputArchivosElement.value = ''; 
        actualizarListaArchivos();
        return;
    }

    if (archivosNuevos.length > MAX_ARCHIVOS_PRINCIPALES) {
        showNotification(`Solo puedes seleccionar ${MAX_ARCHIVOS_PRINCIPALES} archivo principal. Se procesará el primero.`, 'warning');
    }

    const archivo = archivosNuevos[0]; 

    if (validarArchivo(archivo)) {
        archivosSeleccionados.push({ file: archivo, id: Date.now() + Math.random().toString(36).substring(2) });
    } else {
        if (inputArchivosElement) {
            inputArchivosElement.value = ''; // Clear input if validation fails
        }
    }
    actualizarListaArchivos();
}

// Configurar el input de archivos
if (inputArchivos) {
    inputArchivos.addEventListener('change', function (e) {
        manejarSeleccionArchivos(Array.from(e.target.files));
    });
}

// Configurar la zona de arrastrar y soltar (drop zone)
if (dropZone) {
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropZone.classList.add('highlight');
    }

    function unhighlight() {
        dropZone.classList.remove('highlight');
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    dropZone.addEventListener('drop', function (e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        manejarSeleccionArchivos(Array.from(files));
    }, false);
}

// Función para actualizar la lista visual de archivos seleccionados
function actualizarListaArchivos() {
    if (!contenedorArchivos) return;
    contenedorArchivos.innerHTML = ''; 

    if (archivosSeleccionados.length === 0) {
        contenedorArchivos.innerHTML = '<p class="no-files">Ningún archivo principal seleccionado.</p>';
        return;
    }

    const lista = document.createElement('ul');
    lista.className = 'lista-archivos';

    archivosSeleccionados.forEach((archivoObj, index) => {
        const item = document.createElement('li');
        item.className = 'archivo-item';

        const icono = document.createElement('span');
        icono.className = 'icono-archivo';
        icono.innerHTML = obtenerIconoPorTipo(archivoObj.file); 

        const infoContainer = document.createElement('div');
        infoContainer.className = 'archivo-info';

        const nombre = document.createElement('span');
        nombre.className = 'nombre-archivo';
        nombre.textContent = archivoObj.file.name;

        const tamano = document.createElement('span');
        tamano.className = 'tamano-archivo';
        tamano.textContent = formatFileSize(archivoObj.file.size);

        const eliminarBtn = document.createElement('button');
        eliminarBtn.type = 'button';
        eliminarBtn.className = 'btn-eliminar';
        eliminarBtn.innerHTML = '<i class="fas fa-times"></i>';
        eliminarBtn.title = 'Eliminar archivo';
        eliminarBtn.onclick = function() { 
            archivosSeleccionados.splice(index, 1); 
            if (inputArchivos) inputArchivos.value = ''; 
            actualizarListaArchivos(); 
        };
        
        infoContainer.appendChild(nombre);
        infoContainer.appendChild(tamano);

        item.appendChild(icono);
        item.appendChild(infoContainer);
        item.appendChild(eliminarBtn);

        lista.appendChild(item);
    });
    contenedorArchivos.appendChild(lista);
}

// Función para obtener el ícono según el tipo de archivo
function obtenerIconoPorTipo(file) { 
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (extension === '.html') return '<i class="fas fa-file-code"></i>'; 
    if (ALLOWED_MAIN_FILE_TYPES.extensions.includes(extension) && extension !== '.html') return '<i class="fas fa-file-archive"></i>'; 
    
    return '<i class="fas fa-file"></i>'; // Default icon
}

// Función para formatear el tamaño del archivo
function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Función para manejar el envío del formulario
async function manejarEnvioFormulario() {
    console.log('manejarEnvioFormulario called'); // DEBUG
    const tituloInput = document.getElementById('titulo');
    const descripcionInput = document.getElementById('descripcion');
    const siguienteBtn = document.getElementById('siguienteBtn');

    const titulo = tituloInput ? tituloInput.value.trim() : '';
    const descripcion = descripcionInput ? descripcionInput.value.trim() : '';

    console.log('Valores para validación:', { titulo, descripcion }); // DEBUG
    if (!titulo || !descripcion) {
        showNotification('Por favor, completa el título y descripción.', 'error');
        return;
    }

    if (archivosSeleccionados.length === 0) {
        showNotification('Debes seleccionar un archivo principal para la publicación.', 'error');
        return;
    }

    const originalBtnText = siguienteBtn?.textContent;
    if (siguienteBtn) {
        siguienteBtn.disabled = true;
        siguienteBtn.textContent = 'Procesando...';
    }

    try {
        let id_autor = null;
        try {
            const idLogeado = localStorage.getItem('idLogeado');
            if (idLogeado) {
                id_autor = idLogeado;
            } else {
                const userDataString = localStorage.getItem('userData');
                if (userDataString) {
                    const userData = JSON.parse(userDataString);
                    if (userData && userData.id) {
                        id_autor = userData.id;
                    }
                }
            }
        } catch (e) {
            console.error('Error al obtener ID del autor de localStorage:', e);
            // Do not rethrow here, let the !id_autor check handle it to show a user-friendly message
        }

        if (!id_autor) {
            showNotification('Error: No se pudo obtener el ID del autor. Por favor, inicia sesión de nuevo.', 'error');
            throw new Error('ID de autor no encontrado'); // This will be caught by the outer catch
        }

        const formData = new FormData();
        formData.append('id_autor', id_autor);
        // Use the title as the publication name since we don't have a separate field for it
        formData.append('nombre', titulo); // Using titulo as nombre since there's no separate field
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);

        // Append the main publication file (it's an object {file: File, id: string})
        if (archivosSeleccionados.length > 0 && archivosSeleccionados[0].file) {
            formData.append('archivos', archivosSeleccionados[0].file, archivosSeleccionados[0].file.name);
        }
        // Append the cover image (it's a Blob)
        if (imagenPortada) { 
            formData.append('imagenPortada', imagenPortada, 'portada.jpg'); 
        }

        const response = await fetch('/node/upload/publicacion', {
            method: 'POST',
            body: formData, // No 'Content-Type' header, browser sets it for FormData with boundary
        });

        const dataPublicacion = await response.json();

        if (!response.ok) {
            throw new Error(dataPublicacion.message || dataPublicacion.error || `Error del servidor: ${response.status}`);
        }

        if (dataPublicacion.error) { // Check for specific error field from backend
            throw new Error(dataPublicacion.error);
        }
        
        showNotification('Publicación y archivos subidos con éxito. Redirigiendo para añadir etiquetas...', 'success');
        
        const idPublicacionCreada = dataPublicacion.publicacion?.id;
        const archivosSubidosBackend = dataPublicacion.publicacion?.archivos || []; 
        const portadaUrlBackend = dataPublicacion.publicacion?.imagen_portada_url || '';
    // }); // This was the original position of the DOMContentLoaded closer from manejarEnvioFormulario's old structure
    // It seems the actual DOMContentLoaded that starts at line 20 is the one that needs closing.
    // The following lines are part of manejarEnvioFormulario and should be inside it.

        const params = new URLSearchParams();
        if (idPublicacionCreada) {
            params.append('id_publicacion', idPublicacionCreada);
        }
        params.append('titulo', encodeURIComponent(titulo)); 
        params.append('descripcion', encodeURIComponent(descripcion));

        if (portadaUrlBackend) {
             params.append('imagenPortadaUrl', portadaUrlBackend);
        }
        if (archivosSubidosBackend.length > 0 && archivosSubidosBackend[0].filename) {
            params.append('archivoPrincipalUrl', `/node/uploads/publicaciones/${archivosSubidosBackend[0].filename}`);
        }
        
        setTimeout(() => {
            window.location.href = `publicarTags.html?${params.toString()}`;
        }, 1500);

    } catch (error) {
        console.error('Error al procesar la publicación:', error);
        showNotification(`Error al publicar: ${error.message}`, 'error');
        if (siguienteBtn && originalBtnText !== undefined) {
            siguienteBtn.disabled = false;
            siguienteBtn.textContent = originalBtnText;
        }
    }
} // End of manejarEnvioFormulario

// The DOMContentLoaded listener that starts near the top of the file (line 20) needs to be closed.
// It seems the event listener for 'siguienteBtn' inside 'manejarEnvioFormulario' was intended to be part of a different DOMContentLoaded, 
// or 'manejarEnvioFormulario' itself was not meant to be inside the main DOMContentLoaded.
// For now, assuming 'manejarEnvioFormulario' and other functions are correctly defined within the main DOMContentLoaded scope.

// Re-add the event listener setup for 'siguienteBtn' that was previously part of a DOMContentLoaded block at the end of manejarEnvioFormulario
// This should be within the main DOMContentLoaded that starts at line 20.
    const siguienteBoton = document.getElementById('siguienteBtn');
    console.log('Attempting to find siguienteBtn:', siguienteBoton); // DEBUG 
    if (siguienteBoton) {
        console.log('siguienteBtn found, adding event listener.'); // DEBUG
        siguienteBoton.addEventListener('click', async function(e) {
            console.log('siguienteBtn clicked!'); // DEBUG
            e.preventDefault(); 
            await manejarEnvioFormulario();
        });
    }
    
    actualizarListaArchivos(); 
    ocultarPreviewPortada();

}); // Closes the main document.addEventListener('DOMContentLoaded', function () { from line 20
