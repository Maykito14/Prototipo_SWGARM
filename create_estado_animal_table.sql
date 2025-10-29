-- Script para crear tabla estado_animal
-- Ejecutar este script en la base de datos swgarm

CREATE TABLE IF NOT EXISTS `estado_animal` (
  `idEstado` int NOT NULL AUTO_INCREMENT,
  `idAnimal` int NOT NULL,
  `estadoAnterior` varchar(45) NOT NULL,
  `estadoNuevo` varchar(45) NOT NULL,
  `fechaCambio` date NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `usuario` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idEstado`),
  KEY `estado_animal_idx` (`idAnimal`),
  CONSTRAINT `estado_animal_fk` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Verificar que la tabla se creó correctamente
DESCRIBE estado_animal;
