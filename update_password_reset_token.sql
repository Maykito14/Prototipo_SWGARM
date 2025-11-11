-- ============================================================================
-- Script: update_password_reset_token.sql
-- Objetivo: Crear tabla para gestionar tokens de recuperación de contraseña
-- ============================================================================

SET @idxExists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'usuario'
    AND column_name = 'email'
);

SET @sqlCreateIdx := IF(
  @idxExists = 0,
  'CREATE INDEX idx_usuario_email_reset ON usuario (email);',
  'SELECT 1;'
);

PREPARE stmt FROM @sqlCreateIdx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS `password_reset_token` (
  `idToken` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `tokenHash` VARCHAR(255) NOT NULL,
  `expiracion` DATETIME NOT NULL,
  `usado` TINYINT(1) NOT NULL DEFAULT 0,
  `fechaUso` DATETIME DEFAULT NULL,
  PRIMARY KEY (`idToken`),
  KEY `password_reset_email_idx` (`email`),
  KEY `password_reset_expiracion_idx` (`expiracion`),
  CONSTRAINT `password_reset_usuario_fk`
    FOREIGN KEY (`email`)
    REFERENCES `usuario` (`email`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



