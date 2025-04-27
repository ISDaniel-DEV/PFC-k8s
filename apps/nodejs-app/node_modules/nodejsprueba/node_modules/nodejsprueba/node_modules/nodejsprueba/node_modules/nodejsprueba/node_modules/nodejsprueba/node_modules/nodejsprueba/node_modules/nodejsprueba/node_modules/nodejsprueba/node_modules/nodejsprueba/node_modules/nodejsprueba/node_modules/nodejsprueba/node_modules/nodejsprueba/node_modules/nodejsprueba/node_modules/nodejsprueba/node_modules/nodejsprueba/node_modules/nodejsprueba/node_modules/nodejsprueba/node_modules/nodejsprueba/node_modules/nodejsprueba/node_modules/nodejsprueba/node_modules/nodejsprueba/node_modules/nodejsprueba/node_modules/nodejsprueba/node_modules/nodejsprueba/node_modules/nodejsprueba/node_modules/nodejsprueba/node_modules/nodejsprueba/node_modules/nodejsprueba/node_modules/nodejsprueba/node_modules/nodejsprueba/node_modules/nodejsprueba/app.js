const fs = require('fs');

const express = require('express');
const app = express();
const PORT = 3000;

const cors = require('cors');

// Allow requests from Spring Boot's origin (http://localhost:8888)
app.use(cors({
  origin: 'http://localhost:8080', // Your Spring Boot server's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Crear un objeto JSON con schema ya hecho y array vacio
const schema = JSON.stringify({
    seguidores: [],
    seguidos: []
});

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/tshirt', (req, res) => {
    res.send('Hello World!');
} );

app.post('/tshirt/:id', (req, res) => {
    const { id } = req.params;
    const { logo } = req.body;

    if (!logo) {
        res.status(418).send({message:'Logo is required'});
    }

    res.send({ tshirt: `T-shirt with ID ${id} and logo ${logo} created`});
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