-- Agregar campo foto a la tabla animal
ALTER TABLE `animal` 
ADD COLUMN `foto` VARCHAR(255) DEFAULT NULL AFTER `descripcion`;

