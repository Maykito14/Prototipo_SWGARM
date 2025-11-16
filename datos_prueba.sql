-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: swgarm
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adopcion`
--

DROP TABLE IF EXISTS `adopcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adopcion` (
  `idAdopcion` int NOT NULL AUTO_INCREMENT,
  `idSolicitud` int NOT NULL,
  `idUsuario` int NOT NULL,
  `fecha` date DEFAULT NULL,
  `contrato` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idAdopcion`),
  KEY `adopcion_usuario_idx` (`idUsuario`),
  KEY `adopcion_solicitud_idx` (`idSolicitud`),
  KEY `adopcion_activa_idx` (`activa`),
  CONSTRAINT `adopcion_solicitud` FOREIGN KEY (`idSolicitud`) REFERENCES `solicitud` (`idSolicitud`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `adopcion_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adopcion`
--

LOCK TABLES `adopcion` WRITE;
/*!40000 ALTER TABLE `adopcion` DISABLE KEYS */;
INSERT INTO `adopcion` VALUES (1,2,1,'2025-11-16',NULL,1),(2,1,1,'2025-11-16',NULL,1);
/*!40000 ALTER TABLE `adopcion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adoptante`
--

DROP TABLE IF EXISTS `adoptante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adoptante` (
  `idAdoptante` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `ocupacion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idAdoptante`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adoptante`
--

LOCK TABLES `adoptante` WRITE;
/*!40000 ALTER TABLE `adoptante` DISABLE KEYS */;
INSERT INTO `adoptante` VALUES (1,'Rodolfo','Barili','usuario@usuario.com','3576123456','Calle Falsa 123','Periodista'),(2,'Cristina','Lagos','usuario2@usuario.com','3576789456','Calle Pública 987','Acompañante Terapéutico');
/*!40000 ALTER TABLE `adoptante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `animal`
--

DROP TABLE IF EXISTS `animal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `animal` (
  `idAnimal` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `especie` varchar(255) DEFAULT NULL,
  `raza` varchar(255) DEFAULT NULL,
  `edad` int DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `fechaIngreso` date DEFAULT NULL,
  `puntajeMinimo` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`idAnimal`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `animal`
--

LOCK TABLES `animal` WRITE;
/*!40000 ALTER TABLE `animal` DISABLE KEYS */;
INSERT INTO `animal` VALUES (1,'Bingo','Perro','Galgo',3,'Disponible','Bingo es un galgo muy amoroso que necesita un hogar con mucho espacio para jugar.','2025-07-01',60),(2,'Filomena','Perro','Border Collie',2,'Disponible','Filomena fué rescatada de un lugar donde sufrió abandono. Es una perra muy tranquila y leal.','2025-08-25',75),(3,'Lupita','Perro','Mestiza',0,'En tratamiento','Lupita fue rescatada con sus dos hermanitas, y necesita un hogar para poder ser feliz.','2025-08-28',45),(4,'Merlina','Perro','Mestiza',0,'Disponible','Merlina es una cachorra muy divertida y enérgica. Le gusta mucho compartir con otros animales.','2025-09-03',63),(5,'Michu','Gato','Mestiza',3,'Disponible','Michu es una gata muy tranquila, le gusta mucho dormir y estar en lugares silenciosos.','2025-09-17',53),(6,'Muriel','Perro','Salchicha',6,'Adoptado','A Muriel le gusta mucho la comida, recibir atención y dormir en compañía humana.','2025-09-25',68),(7,'Pedro','Perro','Mestiza',4,'Adoptado','Pedro es un perro adulto muy leal y cariñoso. Es territorial, y le gusta mucho recibir cariños.','2025-10-03',56),(8,'Rocko','Perro','Caniche',7,'Disponible','Rocko es un perro adulto que fué abandonado por sus anteriores dueños, ya que no pudieron llevarlo en su mudanza. Necesita un hogar!','2025-10-26',60),(9,'Shule','Perro','Caniche',3,'Disponible','Shule es una perrita amorosa, leal y compañera. Le gusta mucho compartir con otros animales y jugar todo el tiempo.','2025-10-31',58),(10,'Sira','Gato','Mestiza',2,'Disponible','Sira es una gata hembra  que necesita un nuevo hogar para rehacer su vida.','2025-11-10',60);
/*!40000 ALTER TABLE `animal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `animal_foto`
--

DROP TABLE IF EXISTS `animal_foto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `animal_foto` (
  `idFoto` int NOT NULL AUTO_INCREMENT,
  `idAnimal` int NOT NULL,
  `ruta` varchar(255) NOT NULL,
  `esPrincipal` tinyint(1) NOT NULL DEFAULT '0',
  `fechaSubida` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFoto`),
  UNIQUE KEY `animal_foto_unica` (`idAnimal`,`ruta`),
  KEY `idx_animal_foto_animal` (`idAnimal`),
  CONSTRAINT `fk_animal_foto_animal` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `animal_foto`
--

LOCK TABLES `animal_foto` WRITE;
/*!40000 ALTER TABLE `animal_foto` DISABLE KEYS */;
INSERT INTO `animal_foto` VALUES (1,1,'uploads/images/Bingo-1763325984912-534056455.jpg',1,'2025-11-16 17:46:24'),(2,2,'uploads/images/Filomena-1763326056545-26790065.jpg',1,'2025-11-16 17:47:36'),(3,3,'uploads/images/Lupita-1763326131386-13541407.jpeg',1,'2025-11-16 17:48:51'),(4,4,'uploads/images/Merlina-1763326198264-969103931.jpg',1,'2025-11-16 17:49:58'),(5,5,'uploads/images/Michu-1763326253973-959428437.jpg',1,'2025-11-16 17:50:53'),(6,6,'uploads/images/Muriel-1763326330087-29714231.jpg',1,'2025-11-16 17:52:10'),(7,7,'uploads/images/Pedro-1763326392975-557438074.jpg',1,'2025-11-16 17:53:12'),(8,8,'uploads/images/Rocko-1763326456685-870900076.jpeg',1,'2025-11-16 17:54:16'),(9,9,'uploads/images/Shule-1763326518611-280703794.jpg',1,'2025-11-16 17:55:18'),(10,10,'uploads/images/Sira-1763326577718-286875941.jpeg',1,'2025-11-16 17:56:17');
/*!40000 ALTER TABLE `animal_foto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaña`
--

DROP TABLE IF EXISTS `campaña`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaña` (
  `idCampaña` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaActualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text,
  `responsable` varchar(255) DEFAULT NULL,
  `fechaInicio` date DEFAULT NULL,
  `fechaFin` date DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idCampaña`),
  KEY `campaña_usuario_idx` (`idUsuario`),
  KEY `campaña_visible_idx` (`visible`),
  KEY `campaña_fecha_idx` (`fechaInicio`,`fechaFin`),
  CONSTRAINT `campaña_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaña`
--

LOCK TABLES `campaña` WRITE;
/*!40000 ALTER TABLE `campaña` DISABLE KEYS */;
INSERT INTO `campaña` VALUES (1,1,'2025-11-16 18:13:09','2025-11-16 18:13:09','Animalitos en Adopción','Esta publicación es una prueba del sistema de campañas.',NULL,'2025-11-14','2025-12-31',1);
/*!40000 ALTER TABLE `campaña` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaña_foto`
--

DROP TABLE IF EXISTS `campaña_foto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaña_foto` (
  `idFoto` int NOT NULL AUTO_INCREMENT,
  `idCampaña` int NOT NULL,
  `ruta` varchar(255) NOT NULL,
  `esPrincipal` tinyint(1) NOT NULL DEFAULT '0',
  `fechaSubida` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFoto`),
  KEY `campaña_foto_campaña_idx` (`idCampaña`),
  KEY `campaña_foto_principal_idx` (`idCampaña`,`esPrincipal`),
  CONSTRAINT `campaña_foto_campaña_fk` FOREIGN KEY (`idCampaña`) REFERENCES `campaña` (`idCampaña`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaña_foto`
--

LOCK TABLES `campaña_foto` WRITE;
/*!40000 ALTER TABLE `campaña_foto` DISABLE KEYS */;
INSERT INTO `campaña_foto` VALUES (1,1,'uploads/campanas/Bingo-1763327589550-773638819.jpg',1,'2025-11-16 18:13:09'),(2,1,'uploads/campanas/Filomena-1763327589552-894012024.jpg',0,'2025-11-16 18:13:09'),(3,1,'uploads/campanas/Lupita-1763327589555-337901050.jpeg',0,'2025-11-16 18:13:09'),(4,1,'uploads/campanas/Merlina-1763327589557-551785498.jpg',0,'2025-11-16 18:13:09'),(5,1,'uploads/campanas/Michu-1763327589559-109624240.jpg',0,'2025-11-16 18:13:09'),(6,1,'uploads/campanas/Muriel-1763327589563-475224127.jpg',0,'2025-11-16 18:13:09'),(7,1,'uploads/campanas/Pedro-1763327589565-100067316.jpg',0,'2025-11-16 18:13:09'),(8,1,'uploads/campanas/Rocko-1763327589569-236761017.jpeg',0,'2025-11-16 18:13:09'),(9,1,'uploads/campanas/Shule-1763327589570-746089889.jpg',0,'2025-11-16 18:13:09'),(10,1,'uploads/campanas/Sira-1763327589573-108713579.jpeg',0,'2025-11-16 18:13:09');
/*!40000 ALTER TABLE `campaña_foto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_animal`
--

DROP TABLE IF EXISTS `estado_animal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_animal` (
  `idEstado` int NOT NULL AUTO_INCREMENT,
  `idAnimal` int NOT NULL,
  `estadoAnterior` varchar(255) NOT NULL,
  `estadoNuevo` varchar(255) NOT NULL,
  `fechaCambio` date NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `usuario` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idEstado`),
  KEY `estado_animal_idx` (`idAnimal`),
  CONSTRAINT `estado_animal_fk` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_animal`
--

LOCK TABLES `estado_animal` WRITE;
/*!40000 ALTER TABLE `estado_animal` DISABLE KEYS */;
INSERT INTO `estado_animal` VALUES (1,6,'Disponible','En proceso','2025-11-16','Solicitud de adopción aprobada','usuario:1'),(2,7,'Disponible','En proceso','2025-11-16','Solicitud de adopción aprobada','usuario:1'),(3,6,'En proceso','Adoptado','2025-11-16','Adopción formalizada','usuario:1'),(4,3,'Disponible','En tratamiento','2025-11-16','Control de salud en tratamiento activo','sistema'),(5,7,'En proceso','Adoptado','2025-11-16','Adopción formalizada','usuario:1');
/*!40000 ALTER TABLE `estado_animal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacion`
--

DROP TABLE IF EXISTS `notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacion` (
  `idNotificacion` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `mensaje` text,
  `fechaEnvio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `leido` tinyint(1) NOT NULL DEFAULT '0',
  `fechaLeido` datetime DEFAULT NULL,
  `idSolicitud` int DEFAULT NULL,
  `idSeguimiento` int DEFAULT NULL,
  PRIMARY KEY (`idNotificacion`),
  KEY `notificacion_usuario_idx` (`idUsuario`),
  KEY `notificacion_solicitud_idx` (`idSolicitud`),
  KEY `notificacion_seguimiento_idx` (`idSeguimiento`),
  CONSTRAINT `fk_notificacion_seguimiento` FOREIGN KEY (`idSeguimiento`) REFERENCES `seguimiento` (`idSeguimiento`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_notificacion_solicitud` FOREIGN KEY (`idSolicitud`) REFERENCES `solicitud` (`idSolicitud`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notificacion_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacion`
--

LOCK TABLES `notificacion` WRITE;
/*!40000 ALTER TABLE `notificacion` DISABLE KEYS */;
INSERT INTO `notificacion` VALUES (1,3,'Solicitud Aprobada','¡Felicitaciones! Tu solicitud de adopción para Muriel ha sido aprobada. Pronto nos pondremos en contacto contigo.','2025-11-16 18:03:17',0,NULL,2,NULL),(2,2,'Solicitud Aprobada','¡Felicitaciones! Tu solicitud de adopción para Pedro ha sido aprobada. Pronto nos pondremos en contacto contigo.','2025-11-16 18:03:25',0,NULL,1,NULL),(3,1,'Seguimiento Programado','Se programó un seguimiento para Pedro el 2025-11-25.','2025-11-16 18:11:05',0,NULL,NULL,1),(4,2,'Seguimiento Programado','Se programó un seguimiento para Pedro a cargo de Rodolfo Barili el 2025-11-25.','2025-11-16 18:11:05',0,NULL,NULL,1),(5,1,'Seguimiento Programado','Se programó un seguimiento para Muriel el 2025-12-12.','2025-11-16 18:11:45',0,NULL,NULL,2),(6,3,'Seguimiento Programado','Se programó un seguimiento para Muriel a cargo de Cristina Lagos el 2025-12-12.','2025-11-16 18:11:45',0,NULL,NULL,2),(7,2,'Campaña','Nueva campaña: Animalitos en Adopción. Ingresá a Campañas para conocer los detalles.','2025-11-16 18:13:09',0,NULL,NULL,NULL),(8,3,'Campaña','Nueva campaña: Animalitos en Adopción. Ingresá a Campañas para conocer los detalles.','2025-11-16 18:13:09',0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_token`
--

DROP TABLE IF EXISTS `password_reset_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_token` (
  `idToken` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `tokenHash` varchar(255) NOT NULL,
  `expiracion` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT '0',
  `fechaUso` datetime DEFAULT NULL,
  PRIMARY KEY (`idToken`),
  KEY `password_reset_email_idx` (`email`),
  KEY `password_reset_expiracion_idx` (`expiracion`),
  CONSTRAINT `password_reset_usuario_fk` FOREIGN KEY (`email`) REFERENCES `usuario` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_token`
--

LOCK TABLES `password_reset_token` WRITE;
/*!40000 ALTER TABLE `password_reset_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencias_notificacion`
--

DROP TABLE IF EXISTS `preferencias_notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferencias_notificacion` (
  `idPreferencia` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `notificarSolicitudAprobada` tinyint(1) NOT NULL DEFAULT '1',
  `notificarSolicitudRechazada` tinyint(1) NOT NULL DEFAULT '1',
  `notificarRecordatorioSeguimiento` tinyint(1) NOT NULL DEFAULT '1',
  `notificarCampanas` tinyint(1) NOT NULL DEFAULT '1',
  `notificarPorEmail` tinyint(1) NOT NULL DEFAULT '1',
  `notificarEnSistema` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idPreferencia`),
  UNIQUE KEY `pref_usuario_unique` (`idUsuario`),
  CONSTRAINT `pref_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencias_notificacion`
--

LOCK TABLES `preferencias_notificacion` WRITE;
/*!40000 ALTER TABLE `preferencias_notificacion` DISABLE KEYS */;
INSERT INTO `preferencias_notificacion` VALUES (1,3,1,1,1,1,1,1),(2,1,1,1,1,1,1,1);
/*!40000 ALTER TABLE `preferencias_notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte`
--

DROP TABLE IF EXISTS `reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporte` (
  `idReporte` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `datos` varchar(255) DEFAULT NULL,
  `fechaGeneracion` date DEFAULT NULL,
  PRIMARY KEY (`idReporte`),
  KEY `reporte_usuario_idx` (`idUsuario`),
  CONSTRAINT `reporte_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte`
--

LOCK TABLES `reporte` WRITE;
/*!40000 ALTER TABLE `reporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salud`
--

DROP TABLE IF EXISTS `salud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salud` (
  `idSalud` int NOT NULL AUTO_INCREMENT,
  `idAnimal` int NOT NULL,
  `vacunas` varchar(255) DEFAULT NULL,
  `tratamientos` varchar(255) DEFAULT NULL,
  `veterinario` varchar(255) DEFAULT NULL,
  `observaciones` text,
  `fechaControl` date DEFAULT NULL,
  `fechaProgramada` date DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `fechaAltaVeterinaria` date DEFAULT NULL,
  PRIMARY KEY (`idSalud`),
  KEY `salud_animal_idx` (`idAnimal`),
  CONSTRAINT `salud_animal` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salud`
--

LOCK TABLES `salud` WRITE;
/*!40000 ALTER TABLE `salud` DISABLE KEYS */;
INSERT INTO `salud` VALUES (1,9,'-','Desparacitación y Castración','De Barberis','','2025-11-10','2025-12-17','Realizado','2025-11-16'),(2,3,'Parovirus','-','Folco','-','2025-11-10','2025-11-12','En Tratamiento',NULL);
/*!40000 ALTER TABLE `salud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguimiento`
--

DROP TABLE IF EXISTS `seguimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguimiento` (
  `idSeguimiento` int NOT NULL AUTO_INCREMENT,
  `idAdopcion` int NOT NULL,
  `idAnimal` int NOT NULL,
  `idUsuarioCreador` int DEFAULT NULL,
  `fechaProgramada` date NOT NULL,
  `fechaRealizada` date DEFAULT NULL,
  `observaciones` text,
  `estado` varchar(255) NOT NULL DEFAULT 'Pendiente',
  `recordatorioEnviado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idSeguimiento`),
  KEY `seg_adopcion_idx` (`idAdopcion`),
  KEY `seg_animal_idx` (`idAnimal`),
  KEY `seg_usuario_creador_idx` (`idUsuarioCreador`),
  CONSTRAINT `seg_adopcion` FOREIGN KEY (`idAdopcion`) REFERENCES `adopcion` (`idAdopcion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `seg_animal` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `seg_usuario_creador` FOREIGN KEY (`idUsuarioCreador`) REFERENCES `usuario` (`idUsuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguimiento`
--

LOCK TABLES `seguimiento` WRITE;
/*!40000 ALTER TABLE `seguimiento` DISABLE KEYS */;
INSERT INTO `seguimiento` VALUES (1,2,7,1,'2025-11-25',NULL,'Control de estado','Pendiente',0),(2,1,6,1,'2025-12-12',NULL,'Verificación de lugar de adopcion','Pendiente',0);
/*!40000 ALTER TABLE `seguimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitud`
--

DROP TABLE IF EXISTS `solicitud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud` (
  `idSolicitud` int NOT NULL AUTO_INCREMENT,
  `idAdoptante` int NOT NULL,
  `idAnimal` int NOT NULL,
  `fecha` date NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'Pendiente',
  `puntajeEvaluacion` int NOT NULL DEFAULT '0',
  `motivoRechazo` varchar(255) DEFAULT NULL,
  `respuestasFormulario` text,
  PRIMARY KEY (`idSolicitud`),
  KEY `solicitud_adoptante_idx` (`idAdoptante`),
  KEY `solicitud_animal_idx` (`idAnimal`),
  CONSTRAINT `solicitud_adoptante` FOREIGN KEY (`idAdoptante`) REFERENCES `adoptante` (`idAdoptante`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `solicitud_animal` FOREIGN KEY (`idAnimal`) REFERENCES `animal` (`idAnimal`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitud`
--

LOCK TABLES `solicitud` WRITE;
/*!40000 ALTER TABLE `solicitud` DISABLE KEYS */;
INSERT INTO `solicitud` VALUES (1,1,7,'2025-11-16','Aprobada',83,NULL,'{\"mayorEdad\":\"Sí\",\"motivoAdopcion\":\"Necesito un compañero para mi casa.\",\"experienciaMascotas\":\"Sí, he tenido mascotas antes\",\"tipoVivienda\":\"Casa propia\",\"cerramiento\":\"Patio cerrado con tapias y portón.\",\"patio\":\"Sí, amplio\",\"espaciosAcceso\":\"A toda la casa\",\"ninosPequenos\":\"No\",\"otrasMascotas\":\"No\",\"detalleMascotas\":\"\",\"permisos\":\"Sí\",\"horasFuera\":\"Entre 4 y 8 horas\",\"cuidadoAusencia\":\"Con mi familia\",\"trabajoEstable\":\"Sí\",\"disposicionGastos\":\"Sí\",\"aceptaSeguimiento\":\"Sí\",\"telefono\":\"3576123456\",\"direccion\":\"Calle Falsa 123\",\"ocupacion\":\"Periodista\"}'),(2,2,6,'2025-11-16','Aprobada',80,NULL,'{\"mayorEdad\":\"Sí\",\"motivoAdopcion\":\"Quiero a Muriel para acompañarla y quererla mucho\",\"experienciaMascotas\":\"Sí, pero hace mucho tiempo\",\"tipoVivienda\":\"Casa propia\",\"cerramiento\":\"Departamento en segundo piso, con balgó propio.\",\"patio\":\"Sí, pequeño\",\"espaciosAcceso\":\"Todo el departamento\",\"ninosPequenos\":\"No\",\"otrasMascotas\":\"No\",\"detalleMascotas\":\"\",\"permisos\":\"Sí\",\"horasFuera\":\"Menos de 4 horas\",\"cuidadoAusencia\":\"Con mi hermana\",\"trabajoEstable\":\"Sí\",\"disposicionGastos\":\"Sí\",\"aceptaSeguimiento\":\"Sí\",\"telefono\":\"3576789456\",\"direccion\":\"Calle Pública 987\",\"ocupacion\":\"Acompañante Terapéutico\"}');
/*!40000 ALTER TABLE `solicitud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `idUsuario` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(255) NOT NULL,
  `intentosFallidos` int NOT NULL DEFAULT '0',
  `cuentaBloqueada` tinyint(1) NOT NULL DEFAULT '0',
  `fechaBloqueo` datetime DEFAULT NULL,
  `bloqueoPermanente` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `usuario_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'admin@admin.com','$2b$10$we6g7G4IOQaR6FWiLXqjcu1uUTEedP2jCjvcKVEF3CSLe/MdeWmL.','administrador',0,0,NULL,0),(2,'usuario@usuario.com','$2b$10$2HUeCn2PxDnurfpQvstOlevteLQIJ3SDn0ojb5rIXqMSHEdmTIyxC','adoptante',0,0,NULL,0),(3,'usuario2@usuario.com','$2b$10$s8UMHhZH7Yoqn4zASXw0PuVJPfOxJATp0Xt/VWok3iaHUzz49dv5C','adoptante',0,0,NULL,0);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-16 18:27:33

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
