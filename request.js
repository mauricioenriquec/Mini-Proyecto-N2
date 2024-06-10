
const cn = require("./connection.js");

const usuarioList = async () =>  {
    let query = "SELECT id, nombres, apellidos, direccion, correo_electronico, dni, edad, telefono, fecha_creacion FROM user";
    const[rs] = await cn.execute(query);
    return rs;
}
const usuarioInsert = async (usuario)=>{

    let query = "INSERT INTO user (id,nombres,apellidos,direccion,correo_electronico,dni,edad,telefono) VALUES "+
              " (?,?,?,?,?,?,?,?)";
    
    await cn.execute(query,[usuario.id, usuario.nombres, usuario.apellidos, usuario.direccion, usuario.correo, usuario.dni, usuario.edad, usuario.telefono]);
}

module.exports = {usuarioList, usuarioInsert};
