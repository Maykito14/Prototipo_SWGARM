-- ============================================================================
-- Script: update_preferencias_notificacion_campanas.sql
-- Objetivo: añadir columna de preferencia para notificaciones de campañas
-- ============================================================================

ALTER TABLE `preferencias_notificacion`
  ADD COLUMN `notificarCampanas` TINYINT(1) NOT NULL DEFAULT 1
  AFTER `notificarRecordatorioSeguimiento`;


