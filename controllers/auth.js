const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { generarJWT } = require('../helpers/jwt');

// La importacion de express y el response
// es para recuperar la intelisense
const crearUsuario = async (req, res = response) => {

    const { email, password } = req.body;

    try {
        // Verificar que el email no se repita
        let usuario = await Usuario.findOne({ email: email });

        if (usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Un usuario ya existe con ese correo',
            })
        }

        usuario = new Usuario(req.body);

        // Encriptar el password
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        await usuario.save();

        // Generar JWT
        const token = await generarJWT(usuario.id, usuario.name);

        return res.status(201).json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el admin',
        });
    }
};

const loginUsuario = async(req, res = response) => {

    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email: email });

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese email',
            });
        }

        // Confirmar los passwords
        const validPassword = bcrypt.compareSync(password, usuario.password);

        // Si el password no es correcto
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'El password es incorrecto',
            });
        }

        // Generar nuestro JWT
        const token = await generarJWT(usuario.id, usuario.name);

        return res.status(201).json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token,
        });
        

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el admin',
        });
    }
};

const revalidarToken = async(req, res = response) => {

    const uid = req.uid;
    const name = req.name;

    // Generar un nuevo JWT y retornarlo en esta peticion
    const token = await generarJWT(uid, name);

    return res.status(201).json({
        ok: true,
        token,
    });
};


module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken,
}