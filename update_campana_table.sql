-- Mejorar tabla campaña para incluir fechaCreacion y extender campos
ALTER TABLE `campaña` 
ADD COLUMN `fechaCreacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `idUsuario`,
MODIFY COLUMN `descripcion` VARCHAR(500) DEFAULT NULL;

-- Si la tabla ya tiene registros, actualizar fechaCreacion con fecha actual para registros existentes
UPDATE `campaña` SET fechaCreacion = NOW() WHERE fechaCreacion IS NULL;

