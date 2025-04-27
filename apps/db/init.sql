-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-04-2025 a las 13:19:53
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pfc-bbdd`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicacion`
--

CREATE TABLE `publicacion` (
  `id` int(10) NOT NULL,
  `id_autor` int(10) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`descripcion`)),
  `archivo` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(10) NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(20) NOT NULL,
  `NPublicaciones` int(10) NOT NULL,
  `foto_perfil` varchar(1000) NOT NULL,
  `foto_banner` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `email`, `password`, `NPublicaciones`, `foto_perfil`, `foto_banner`) VALUES
(1, 'Isaac', 'sdaniel9391@gmail.com', 'abc123', 1, '', ''),
(13, 'Daniel', 'danielmarek@gmail.com', 'Abc123', 0, '', ''),
(15, 'Juanvi', 'juanvi@gmail.com', 'Abc123', 0, '', ''),
(16, 'Paula', 'paulagradzikiewikz@gmail.com', 'Abc123', 0, '', ''),
(17, 'Cartier', 'lukas.gradzikiewikz@gmail.com', 'Abc123', 0, '', ''),
(18, 'Julius', 'juliusyeah@gmail.com', 'Abc123', 0, '', ''),
(19, 'Leandro', 'leandroutz93@gmail.com', 'Abc123', 0, '', ''),
(20, 'Roberto', 'roberto@gmail.com', 'Abc123', 0, './img/perfil/perfil_default.png', './img/perfil/banner_default.png'),
(21, 'Pandorito', 'leandroutz@gmail.com', 'Abc123', 0, './img/perfil/perfil_default.png', './img/perfil/banner_default.png'),
(22, 'Sebas', 'ssebas99@gmail.com', 'Abc123', 0, './img/perfil/perfil_default.png', './img/perfil/banner_default.png'),
(23, 'Viorel', 'viorelena9391@yahoo.com', 'Abc123', 0, './img/perfil/perfil_default.png', './img/perfil/banner_default.png');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `publicacion`
--
ALTER TABLE `publicacion`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
