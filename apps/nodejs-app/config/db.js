const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.MYSQL_SERVICE_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar la conexión a la base de datos al iniciar
pool.getConnection()
    .then(connection => {
        console.log('Conexión exitosa a la base de datos MySQL');
        connection.release();
    })
    .catch(error => {
        console.error('Error al conectar a la base de datos MySQL:', error);
    });

module.exports = pool;
