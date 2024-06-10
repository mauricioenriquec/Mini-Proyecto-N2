const fs = require('fs');
const http = require('http');
const path = require('path');
require('dotenv').config();
const { usuarioList, usuarioInsert } = require(path.join(__dirname, "request.js"));

// Crear un servidor HTTP
const server = http.createServer(async (req, res) => {
    try {
        if (req.method === "GET") {
            if (req.url === "/") {
                console.log("===Pagina principal===");
                return showMainPage(res);
            }
            // Exportar datos en csv
            else if (req.url === "/api/usuarios") {
                console.log("===Exportacion de usuarios===");
                const usuarioAll = await usuarioList();
                grabarArchivoCsv(usuarioAll);
                res.writeHead(200, { "Content-Type": "text/x-csv" });
                res.end(JSON.stringify(usuarioAll));
            }
            // Importar datos en csv
            else if (req.url === "/api/usuarios/import") {
                console.log("===Importacion de usuarios===");
                const usuarioAll = await usuarioList();
                await leerArchivoCsv(usuarioAll);
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end('Importación completada');
            } else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not Found");
            }
        } else {
            // Manejar otras rutas o métodos
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Method not Implemented");
        }
    } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end('Internal Server Error');
    }
});

server.listen(process.env.PORT_API, () => {
    console.log(`Servidor escuchando en el puerto ${process.env.PORT_API}`);
});

/*===Funciones===*/
function showMainPage(res) {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
}

function grabarArchivoCsv(usuarioAll) {
    let texto = "id,nombres,apellidos,direccion,correo,dni,edad,telefono,fecha_creacion\n";

    usuarioAll.forEach(elemento => {
        texto += Object.values(elemento).join(',') + "\n";
    });

    fs.writeFile('./usuarios.csv', texto, err => {
        if (err) {
            console.log('Hubo un error: ', err);
        } else {
            console.log('Operación exitosa');
        }
    });
}

function grabarArchivo(nombreArchivo, contenido) {
    fs.writeFile(`./${nombreArchivo}`, contenido, err => {
        if (err) {
            console.log('Hubo un error: ', err);
        } else {
            console.log('Operación exitosa');
        }
    });
}

async function leerArchivoCsv(usuarioAll) {
    let mensajeError = "";
    let flag = false;
    const regexCorreo = /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/;

    fs.readFile('usuarios.csv', 'utf-8', (err, data) => {
        if (err) {
            console.log('error: ', err);
            return;
        } else {
            const lineas = data.split(/\r?\n/);
            let numLinea = 1;
            lineas.forEach(linea => {
                if (numLinea > 1 && linea.length > 0) {
                    flag = false;
                    const dato = linea.split(",");
                    usuarioAll.forEach(usuario => {
                        // Validacion de id, correo y dni no repetidos
                        if (usuario.id == dato[0] || usuario.correo == dato[4] || usuario.dni == dato[5]) {
                            flag = true;
                            mensajeError += `Datos repetidos --> fila [${numLinea}]\n`;
                        }
                    });
                    // Validaciones adicionales
                    if (!flag && !regexCorreo.test(dato[4])) {
                        mensajeError += `Formato de correo incorrecto --> fila [${numLinea}]\n`;
                    }
                }
                numLinea++;
            });

            // Si existen errores
            if (mensajeError.length > 0) {
                console.log("Existen errores");
                mensajeError = "Error\n" + mensajeError;
                grabarArchivo("errores.txt", mensajeError);
            } else {
                // Insertar en la base de datos
                numLinea = 1;
                lineas.forEach(async (linea) => {
                    if (numLinea > 1 && linea.length > 0) {
                        const dato = linea.split(",");
                        const usuario = {
                            id: dato[0],
                            nombres: dato[1],
                            apellidos: dato[2],
                            direccion: dato[3],
                            correo: dato[4],
                            dni: dato[5],
                            edad: dato[6],
                            telefono: dato[7]
                        };
                        try {
                            await usuarioInsert(usuario);
                        } catch (error) {
                            console.error(`Error al insertar usuario en la línea ${numLinea}:`, error);
                        }
                    }
                    numLinea++;
                });
            }
        }
    });
}
