-- Eliminar la columna duplicada 'foto' de la tabla animal si aún existe
SET @schema := DATABASE();
SET @col_foto_existe := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema
    AND TABLE_NAME = 'animal'
    AND COLUMN_NAME = 'foto'
);

SET @sql_drop_foto := IF(
  @col_foto_existe > 0,
  'ALTER TABLE animal DROP COLUMN foto',
  'SELECT 1'
);

PREPARE stmt FROM @sql_drop_foto;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


