-- Crear la tabla de tags si no existe
CREATE TABLE IF NOT EXISTS `tag` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Crear la tabla de relación entre publicaciones y tags si no existe
CREATE TABLE IF NOT EXISTS `publicacion_tag` (
  `publicacion_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  PRIMARY KEY (`publicacion_id`,`tag_id`),
  KEY `fk_publicacion_tag_tag` (`tag_id`),
  CONSTRAINT `fk_publicacion_tag_publicacion` FOREIGN KEY (`publicacion_id`) REFERENCES `publicacion` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_publicacion_tag_tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
