-- Script para agregar campo descripción a la tabla animal
-- Ejecutar este script en la base de datos swgarm

ALTER TABLE animal ADD COLUMN descripcion TEXT AFTER estado;

-- Verificar que la columna se agregó correctamente
DESCRIBE animal;
