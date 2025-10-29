-- Script para agregar campo motivoRechazo a la tabla solicitud
-- Ejecutar este script en la base de datos swgarm

ALTER TABLE solicitud
ADD COLUMN motivoRechazo VARCHAR(255) DEFAULT NULL;

-- Verificar que la columna se agregó correctamente
DESCRIBE solicitud;
