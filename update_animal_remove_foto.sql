-- Eliminar la columna duplicada 'foto' de la tabla animal si aún existe
ALTER TABLE `animal`
  DROP COLUMN IF EXISTS `foto`;


