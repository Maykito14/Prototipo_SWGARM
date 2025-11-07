-- ============================================================================
-- Script para agregar campo 'activa' a la tabla 'adopcion'
-- ============================================================================
-- Este campo indica si la adopción está activa (1) o inactiva (0)
-- Una adopción está activa cuando la solicitud asociada está en estado "Aprobada"
-- Una adopción está inactiva cuando la solicitud cambió a "Pendiente" o "Rechazada"
-- ============================================================================

USE swgarm;

ALTER TABLE `adopcion` 
ADD COLUMN `activa` TINYINT(1) NOT NULL DEFAULT 1 AFTER `contrato`;

-- Actualizar el campo 'activa' basado en el estado actual de las solicitudes
UPDATE `adopcion` ad
JOIN `solicitud` s ON ad.idSolicitud = s.idSolicitud
SET ad.activa = CASE 
  WHEN s.estado = 'Aprobada' THEN 1
  ELSE 0
END;

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX `idx_adopcion_activa` ON `adopcion` (`activa`);
CREATE INDEX `idx_adopcion_activa_animal` ON `adopcion` (`activa`, `idSolicitud`);

