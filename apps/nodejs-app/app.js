const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');
const publicacionController = require('./controllers/publicacionController');
const db = require('./db'); // Database connection pool, used for /node/publicaciones and other direct DB interactions

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON and URL-encoded bodies with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// Serve static files from the 'uploads' directory (e.g., for publication files and cover images)
// This will map URL paths like /uploads/portadas/* to files in ./uploads/portadas/*
// and /uploads/publicaciones/* to files in ./uploads/publicaciones/*
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test endpoint
app.get('/node/test', (req, res) => {
    res.json({ 
        message: 'Node.js service is working!', 
        timestamp: new Date(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Create a router for the /node path
const nodeRouter = express.Router({ mergeParams: true });

// Mount the node router at /node
app.use('/node', nodeRouter);

// Rutas de publicaciones
app.get('/api/publicaciones', publicacionController.obtenerPublicaciones);
app.get('/api/publicaciones/:id', publicacionController.obtenerPublicacionPorId);
app.post('/api/publicaciones', publicacionController.crearPublicacion);
app.put('/api/publicaciones/:id', publicacionController.actualizarPublicacion);
app.delete('/api/publicaciones/:id', publicacionController.eliminarPublicacion);


// Configure multer for handling file uploads
// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
const publicacionesDir = path.join(uploadDir, 'publicaciones');
const portadasDir = path.join(uploadDir, 'portadas');

try {
    console.log(`Ensuring directory exists: ${publicacionesDir}`);
    fs.mkdirSync(publicacionesDir, { recursive: true });
    console.log(`Successfully ensured directory: ${publicacionesDir}`);

    console.log(`Ensuring directory exists: ${portadasDir}`);
    fs.mkdirSync(portadasDir, { recursive: true });
    console.log(`Successfully ensured directory: ${portadasDir}`);

    console.log('Final check - Contents of', uploadDir, ':', fs.readdirSync(uploadDir));
    
    if (fs.existsSync(publicacionesDir)) {
        console.log('Contents of', publicacionesDir, ':', fs.readdirSync(publicacionesDir));
    } else {
        console.error('ERROR:', publicacionesDir, 'was NOT created.');
    }
    
    if (fs.existsSync(portadasDir)) {
        console.log('Contents of', portadasDir, ':', fs.readdirSync(portadasDir));
    } else {
        console.error('ERROR:', portadasDir, 'was NOT created.');
    }

} catch (err) {
    console.error('CRITICAL ERROR during upload directory creation process:', err);
}

// Configuración común para todos los tipos de archivo
const fileFilter = (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-zip-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no soportado: ${file.mimetype}. Solo se permiten imágenes, documentos y archivos comprimidos.`), false);
    }
};

// Specific file filter for publication uploads (main file and cover image)
const publicationFileFilter = (req, file, cb) => {
    const allowedMainFileMimeTypes = [
        'text/html',
        'application/zip',
        'application/x-rar-compressed', 'application/vnd.rar',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip', 'application/x-gzip',
        'application/x-zip-compressed',
        'application/x-compressed'
    ];
    const allowedCoverImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.fieldname === 'archivos') {
        if (allowedMainFileMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.error(`[publicationFileFilter] Rechazado archivo principal '${file.originalname}' (tipo: ${file.mimetype}). Permitidos: HTML, ZIP, RAR, 7z, TAR, GZ`);
            cb(new Error(`Tipo de archivo no permitido para la publicación principal: ${file.mimetype}. Solo se aceptan HTML o archivos comprimidos (zip, rar, 7z, tar, gz).`), false);
        }
    } else if (file.fieldname === 'imagenPortada') {
        if (allowedCoverImageMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.error(`[publicationFileFilter] Rechazada imagen de portada '${file.originalname}' (tipo: ${file.mimetype}). Permitidos: JPEG, PNG, GIF, WEBP`);
            cb(new Error(`Tipo de archivo no permitido para la imagen de portada: ${file.mimetype}. Solo se aceptan imágenes (jpeg, png, gif, webp).`), false);
        }
    } else {
        console.warn(`[publicationFileFilter] Campo de archivo desconocido: ${file.fieldname}`);
        cb(new Error(`Campo de archivo inesperado en publicationFileFilter: ${file.fieldname}`), false);
    }
};

// Configuración de almacenamiento para archivos de perfil/banner
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Usar el directorio de uploads que está montado en /app/uploads
        cb(null, '/app/uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Configuración de almacenamiento para archivos de publicaciones
const publicacionStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/app/public/uploads/publicaciones');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Configuración de almacenamiento para imágenes de portada
const portadaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/app/public/uploads/portadas');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Configuración de multer para imágenes de portada
const uploadPortada = multer({ 
    storage: portadaStorage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 50 * 1024 * 1024, // 50MB max file size
        files: 1 // Solo un archivo por solicitud
    }
}).single('imagen');

// Configuración de multer para archivos de publicación
const uploadPublicacion = multer({
    storage: publicacionStorage, // This saves to /app/public/uploads/publicaciones
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB por archivo
    }
});

// Separate multer for cover image, saving to a different path if needed, or use fields
const uploadPublicationFields = multer({
    storage: multer.diskStorage({ // Define storage inline or use a shared one if appropriate
        destination: function (req, file, cb) {
            if (file.fieldname === "imagenPortada") {
                cb(null, portadasDir); // Save cover images to portadas
            } else if (file.fieldname === "archivos") {
                cb(null, publicacionesDir); // Save main files to publicaciones
            } else {
                cb(new Error('Unexpected fieldname'), null);
            }
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    }),
    fileFilter: publicationFileFilter, // Use the new specific filter
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit per file
    }
}).fields([
    { name: 'archivos', maxCount: 1 }, // Only 1 main file allowed
    { name: 'imagenPortada', maxCount: 1 }
]);

// Configuración de multer para subir archivos de perfil/banner
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB por archivo
        files: 1 // Solo un archivo por solicitud
    }
});

// Allow requests from all origins in development
app.use(cors());

// Crear un objeto JSON con schema ya hecho y array vacio
const schema = JSON.stringify({
    seguidores: [],
    seguidos: []
});

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve uploaded files
// Serve static files with debug logging
const serveUploads = express.static('/app/uploads');
const servePortadas = express.static('/app/uploads/portadas');

// Serve files from the main uploads directory
app.use('/node/uploads', (req, res, next) => {
    console.log('Accessing file:', req.url);
    const filePath = path.join('/app/uploads', req.url);
    console.log('Full path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    // Check if the request is for a file in the portadas directory
    if (req.url.startsWith('/portadas/')) {
        return servePortadas(req, res, next);
    }
    
    serveUploads(req, res, next);
});

// Keep this for backward compatibility
app.use('/uploads', serveUploads);

// Serve portadas directory directly
// Serve static files from uploads directory
app.use('/node/uploads', express.static('/app/uploads'));

// Create a route to serve portadas
app.get('/portadas/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(portadasDir, filename));
});

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Log static file requests
app.use((req, res, next) => {
    if (req.url.startsWith('/node/uploads/') || req.url.startsWith('/uploads/')) {
        console.log('Static file request:', req.url);
        console.log('File exists:', fs.existsSync('/app/uploads/' + req.url.split('/').pop()));
        console.log('Directory contents:', fs.readdirSync('/app/uploads'));
    }
    next();
});

const handleProfileUpload = (req, res) => {
    console.log('Profile upload request received');
    console.log('File:', req.file);
    if (!req.file) {
        // No file uploaded, but that's okay
        return res.json({ 
            success: true,
            fileUpdated: false
        });
    }
    // req.file.path is the full path where multer saved the file, e.g., /app/uploads/123.png
    // req.file.filename is just the filename, e.g., 123.png
    const serverFilePath = req.file.path; 
    
    console.log('Profile/Banner file uploaded by Multer. Original filename:', req.file.originalname, 'Saved as:', req.file.filename, 'At path:', serverFilePath);

    // Verificar si el archivo existe inmediatamente después de Multer
    if (fs.existsSync(serverFilePath)) {
        console.log(`File ${serverFilePath} EXISTS on server immediately after upload.`);
        try {
            const dirContents = fs.readdirSync(path.dirname(serverFilePath));
            console.log(`Contents of ${path.dirname(serverFilePath)} after upload:`, dirContents);
        } catch (e) {
            console.error(`Error reading directory ${path.dirname(serverFilePath)} after upload:`, e);
        }
    } else {
        console.error(`File ${serverFilePath} DOES NOT exist on server immediately after upload.`);
        // Attempt to list contents of the target directory anyway to see if it's empty or has other files
        try {
            const targetUploadDir = '/app/uploads'; // This is where files should be
            if (fs.existsSync(targetUploadDir)) {
                const dirContents = fs.readdirSync(targetUploadDir);
                console.log(`Contents of ${targetUploadDir} (expected uploads dir) after failed check for ${serverFilePath}:`, dirContents);
            } else {
                console.error(`${targetUploadDir} (expected uploads dir) does not exist.`);
            }
        } catch (e) {
            console.error(`Error reading directory ${'/app/uploads'} after failed check:`, e);
        }
    }

    const clientAccessPath = `/node/uploads/${req.file.filename}`; // Path for client to access via Nginx proxy
    console.log('Intended client access path:', clientAccessPath);
    
    res.json({ 
        success: true,
        fileUpdated: true,
        filePath: clientAccessPath 
    });
};

nodeRouter.post('/upload/profile', upload.single('profileImage'), handleProfileUpload);
app.post('/upload/profile', upload.single('profileImage'), handleProfileUpload);

const handleBannerUpload = (req, res) => {
    console.log('Banner upload request received');
    console.log('File:', req.file);
    if (!req.file) {
        // No file uploaded, but that's okay
        return res.json({ 
            success: true,
            fileUpdated: false
        });
    }
    // req.file.path is the full path where multer saved the file, e.g., /app/uploads/123.png
    // req.file.filename is just the filename, e.g., 123.png
    const serverFilePath = req.file.path; 
    
    console.log('Profile/Banner file uploaded by Multer. Original filename:', req.file.originalname, 'Saved as:', req.file.filename, 'At path:', serverFilePath);

    // Verificar si el archivo existe inmediatamente después de Multer
    if (fs.existsSync(serverFilePath)) {
        console.log(`File ${serverFilePath} EXISTS on server immediately after upload.`);
        try {
            const dirContents = fs.readdirSync(path.dirname(serverFilePath));
            console.log(`Contents of ${path.dirname(serverFilePath)} after upload:`, dirContents);
        } catch (e) {
            console.error(`Error reading directory ${path.dirname(serverFilePath)} after upload:`, e);
        }
    } else {
        console.error(`File ${serverFilePath} DOES NOT exist on server immediately after upload.`);
        // Attempt to list contents of the target directory anyway to see if it's empty or has other files
        try {
            const targetUploadDir = '/app/uploads'; // This is where files should be
            if (fs.existsSync(targetUploadDir)) {
                const dirContents = fs.readdirSync(targetUploadDir);
                console.log(`Contents of ${targetUploadDir} (expected uploads dir) after failed check for ${serverFilePath}:`, dirContents);
            } else {
                console.error(`${targetUploadDir} (expected uploads dir) does not exist.`);
            }
        } catch (e) {
            console.error(`Error reading directory ${'/app/uploads'} after failed check:`, e);
        }
    }

    const clientAccessPath = `/node/uploads/${req.file.filename}`; // Path for client to access via Nginx proxy
    console.log('Intended client access path:', clientAccessPath);
    
    res.json({ 
        success: true,
        fileUpdated: true,
        filePath: clientAccessPath 
    });
};

nodeRouter.post('/upload/banner', upload.single('bannerImage'), handleBannerUpload);
app.post('/upload/banner', upload.single('bannerImage'), handleBannerUpload);

// Middleware para manejar errores de Multer
const handleMulterErrors = (err, req, res, next) => {
    if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                error: `El archivo es demasiado grande. Tamaño máximo permitido: ${err.limit / (1024 * 1024)}MB`
            });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: `Demasiados archivos. Máximo permitido: ${err.limit}`
            });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: `Campo de archivo inesperado: ${err.field}`
            });
        } else if (err.message) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Error al procesar el archivo',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    next();
};

// Endpoint to get all publications for the index page
// Endpoint to get all publications for the index page
nodeRouter.get('/publicaciones', async (req, res) => {
    console.log('=== Solicitud para obtener todas las publicaciones ===');
    try {
        const query = `
            SELECT
                p.id,
                p.titulo,
                p.descripcion,
                p.archivo,         -- Main file filename
                p.imagen_portada,  -- Cover image filename
                u.nombre AS autor_nombre,
                p.id_autor
            FROM
                publicacion p
            JOIN
                usuario u ON p.id_autor = u.id
            ORDER BY
                p.id DESC;
        `;
        const [publicaciones] = await db.query(query);

        const publicacionesConUrlCompleta = publicaciones.map(pub => {
            let fullImageUrl = null;
            const host = req.get('host'); // Get host once
            const protocol = req.protocol; // Get protocol once

            if (pub.imagen_portada) { // Prioritize imagen_portada
                const basePath = `${protocol}://${host}/node/uploads/portadas`;
                fullImageUrl = `${basePath}/${pub.imagen_portada.replace(/^\/+/, '')}`;
            } else if (pub.archivo) { // Fallback to pub.archivo if imagen_portada is null and archivo exists
                const basePath = `${protocol}://${host}/node/uploads/publicaciones`;
                let filename = pub.archivo;
                // Remove "uploads/publicaciones/" prefix if it accidentally got included in the stored filename
                if (filename.startsWith('uploads/publicaciones/')) {
                    filename = filename.substring('uploads/publicaciones/'.length);
                }
                // Remove any remaining leading slashes from the filename itself
                filename = filename.replace(/^\/+/, '');
                fullImageUrl = `${basePath}/${filename}`;
            }

            return {
                id: pub.id,
                titulo: pub.titulo,
                descripcion: pub.descripcion,
                autor_nombre: pub.autor_nombre,
                id_autor: pub.id_autor,
                imagen_url: fullImageUrl, // This will be the URL for the <img> tag
                // archivo: pub.archivo, // Keep original filenames if needed by frontend
                // imagen_portada: pub.imagen_portada // Keep original filenames if needed by frontend
            };
        });

        res.status(200).json(publicacionesConUrlCompleta);
    } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener publicaciones.', error: error.message });
    }
});

// Endpoint para subir publicación con portada y archivos
nodeRouter.post('/upload/publicacion', (req, res, next) => {
    console.log('=== Iniciando subida de publicación con portada y archivos ===');

    uploadPublicationFields(req, res, async function(err) {
        if (err) {
            console.error('Error de Multer al subir archivos:', err);
            let errorMessage = 'Error al subir archivos.';
            if (err.code === 'LIMIT_FILE_SIZE') {
                errorMessage = 'El archivo es demasiado grande.';
            } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                errorMessage = 'Tipo de archivo inesperado o demasiados archivos.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            return res.status(400).json({
                success: false,
                error: errorMessage
            });
        }

        console.log('req.files al inicio de /upload/publicacion:', JSON.stringify(req.files, null, 2));
        if (err) {
            console.error('Error en multer uploadPublicationFields:', err);
            // Pass error to the generic multer error handler or a specific one if defined after this route
            return next(err); 
        }

        const { id_autor, nombre, titulo, descripcion } = req.body;

        // Validar datos del body
        if (!id_autor || !titulo || !descripcion ) { // 'nombre' podría ser opcional o derivado
            // Limpiar archivos subidos si faltan datos del body
            if (req.files) {
                if (req.files.archivos) req.files.archivos.forEach(f => fs.unlink(f.path, e => e && console.error(`Error eliminando archivo ${f.path}:`, e)));
                if (req.files.imagenPortada) req.files.imagenPortada.forEach(f => fs.unlink(f.path, e => e && console.error(`Error eliminando portada ${f.path}:`, e)));
            }
            return res.status(400).json({
                success: false,
                error: 'Faltan datos obligatorios de la publicación (id_autor, titulo, descripcion). El campo nombre es opcional.',
                receivedFields: req.body
            });
        }
        
        const archivosPrincipales = req.files && req.files.archivos ? req.files.archivos : [];
        const archivoPortadaFile = req.files && req.files.imagenPortada ? req.files.imagenPortada[0] : null;

        const archivoRuta = archivosPrincipales.length > 0 ? archivosPrincipales[0].filename : null;
        const portadaRuta = archivoPortadaFile ? archivoPortadaFile.filename : null;
        
        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            // Asegúrate que 'nombre' (el campo de la tabla) puede ser NULL si no se provee o es opcional.
            // Si 'nombre' es obligatorio en la tabla, debes asegurar que req.body.nombre tiene valor.
            const publicacionNombre = nombre || null; // Si nombre no viene en el body, se inserta NULL (si la tabla lo permite)

            const [result] = await connection.execute(
                'INSERT INTO publicacion (id_autor, nombre, titulo, descripcion, archivo, imagen_portada) VALUES (?, ?, ?, ?, ?, ?)',
                [id_autor, publicacionNombre, titulo, descripcion, archivoRuta, portadaRuta]
            );
            const publicacionId = result.insertId;

            await connection.commit();
            res.status(201).json({
                success: true,
                message: 'Publicación creada y archivos subidos correctamente.',
                publicacion: {
                    id: publicacionId,
                    id_autor: parseInt(id_autor),
                    nombre: publicacionNombre,
                    titulo: titulo,
                    descripcion: descripcion,
                    archivo_url: archivoRuta ? `/uploads/publicaciones/${archivoRuta}` : null,
                    imagen_portada_url: portadaRuta ? `/uploads/portadas/${portadaRuta}` : null
                }
            });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error al guardar la publicación en la base de datos:', error);
            // Limpiar archivos subidos en caso de error en DB
            if (req.files) {
                if (req.files.archivos) req.files.archivos.forEach(f => fs.unlink(f.path, e => e && console.error(`Error eliminando archivo ${f.path} tras error DB:`, e)));
                if (req.files.imagenPortada) req.files.imagenPortada.forEach(f => fs.unlink(f.path, e => e && console.error(`Error eliminando portada ${f.path} tras error DB:`, e)));
            }
            // Evitar enviar detalles del error de SQL al cliente en producción
            const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Error al guardar la publicación.';
            res.status(500).json({ success: false, error: errorMessage });
        } finally {
            if (connection) connection.release();
        }
    });
});

// Middleware para manejar errores de Multer (debe estar después de las rutas que usan Multer o ser global)
// Este ya está definido antes, así que las rutas de Multer lo usarán si llaman a next(err).
// nodeRouter.use(handleMulterErrors); // Si no está ya globalmente aplicado a nodeRouter

// Follower endpoints
// Endpoint to associate tags with a publication
nodeRouter.post('/publicaciones/:id/tags', async (req, res) => {
    const publicacionId = req.params.id;
    const { tags } = req.body; // Expecting { "tags": ["tag1", "tag2", ...] }

    console.log(`Attempting to associate tags for publication ID ${publicacionId}:`, tags);

    if (!publicacionId) {
        return res.status(400).json({ error: 'Publication ID is required.' });
    }
    if (!tags || !Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags array is required.' });
    }
    // Note: If you want to allow an empty tags array to, for example, clear existing tags,
    // this logic and the SQL operations would need to be adjusted.
    // For now, this assumes we are only adding tags.

    let connection;
    try {
        connection = await db.getConnection(); // Get a connection from the pool
        await connection.beginTransaction();
        console.log(`Transaction started for publication ID ${publicacionId} to associate tags.`);

        for (const tagName of tags) {
            if (typeof tagName !== 'string' || tagName.trim() === '') {
                console.warn(`Skipping invalid or empty tag name: '${tagName}' for publication ID ${publicacionId}`);
                continue; // Skip
            }

            const trimmedTagName = tagName.trim();
            // 1. Find or create tag
            let [existingTags] = await connection.execute(
                'SELECT id FROM tag WHERE nombre = ?', // Corrected: id, nombre
                [trimmedTagName]
            );
            let tagId;

            if (existingTags.length > 0) {
                tagId = existingTags[0].id; // Corrected: .id
                console.log(`Found existing tag '${trimmedTagName}' with ID ${tagId}`);
            } else {
                const [result] = await connection.execute(
                    'INSERT INTO tag (nombre) VALUES (?)', // Corrected: nombre
                    [trimmedTagName]
                );
                tagId = result.insertId;
                console.log(`Created new tag '${trimmedTagName}' with ID ${tagId}`);
            }

            // 2. Associate tag with publication
            // Using INSERT IGNORE to prevent errors if the association already exists.
            // This assumes your publicacion_tag table has a UNIQUE constraint on (publicacion_id, tag_id)
            // or that it's acceptable not to error if the link already exists.
            const [assocResult] = await connection.execute(
                'INSERT IGNORE INTO publicacion_tag (publicacion_id, tag_id) VALUES (?, ?)', // Corrected: publicacion_id, tag_id
                [publicacionId, tagId]
            );

            if (assocResult.affectedRows > 0) {
                console.log(`Associated tag ID ${tagId} ('${trimmedTagName}') with publication ID ${publicacionId}`);
            } else {
                console.log(`Association for tag ID ${tagId} ('${trimmedTagName}') and publication ID ${publicacionId} already exists or insert was ignored.`);
            }
        }

        await connection.commit();
        console.log(`Transaction committed successfully for publication ID ${publicacionId} tags.`);
        res.status(201).json({ success: true, message: 'Tags associated successfully with publication.' });

    } catch (error) {
        if (connection) {
            console.error(`Rolling back transaction for publication ID ${publicacionId} (tags) due to error.`);
            await connection.rollback();
        }
        console.error('Error associating tags with publication:', error);
        res.status(500).json({ error: 'Failed to associate tags with publication.', details: error.message });
    } finally {
        if (connection) {
            connection.release();
            console.log(`Connection released for publication ID ${publicacionId} (tags).`);
        }
    }
});


nodeRouter.post('/nuevoSeguidor/:id/:idSeguidor', (req, res) => {
    const { id, idSeguidor } = req.params;
    console.log(`Adding follower: ${idSeguidor} to user: ${id}`);
    
    try {
        // Create followers file if it doesn't exist
        const followersDir = '/app/followers';
        if (!fs.existsSync(followersDir)) {
            fs.mkdirSync(followersDir, { recursive: true });
        }
        
        const filePath = path.join(followersDir, `${id}.json`);
        let data = { seguidores: [], seguidos: [] };
        
        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        
        // Add follower if not already following
        if (!data.seguidores.includes(idSeguidor)) {
            data.seguidores.push(idSeguidor);
            fs.writeFileSync(filePath, JSON.stringify(data));
        }
        
        // Update the follower's 'seguidos' list
        const followerPath = path.join(followersDir, `${idSeguidor}.json`);
        let followerData = { seguidores: [], seguidos: [] };
        
        if (fs.existsSync(followerPath)) {
            followerData = JSON.parse(fs.readFileSync(followerPath, 'utf8'));
        }
        
        if (!followerData.seguidos.includes(id)) {
            followerData.seguidos.push(id);
            fs.writeFileSync(followerPath, JSON.stringify(followerData));
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding follower:', error);
        res.status(500).json({ error: 'Error adding follower' });
    }
});

app.post('/node/nuevoSeguidor/:id/:idSeguidor', (req, res) => {
    const { id, idSeguidor } = req.params;
    console.log(`Adding follower: ${idSeguidor} to user: ${id}`);
    
    try {
        // Create followers file if it doesn't exist
        const followersDir = '/app/followers';
        if (!fs.existsSync(followersDir)) {
            fs.mkdirSync(followersDir, { recursive: true });
        }
        
        const filePath = path.join(followersDir, `${id}.json`);
        let data = { seguidores: [], seguidos: [] };
        
        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        
        // Add follower if not already following
        if (!data.seguidores.includes(idSeguidor)) {
            data.seguidores.push(idSeguidor);
            fs.writeFileSync(filePath, JSON.stringify(data));
        }
        
        // Update the follower's 'seguidos' list
        const followerPath = path.join(followersDir, `${idSeguidor}.json`);
        let followerData = { seguidores: [], seguidos: [] };
        
        if (fs.existsSync(followerPath)) {
            followerData = JSON.parse(fs.readFileSync(followerPath, 'utf8'));
        }
        
        if (!followerData.seguidos.includes(id)) {
            followerData.seguidos.push(id);
            fs.writeFileSync(followerPath, JSON.stringify(followerData));
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding follower:', error);
        res.status(500).json({ error: 'Error adding follower' });
    }
});

app.post('/node/cantidadSeguidores/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Getting follower count for user: ${id}`);
    
    try {
        const followersDir = '/app/followers';
        const filePath = path.join(followersDir, `${id}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.json({ cantidadSeguidores: 0, cantidadSeguidos: 0 });
        }
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json({
            cantidadSeguidores: data.seguidores.length,
            cantidadSeguidos: data.seguidos.length
        });
    } catch (error) {
        console.error('Error getting follower count:', error);
        res.status(500).json({ error: 'Error getting follower count' });
    }
});

// Only start the server if this file is run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the app for testing or programmatic use
module.exports = app;

//Crear JSON

app.post('/crearJSON/:id/:tipo', (req, res) => {
    const id = req.params.id;
    const tipo = req.params.tipo; //tipo de json a crear, seguidos o publicaciones
    crearJSON(id, schema, tipo);

    res.send({message:'File created successfully!'});
});

app.post('/nuevoSeguidor/:id/:idSeguidor/:tipo', (req, res) => {
    const id = req.params.id;
    const idSeguidor = req.params.idSeguidor; 


    nuevoSeguidor(id, idSeguidor, tipo);

    res.send({message:'Follower added succesfully successfully!'});
});

app.post('/cantidadSeguidores/:id', (req, res) => {
    const id = req.params.id;
    leerJSON("./json/perfil/" + id + "perfil.json", (err, data) => {
        if (err) {
            console.log('Error reading file:', err);
        } else {
            console.log('Data after adding new follower:', data);
            let cantidadSeguidores = data.seguidores.length;
            let cantidadSeguidos = data.seguidos.length;
            console.log('Number of followers:', cantidadSeguidores);
            res.send({ cantidadSeguidores: cantidadSeguidores, cantidadSeguidos: cantidadSeguidos });
        }
    });
});

function crearJSON(id, contenido, tipo) {
    const filePath = "./json/"  +tipo+"/"  +  id  +  tipo  +  ".json"; 

    // Verificar si el archivo ya existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // El archivo no existe, crearlo
            fs.writeFile(filePath, contenido, (err) => {
                if (err) {
                    console.log('Error writing file:', err);
                } else {
                    console.log('File written successfully');
                }
            });
        } else {
            console.log('File already exists, no action taken.');
        }
    });
}

//Leer el archivo JSON existente
function leerJSON(rutaArchivo, callback) {
    fs.readFile(rutaArchivo, 'utf8', (error, datosArchivo) => {
        if (error) {
            console.error('Error al leer el archivo:', error);
            return callback(error);
        }

        try {
            const objetoJson = JSON.parse(datosArchivo);
            console.log('Datos JSON leídos:', objetoJson);
            return callback(null, objetoJson);
        } catch (errorParseo) {
            console.error('Error al analizar la cadena JSON:', errorParseo);
            return callback(errorParseo);
        }
    });
}



//Crear nuevo seguidor con id del creador y id del seguidor
function nuevoSeguidor(id, idSeguidor, tipo) {
    // Leer el archivo JSON existente
    leerJSON(id + "seguidos.json", (err, data) => {
        if (err) {
            console.log('Error reading file:', err);
        } else {
            // Agregar el nuevo objeto al array existente
            data.data.push(idSeguidor);
            // Escribir el array actualizado en el archivo JSON
            fs.writeFile("./json/"+tipo+ "/" + id + tipo + ".json", JSON.stringify(data, null, 2), (err) => {
                if (err) {
                    console.log('Error writing file:', err);
                } else {
                    console.log('File written successfully');
                }
            });
        }
    });
};

//Borrar seguidor con id del creador y id del seguidor
function borrarSeguidor(id, idSeguidor) {
    // Leer el archivo JSON existente
    leerJSON(id + "seguidos.json", (err, data) => {
        if (err) {
            console.log('Error reading file:', err);
        } else {
            // Filtrar el array para eliminar el objeto con el ID del seguidor
            data.data = data.data.filter(seguidor => seguidor.id !== idSeguidor);
            // Escribir el array actualizado en el archivo JSON
            fs.writeFile(id + "seguidos.json", JSON.stringify(data, null, 2), (err) => {
                if (err) {
                    console.log('Error writing file:', err);
                } else {
                    console.log('File written successfully');
                }
            });
        }
    });
};


//nuevoSeguidor(id, 7);


//borrarSeguidor(id, 7);

/*
fs.writeFile('newCustomer.json', JSON.stringify(newObject, null, 2), (err) => {
    if (err) {
        console.log('Error writing file:', err);
    } else {
        console.log('File written successfully');
    }

})
*/

/*
jsonReader(id +'seguidos.json', (err, data) => {
    if (err) {
        console.log('Error reading file:', err);
    } else {
        data.push(newObject);
        console.log('Updated data:', data);
        fs.writeFile(id + "seguidos.json", JSON.stringify(data, null, 2), (err) => {
            if (err) {
                console.log('Error writing file:', err);
            } else {
                console.log('File written successfully');
            }
        });
    }
});
*/