const db = require('../config/db');
const path = require('path');
const fs = require('fs').promises;

// Crear una nueva publicación
const crearPublicacion = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { titulo, descripcion, idAutor, tags } = req.body;
        const portada = req.files?.portada?.[0];
        const archivo = req.files?.archivo?.[0];
        
        // Ruta para el archivo principal
        let archivoPath = '';
        if (archivo) {
            archivoPath = `/uploads/publicaciones/${Date.now()}-${archivo.originalname}`;
            await fs.mkdir(path.dirname(path.join('public', archivoPath)), { recursive: true });
            await fs.rename(archivo.path, path.join('public', archivoPath));
        }

        // Insertar la publicación
        const [result] = await connection.query(
            'INSERT INTO publicacion (titulo, descripcion, id_autor, nombre, archivo) VALUES (?, ?, ?, ?, ?)',
            [titulo, descripcion, idAutor, titulo, archivoPath]
        );

        const idPublicacion = result.insertId;

        // Procesar tags si existen
        if (tags) {
            const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
            for (const tag of tagsArray) {
                // Insertar el tag si no existe
                const [tagResult] = await connection.query(
                    'INSERT IGNORE INTO tag (nombre) VALUES (?)',
                    [tag]
                );
                
                // Obtener el ID del tag
                const [tagRow] = await connection.query(
                    'SELECT id FROM tag WHERE nombre = ?',
                    [tag]
                );
                
                // Asociar el tag a la publicación
                if (tagRow.length > 0) {
                    await connection.query(
                        'INSERT INTO publicacion_tag (publicacion_id, tag_id) VALUES (?, ?)',
                        [idPublicacion, tagRow[0].id]
                    );
                }
            }
        }

        // Actualizar el contador de publicaciones del usuario
        await connection.query(
            'UPDATE usuario SET NPublicaciones = NPublicaciones + 1 WHERE id = ?',
            [idAutor]
        );

        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: 'Publicación creada exitosamente',
            id: idPublicacion
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al crear la publicación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la publicación',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Obtener todas las publicaciones
const obtenerPublicaciones = async (req, res) => {
    try {
        const [publicaciones] = await db.query(`
            SELECT p.*, u.nombre as autor, u.foto_perfil as autor_foto
            FROM publicacion p
            LEFT JOIN usuario u ON p.id_autor = u.id
            LEFT JOIN publicacion_tag pt ON p.id = pt.publicacion_id
            LEFT JOIN tag t ON pt.tag_id = t.id
            GROUP BY p.id
            ORDER BY p.id DESC
        `);

        // Procesar los resultados para convertir el string de tags en un array
        const publicacionesConTags = publicaciones.map(pub => ({
            ...pub,
            tags: pub.tags ? pub.tags.split(',').filter(tag => tag) : []
        }));

        res.json(publicacionesConTags);
    } catch (error) {
        console.error('Error al obtener publicaciones:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener publicaciones',
            error: error.message 
        });
    }
};

// Obtener una publicación por ID
const obtenerPublicacionPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener la publicación con información del autor y tags
        const [publicaciones] = await db.query(`
            SELECT p.*, u.nombre as autor, u.foto_perfil as autor_foto,
                   GROUP_CONCAT(DISTINCT t.nombre) as tags
            FROM publicacion p
            LEFT JOIN usuario u ON p.id_autor = u.id
            LEFT JOIN publicacion_tag pt ON p.id = pt.publicacion_id
            LEFT JOIN tag t ON pt.tag_id = t.id
            WHERE p.id = ?
            GROUP BY p.id
        `, [id]);
        
        if (publicaciones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }
        
        const publicacion = publicaciones[0];
        
        // Convertir el string de tags en un array
        publicacion.tags = publicacion.tags ? publicacion.tags.split(',').filter(tag => tag) : [];
        
        // Si hay un archivo, incluirlo en la respuesta
        if (publicacion.archivo) {
            publicacion.archivos = [{
                ruta: publicacion.archivo,
                nombre_archivo: publicacion.archivo.split('/').pop()
            }];
        } else {
            publicacion.archivos = [];
        }
        
        res.json(publicacion);
    } catch (error) {
        console.error('Error al obtener la publicación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la publicación',
            error: error.message
        });
    }
};

// Actualizar una publicación
const actualizarPublicacion = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        const { titulo, descripcion, tags } = req.body;
        const portada = req.files?.portada?.[0];
        const archivo = req.files?.archivo?.[0];
        
        // Verificar si la publicación existe
        const [publicaciones] = await connection.query(
            'SELECT * FROM publicacion WHERE id = ?',
            [id]
        );
        
        if (publicaciones.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }
        
        const publicacion = publicaciones[0];
        let archivoPath = publicacion.archivo;
        
        // Procesar archivo si se proporciona uno nuevo
        if (archivo) {
            // Eliminar archivo anterior si existe
            if (archivoPath) {
                try {
                    await fs.unlink(path.join('public', archivoPath));
                } catch (err) {
                    console.warn('No se pudo eliminar el archivo anterior:', err);
                }
            }
            
            // Subir nuevo archivo
            archivoPath = `/uploads/publicaciones/${Date.now()}-${archivo.originalname}`;
            await fs.mkdir(path.dirname(path.join('public', archivoPath)), { recursive: true });
            await fs.rename(archivo.path, path.join('public', archivoPath));
        }
        
        // Actualizar la publicación
        await connection.query(
            'UPDATE publicacion SET titulo = ?, descripcion = ?, archivo = ? WHERE id = ?',
            [titulo || publicacion.titulo, 
             descripcion || publicacion.descripcion,
             archivoPath,
             id]
        );
        
        // Procesar tags si se proporcionan
        if (tags) {
            // Eliminar tags existentes
            await connection.query(
                'DELETE FROM publicacion_tag WHERE publicacion_id = ?',
                [id]
            );
            
            const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
            
            for (const tag of tagsArray) {
                if (!tag) continue;
                
                // Insertar el tag si no existe
                await connection.query(
                    'INSERT IGNORE INTO tag (nombre) VALUES (?)',
                    [tag]
                );
                
                // Obtener el ID del tag y asociarlo a la publicación
                const [tagRow] = await connection.query(
                    'SELECT id FROM tag WHERE nombre = ?',
                    [tag]
                );
                
                if (tagRow.length > 0) {
                    await connection.query(
                        'INSERT IGNORE INTO publicacion_tag (publicacion_id, tag_id) VALUES (?, ?)',
                        [id, tagRow[0].id]
                    );
                }
            }
        }
        
        await connection.commit();
        
        res.json({
            success: true,
            message: 'Publicación actualizada correctamente'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar la publicación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la publicación',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Eliminar una publicación
const eliminarPublicacion = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        
        // Verificar si la publicación existe
        const [publicaciones] = await connection.query(
            'SELECT * FROM publicacion WHERE id = ?',
            [id]
        );
        
        if (publicaciones.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }
        
        const publicacion = publicaciones[0];
        
        // Eliminar archivo físico si existe
        if (publicacion.archivo) {
            try {
                await fs.unlink(path.join('public', publicacion.archivo));
            } catch (err) {
                console.warn(`No se pudo eliminar el archivo ${publicacion.archivo}:`, err);
            }
        }
        
        // Eliminar relaciones de tags
        await connection.query(
            'DELETE FROM publicacion_tag WHERE publicacion_id = ?',
            [id]
        );
        
        // Eliminar la publicación
        await connection.query(
            'DELETE FROM publicacion WHERE id = ?',
            [id]
        );
        
        // Actualizar contador de publicaciones del autor
        await connection.query(
            'UPDATE usuario SET NPublicaciones = NPublicaciones - 1 WHERE id = ?',
            [publicacion.id_autor]
        );
        
        await connection.commit();
        
        res.json({
            success: true,
            message: 'Publicación eliminada correctamente'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar la publicación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la publicación',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    crearPublicacion,
    obtenerPublicaciones,
    obtenerPublicacionPorId,
    actualizarPublicacion,
    eliminarPublicacion
};
