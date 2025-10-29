-- Agregar campos para bloqueo de cuenta por intentos fallidos
ALTER TABLE `usuario` 
ADD COLUMN `intentosFallidos` INT NOT NULL DEFAULT 0 AFTER `rol`,
ADD COLUMN `cuentaBloqueada` TINYINT(1) NOT NULL DEFAULT 0 AFTER `intentosFallidos`,
ADD COLUMN `fechaBloqueo` DATETIME DEFAULT NULL AFTER `cuentaBloqueada`;

