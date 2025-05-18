const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const app = express();
const PORT = 3000;

const cors = require('cors');

// Configure multer for handling file uploads
// Create uploads directory if it doesn't exist
const uploadDir = '/app/uploads';
try {
    if (!fs.existsSync(uploadDir)) {
        console.log('Creating upload directory:', uploadDir);
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
    }
    console.log('Upload directory exists:', uploadDir);
    console.log('Directory contents:', fs.readdirSync(uploadDir));
} catch (err) {
    console.error('Error creating upload directory:', err);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

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
app.use('/node/uploads', (req, res, next) => {
    console.log('Accessing file:', req.url);
    console.log('Full path:', '/app/uploads/' + req.url.split('/').pop());
    console.log('File exists:', fs.existsSync('/app/uploads/' + req.url.split('/').pop()));
    console.log('Directory contents:', fs.readdirSync('/app/uploads'));
    serveUploads(req, res, next);
});

// Keep this for backward compatibility
app.use('/uploads', serveUploads);

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
    res.json({ 
        success: true,
        fileUpdated: true,
        filePath: `/node/uploads/${req.file.filename}`
    });
};

app.post('/node/upload/profile', upload.single('profileImage'), handleProfileUpload);
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
    res.json({ 
        success: true,
        fileUpdated: true,
        filePath: `/node/uploads/${req.file.filename}`
    });
};

app.post('/node/upload/banner', upload.single('bannerImage'), handleBannerUpload);
app.post('/upload/banner', upload.single('bannerImage'), handleBannerUpload);

// Follower endpoints
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

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