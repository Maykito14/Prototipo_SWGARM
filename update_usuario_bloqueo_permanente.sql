-- Script para agregar campo de bloqueo permanente a la tabla usuario
-- Ejecutar este script en la base de datos si ya existe

ALTER TABLE `usuario` 
ADD COLUMN `bloqueoPermanente` tinyint(1) NOT NULL DEFAULT 0 AFTER `fechaBloqueo`;

