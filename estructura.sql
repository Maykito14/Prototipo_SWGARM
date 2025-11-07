-- ============================================================================
-- SWGARM - Sistema Web de Gestión de Adopción y Rescate de Mascotas
-- Script de Creación Completo de Base de Datos
-- Versión: 1.0 (Unificado con todas las actualizaciones)
-- ============================================================================
-- 
-- INSTRUCCIONES DE USO:
-- Ejecutar este script completo desde MySQL/MariaDB. El script creará
-- automáticamente la base de datos y todas las tablas necesarias.
-- 
-- Ejemplo de ejecución:
--   mysql -u root -p < estructura.sql
-- 
-- O desde MySQL Workbench/phpMyAdmin: ejecutar todo el contenido del archivo.
-- 
-- ACTUALIZACIONES INCLUIDAS:
-- - Todos los campos VARCHAR usan longitud 255 y colación utf8mb4_0900_ai_ci
-- - Tabla `animal`: incluye sistema de puntaje mínimo y elimina el campo redundante `foto`
-- - Nueva tabla `animal_foto` para soportar múltiples imágenes por animal
-- - Tabla `salud`: añade `fechaProgramada`, `estado` y `fechaAltaVeterinaria`
-- - Tabla `solicitud`: estado por defecto 'Pendiente' y puntaje con valor inicial 0
-- - Tabla `adopcion`: campo booleano `activa` para distinguir adopciones vigentes
-- - Tabla `seguimiento`: registra `idUsuarioCreador`, observaciones extensas y bandera de recordatorio
-- - Tabla `notificacion`: fecha de envío con timestamp y mensajes de longitud variable
-- 
-- NOTA: Este archivo ya incluye todas las actualizaciones de las migraciones:
--   - migracion_puntaje_minimo.sql
--   - migracion_respuestas_formulario.sql
-- 
-- Si tienes una base de datos existente, usa los scripts de migración individuales.
-- Si estás creando la base de datos desde cero, usa este archivo.
-- 
-- ============================================================================

-- ============================================================================
-- CREAR BASE DE DATOS
-- ============================================================================
DROP DATABASE IF EXISTS `swgarm`;
CREATE DATABASE `swgarm` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `swgarm`;

SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT;
SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS;
SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION;
SET NAMES utf8mb4;
SET @OLD_TIME_ZONE=@@TIME_ZONE;
SET TIME_ZONE='+00:00';
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0;

-- ============================================================================
-- TABLA: usuario
-- ============================================================================
DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `idUsuario` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(255) NOT NULL,
  `intentosFallidos` int NOT NULL DEFAULT 0,
  `cuentaBloqueada` tinyint(1) NOT NULL DEFAULT 0,
  `fechaBloqueo` datetime DEFAULT NULL,
  `bloqueoPermanente` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `usuario_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: adoptante
-- ============================================================================
DROP TABLE IF EXISTS `adoptante`;
CREATE TABLE `adoptante` (
  `idAdoptante` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `ocupacion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idAdoptante`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: animal
-- ============================================================================
DROP TABLE IF EXISTS `animal`;
CREATE TABLE `animal` (
  `idAnimal` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `especie` varchar(255) DEFAULT NULL,
  `raza` varchar(255) DEFAULT NULL,
  `edad` int DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `fechaIngreso` date DEFAULT NULL,
  `puntajeMinimo` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`idAnimal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: animal_foto
-- ============================================================================
DROP TABLE IF EXISTS `animal_foto`;
CREATE TABLE `animal_foto` (
  `idFoto` int NOT NULL AUTO_INCREMENT,
  `idAnimal` int NOT NULL,
  `ruta` varchar(255) NOT NULL,
  `esPrincipal` tinyint(1) NOT NULL DEFAULT 0,
  `fechaSubida` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFoto`),
  UNIQUE KEY `animal_foto_unica` (`idAnimal`, `ruta`),
  KEY `idx_animal_foto_animal` (`idAnimal`),
  CONSTRAINT `fk_animal_foto_animal` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: salud
-- ============================================================================
DROP TABLE IF EXISTS `salud`;
CREATE TABLE `salud` (
  `idSalud` int NOT NULL AUTO_INCREMENT,
  `idAnimal` int NOT NULL,
  `vacunas` varchar(255) DEFAULT NULL,
  `tratamientos` varchar(255) DEFAULT NULL,
  `veterinario` varchar(255) DEFAULT NULL,
  `observaciones` text,
  `fechaControl` date DEFAULT NULL,
  `fechaProgramada` date DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `fechaAltaVeterinaria` date DEFAULT NULL,
  PRIMARY KEY (`idSalud`),
  KEY `salud_animal_idx` (`idAnimal`),
  CONSTRAINT `salud_animal` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: solicitud
-- ============================================================================
DROP TABLE IF EXISTS `solicitud`;
CREATE TABLE `solicitud` (
  `idSolicitud` int NOT NULL AUTO_INCREMENT,
  `idAdoptante` int NOT NULL,
  `idAnimal` int NOT NULL,
  `fecha` date NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'Pendiente',
  `puntajeEvaluacion` int NOT NULL DEFAULT 0,
  `motivoRechazo` varchar(255) DEFAULT NULL,
  `respuestasFormulario` text, -- Actualización: Almacena todas las respuestas del formulario en formato JSON
  PRIMARY KEY (`idSolicitud`),
  KEY `solicitud_adoptante_idx` (`idAdoptante`),
  KEY `solicitud_animal_idx` (`idAnimal`),
  CONSTRAINT `solicitud_adoptante` FOREIGN KEY (`idAdoptante`) REFERENCES `adoptante` (`idAdoptante`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `solicitud_animal` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: adopcion
-- ============================================================================
DROP TABLE IF EXISTS `adopcion`;
CREATE TABLE `adopcion` (
  `idAdopcion` int NOT NULL AUTO_INCREMENT,
  `idSolicitud` int NOT NULL,
  `idUsuario` int NOT NULL,
  `fecha` date DEFAULT NULL,
  `contrato` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idAdopcion`),
  KEY `adopcion_usuario_idx` (`idUsuario`),
  KEY `adopcion_solicitud_idx` (`idSolicitud`),
  KEY `adopcion_activa_idx` (`activa`),
  CONSTRAINT `adopcion_solicitud` FOREIGN KEY (`idSolicitud`) REFERENCES `solicitud` (`idSolicitud`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `adopcion_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: estado_animal
-- ============================================================================
DROP TABLE IF EXISTS `estado_animal`;
CREATE TABLE `estado_animal` (
  `idEstado` int NOT NULL AUTO_INCREMENT,
  `idAnimal` int NOT NULL,
  `estadoAnterior` varchar(255) NOT NULL,
  `estadoNuevo` varchar(255) NOT NULL,
  `fechaCambio` date NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `usuario` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idEstado`),
  KEY `estado_animal_idx` (`idAnimal`),
  CONSTRAINT `estado_animal_fk` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: seguimiento
-- ============================================================================
DROP TABLE IF EXISTS `seguimiento`;
CREATE TABLE `seguimiento` (
  `idSeguimiento` int NOT NULL AUTO_INCREMENT,
  `idAdopcion` int NOT NULL,
  `idAnimal` int NOT NULL,
  `idUsuarioCreador` int DEFAULT NULL,
  `fechaProgramada` date NOT NULL,
  `fechaRealizada` date DEFAULT NULL,
  `observaciones` text,
  `estado` varchar(255) NOT NULL DEFAULT 'Pendiente',
  `recordatorioEnviado` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idSeguimiento`),
  KEY `seg_adopcion_idx` (`idAdopcion`),
  KEY `seg_animal_idx` (`idAnimal`),
  KEY `seg_usuario_creador_idx` (`idUsuarioCreador`),
  CONSTRAINT `seg_adopcion` FOREIGN KEY (`idAdopcion`) REFERENCES `adopcion` (`idAdopcion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `seg_animal` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `seg_usuario_creador` FOREIGN KEY (`idUsuarioCreador`) REFERENCES `usuario` (`idUsuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: notificacion
-- ============================================================================
DROP TABLE IF EXISTS `notificacion`;
CREATE TABLE `notificacion` (
  `idNotificacion` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `mensaje` text,
  `fechaEnvio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `leido` tinyint(1) NOT NULL DEFAULT 0,
  `fechaLeido` datetime DEFAULT NULL,
  `idSolicitud` int DEFAULT NULL,
  `idSeguimiento` int DEFAULT NULL,
  PRIMARY KEY (`idNotificacion`),
  KEY `notificacion_usuario_idx` (`idUsuario`),
  KEY `notificacion_solicitud_idx` (`idSolicitud`),
  KEY `notificacion_seguimiento_idx` (`idSeguimiento`),
  CONSTRAINT `notificacion_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notificacion_solicitud` FOREIGN KEY (`idSolicitud`) REFERENCES `solicitud` (`idSolicitud`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_notificacion_seguimiento` FOREIGN KEY (`idSeguimiento`) REFERENCES `seguimiento` (`idSeguimiento`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: preferencias_notificacion
-- ============================================================================
DROP TABLE IF EXISTS `preferencias_notificacion`;
CREATE TABLE `preferencias_notificacion` (
  `idPreferencia` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `notificarSolicitudAprobada` tinyint(1) NOT NULL DEFAULT 1,
  `notificarSolicitudRechazada` tinyint(1) NOT NULL DEFAULT 1,
  `notificarRecordatorioSeguimiento` tinyint(1) NOT NULL DEFAULT 1,
  `notificarPorEmail` tinyint(1) NOT NULL DEFAULT 1,
  `notificarEnSistema` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idPreferencia`),
  UNIQUE KEY `pref_usuario_unique` (`idUsuario`),
  CONSTRAINT `pref_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: campaña
-- ============================================================================
DROP TABLE IF EXISTS `campaña`;
CREATE TABLE `campaña` (
  `idCampaña` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `titulo` varchar(255) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `responsable` varchar(255) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  PRIMARY KEY (`idCampaña`),
  KEY `campaña_usuario_idx` (`idUsuario`),
  CONSTRAINT `campaña_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- TABLA: reporte (opcional, para futuras extensiones)
-- ============================================================================
DROP TABLE IF EXISTS `reporte`;
CREATE TABLE `reporte` (
  `idReporte` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `datos` varchar(255) DEFAULT NULL,
  `fechaGeneracion` date DEFAULT NULL,
  PRIMARY KEY (`idReporte`),
  KEY `reporte_usuario_idx` (`idUsuario`),
  CONSTRAINT `reporte_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- RESTAURAR CONFIGURACIONES
-- ============================================================================
SET TIME_ZONE=@OLD_TIME_ZONE;
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT;
SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS;
SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION;
SET SQL_NOTES=@OLD_SQL_NOTES;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
SELECT 'Base de datos SWGARM creada exitosamente' AS Status;
SELECT COUNT(*) AS 'Total de tablas creadas' FROM information_schema.tables WHERE table_schema = DATABASE();
