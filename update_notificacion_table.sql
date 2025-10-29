-- Mejorar tabla notificacion para incluir campos adicionales
ALTER TABLE `notificacion` 
ADD COLUMN `leido` TINYINT(1) NOT NULL DEFAULT 0 AFTER `fechaEnvio`,
ADD COLUMN `fechaLeido` DATETIME DEFAULT NULL AFTER `leido`,
ADD COLUMN `idSolicitud` INT DEFAULT NULL AFTER `fechaLeido`,
ADD COLUMN `idSeguimiento` INT DEFAULT NULL AFTER `idSolicitud`,
MODIFY COLUMN `mensaje` VARCHAR(500) DEFAULT NULL;

-- Crear tabla de preferencias de notificación
CREATE TABLE IF NOT EXISTS `preferencias_notificacion` (
  `idPreferencia` INT NOT NULL AUTO_INCREMENT,
  `idUsuario` INT NOT NULL,
  `notificarSolicitudAprobada` TINYINT(1) NOT NULL DEFAULT 1,
  `notificarSolicitudRechazada` TINYINT(1) NOT NULL DEFAULT 1,
  `notificarRecordatorioSeguimiento` TINYINT(1) NOT NULL DEFAULT 1,
  `notificarPorEmail` TINYINT(1) NOT NULL DEFAULT 1,
  `notificarEnSistema` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idPreferencia`),
  UNIQUE KEY `pref_usuario_unique` (`idUsuario`),
  CONSTRAINT `pref_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

