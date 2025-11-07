-- ============================================================================
-- Script para agregar el campo idUsuarioCreador a la tabla seguimiento
-- ============================================================================
-- Este campo permite registrar qué administrador programó el seguimiento
-- y así enviar recordatorios personalizados
-- ============================================================================

USE swgarm;

ALTER TABLE `seguimiento`
  ADD COLUMN `idUsuarioCreador` INT NULL AFTER `idAnimal`;

ALTER TABLE `seguimiento`
  ADD CONSTRAINT `fk_seguimiento_usuario_creador`
    FOREIGN KEY (`idUsuarioCreador`) REFERENCES `usuario`(`idUsuario`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

