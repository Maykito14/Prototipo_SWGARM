-- Crear tabla para almacenar múltiples fotos por animal
CREATE TABLE IF NOT EXISTS `animal_foto` (
  `idFoto` INT NOT NULL AUTO_INCREMENT,
  `idAnimal` INT NOT NULL,
  `ruta` VARCHAR(255) NOT NULL,
  `esPrincipal` TINYINT(1) NOT NULL DEFAULT 0,
  `fechaSubida` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFoto`),
  KEY `idx_animal_foto_animal` (`idAnimal`),
  CONSTRAINT `fk_animal_foto_animal`
    FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`)
    ON DELETE CASCADE
);

-- Migrar la foto principal existente a la nueva tabla
INSERT INTO `animal_foto` (`idAnimal`, `ruta`, `esPrincipal`)
SELECT a.idAnimal, a.foto, 1
FROM animal a
WHERE a.foto IS NOT NULL AND a.foto <> ''
  AND NOT EXISTS (
    SELECT 1 FROM animal_foto af
    WHERE af.idAnimal = a.idAnimal AND af.ruta = a.foto
  );

-- Asegurar que cada animal tenga solo una foto principal
UPDATE animal_foto f
JOIN (
  SELECT idAnimal, MIN(idFoto) AS idPrincipal
  FROM animal_foto
  WHERE esPrincipal = 1
  GROUP BY idAnimal
) AS principales ON f.idAnimal = principales.idAnimal
SET f.esPrincipal = CASE WHEN f.idFoto = principales.idPrincipal THEN 1 ELSE 0 END;


