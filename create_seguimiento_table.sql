CREATE TABLE IF NOT EXISTS `seguimiento` (
  `idSeguimiento` int NOT NULL AUTO_INCREMENT,
  `idAdopcion` int NOT NULL,
  `idAnimal` int NOT NULL,
  `fechaProgramada` date NOT NULL,
  `fechaRealizada` date DEFAULT NULL,
  `observaciones` varchar(500) DEFAULT NULL,
  `estado` varchar(45) NOT NULL DEFAULT 'Pendiente',
  `recordatorioEnviado` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idSeguimiento`),
  KEY `seg_adopcion_idx` (`idAdopcion`),
  KEY `seg_animal_idx` (`idAnimal`),
  CONSTRAINT `seg_adopcion` FOREIGN KEY (`idAdopcion`) REFERENCES `adopcion` (`idAdopcion`),
  CONSTRAINT `seg_animal` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
