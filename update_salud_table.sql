-- Script para agregar campo observaciones a la tabla salud
-- Ejecutar este script en la base de datos swgarm

ALTER TABLE salud ADD COLUMN observaciones TEXT AFTER veterinario;

-- Verificar que la columna se agregó correctamente
DESCRIBE salud;
