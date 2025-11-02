-- ============================================================================
-- MIGRACIÓN: Agregar campo respuestasFormulario a la tabla solicitud
-- Fecha: Enero 2025
-- Descripción: Agrega el campo respuestasFormulario para guardar todas las 
--               respuestas del formulario de adopción en formato JSON
-- ============================================================================

-- Agregar columna respuestasFormulario a la tabla solicitud
ALTER TABLE `solicitud` 
ADD COLUMN `respuestasFormulario` text AFTER `motivoRechazo`;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Verificar que la columna fue agregada correctamente
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'solicitud'
AND COLUMN_NAME = 'respuestasFormulario';

