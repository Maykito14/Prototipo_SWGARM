-- ============================================================================
-- Script: update_notificaciones_fecha.sql
-- Objetivo: asegurar que las columnas de fecha de la tabla notificacion
--           almacenen también la hora exacta del evento.
-- ============================================================================

ALTER TABLE `notificacion`
  MODIFY `fechaEnvio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  MODIFY `fechaLeido` DATETIME NULL DEFAULT NULL;


