-- ============================================================================
-- Script: update_campana_multimedia.sql
-- Objetivo: Actualizar la tabla campaña para soportar publicaciones completas
--           y crear la tabla campaña_foto para gestionar múltiples imágenes.
-- ============================================================================

-- Renombrar columna fecha -> fechaInicio si aún no fue actualizada
SET @sqlRenameFecha := (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'campaña'
        AND column_name = 'fecha'
    ),
    'ALTER TABLE `campaña` CHANGE COLUMN `fecha` `fechaInicio` DATE NULL',
    NULL
  )
);

IF @sqlRenameFecha IS NOT NULL THEN
  PREPARE stmt FROM @sqlRenameFecha;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
END IF;

-- Agregar y ajustar columnas nuevas
ALTER TABLE `campaña`
  ADD COLUMN IF NOT EXISTS `fechaActualizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `fechaInicio` DATE NULL AFTER `responsable`,
  ADD COLUMN IF NOT EXISTS `fechaFin` DATE NULL AFTER `fechaInicio`,
  ADD COLUMN IF NOT EXISTS `visible` TINYINT(1) NOT NULL DEFAULT 1 AFTER `fechaFin`,
  MODIFY `descripcion` TEXT NULL;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS `campaña_visible_idx` ON `campaña` (`visible`);
CREATE INDEX IF NOT EXISTS `campaña_fecha_idx` ON `campaña` (`fechaInicio`, `fechaFin`);

-- Crear tabla de fotos de campaña
CREATE TABLE IF NOT EXISTS `campaña_foto` (
  `idFoto` INT NOT NULL AUTO_INCREMENT,
  `idCampaña` INT NOT NULL,
  `ruta` VARCHAR(255) NOT NULL,
  `esPrincipal` TINYINT(1) NOT NULL DEFAULT 0,
  `fechaSubida` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFoto`),
  KEY `campaña_foto_campaña_idx` (`idCampaña`),
  KEY `campaña_foto_principal_idx` (`idCampaña`, `esPrincipal`),
  CONSTRAINT `campaña_foto_campaña_fk`
    FOREIGN KEY (`idCampaña`) REFERENCES `campaña` (`idCampaña`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


