-- Script para actualizar la tabla salud con campos de estado y alta veterinaria
-- Ejecutar este script en la base de datos

ALTER TABLE `salud` 
ADD COLUMN `estado` VARCHAR(50) DEFAULT 'Pendiente' AFTER `fechaControl`,
ADD COLUMN `fechaAltaVeterinaria` DATE DEFAULT NULL AFTER `estado`,
ADD COLUMN `fechaProgramada` DATE DEFAULT NULL AFTER `fechaAltaVeterinaria`;

-- Actualizar estados existentes basándose en la lógica:
-- Pendiente: fechaControl > fecha actual
-- En Tratamiento: fechaControl <= fecha actual Y fechaAltaVeterinaria IS NULL
-- Realizado: fechaAltaVeterinaria IS NOT NULL

UPDATE `salud` 
SET `estado` = CASE
  WHEN `fechaAltaVeterinaria` IS NOT NULL THEN 'Realizado'
  WHEN `fechaControl` <= CURDATE() THEN 'En Tratamiento'
  ELSE 'Pendiente'
END
WHERE `estado` IS NULL OR `estado` = '';

-- Si fechaProgramada no está establecida, usar fechaControl como fechaProgramada
UPDATE `salud`
SET `fechaProgramada` = `fechaControl`
WHERE `fechaProgramada` IS NULL;

