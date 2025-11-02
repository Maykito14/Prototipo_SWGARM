-- ============================================================================
-- MIGRACIÓN: Agregar campo puntajeMinimo a la tabla animal
-- Fecha: Enero 2025
-- Descripción: Agrega el campo puntajeMinimo para implementar sistema de 
--               puntajes mínimos requeridos para adopción
-- ============================================================================

-- Agregar columna puntajeMinimo a la tabla animal
ALTER TABLE `animal` 
ADD COLUMN `puntajeMinimo` int DEFAULT 0 AFTER `fechaIngreso`;

-- Actualizar animales existentes con puntaje mínimo por defecto (0)
-- Esto permite que animales ya registrados sigan funcionando normalmente
UPDATE `animal` 
SET `puntajeMinimo` = 0 
WHERE `puntajeMinimo` IS NULL;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Verificar que la columna fue agregada correctamente
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'animal'
AND COLUMN_NAME = 'puntajeMinimo';

