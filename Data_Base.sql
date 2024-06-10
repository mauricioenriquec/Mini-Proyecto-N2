use information;

drop table if exists usuario;

CREATE TABLE user (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(50),
    apellidos VARCHAR(50) ,
    direccion VARCHAR(150),
    correo_electronico VARCHAR(50) NOT NULL UNIQUE ,
    dni VARCHAR(8) NOT NULL UNIQUE,
    edad INTEGER,
    telefono VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP    
);

INSERT INTO user (nombres,apellidos,direccion,correo_electronico,dni,edad,telefono)
VALUES ("MAURICIO ENRIQUE", "CARDOZO RODRIGUEZ", "VENEZUELA PUERTO ORDAZ", "CAR21072@BYUI.EDU", "26455087", 30, "4249066177"),
("MAURICIO ENRIQUE2", "CARDOZO RODRIGUEZ2", "VENEZUELA PUERTO ORDAZ", "1CAR21072@BYUI.EDU", "26455088", 30, "4249066178");
