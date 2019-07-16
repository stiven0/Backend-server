
  let express = require('express');
  let app = express();

  let SEED = require('../config/config').SEED;

  // brypt
  let bcrypt = require('bcrypt');

  // jwt
  let jwt = require('jsonwebtoken');

  // modelo usuario
  let Usuario = require('../models/usuario');

  // middleware token
  let { middlewareToken } = require('../middlewares/token');

  // google
  let CLIENT_ID = require('../config/config').CLIENT_ID;
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(CLIENT_ID);

  // login google
  async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });

    const payload = ticket.getPayload(); // payload datos del usuario

    // console.log(payload); // informacion que regresa el payload

    // retornamos el nombre, email, la imagen, y un booleano que certifique que el usuario es de google
    return {
        nombre : payload.name,
        email : payload.email,
        img : payload.picture,
        google : true
    }
  };
  // ruta para renovar un token
  app.get('/renueva-token', middlewareToken, (req, res) => {

    // si pasa el middlewareToken renovamos el token

    // generamos el token
    let token = jwt.sign(
      { usuario : req.usuario },
      SEED, { expiresIn : '4h'} );

    return res.status(200).json({
      ok : true,
      token
    });

  });

  // ruta para logueo de user por google
  app.post('/google', async (req, res) => {

    let tokenGoogle = req.body.tokenGoogle; // recibimos el token
    let googleUser = await verify(tokenGoogle) // recibimos en googleuser lo que retorne verify

        // manejamos el error
        .catch(error => {
           return res.status(403).json({
            ok : false,
            message : 'Token no valido'
            })
          });

    // buscamos si el usuario existe en la DB
    Usuario.findOne({ email : googleUser.email }, (error, usuarioDB) => {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error del servidor',
            errors : error
          });
      }

      // si el usuario existe en la base de datos
      if(usuarioDB){
          if(usuarioDB.google === false){ // si el usuario se ha registrado por el metodo normal
              return res.status(400).json({
                ok : false,
                message : 'Debes ingresar por el login normal'
              });

            } else { // si el usuario se ha registrado por google anteriormente
              let token = jwt.sign(
                { usuario : usuarioDB }, SEED, { expiresIn : '4h' });

                 res.status(200).json({
                   ok : true,
                   usuario : usuarioDB,
                   id : usuarioDB._id,
                   token,
                   menu : obtenerMenu(usuarioDB.role)
                 });
          }

      } else { // si el usuario no se ha registrado, lo hacemos con base en sus datos que provee google
          let usuario = new Usuario({
            nombre : googleUser.nombre,
            email : googleUser.email,
            img : googleUser.img,
            google : true
          });

          usuario.save((error, usuarioGuardado) => { // guardamos el usuario en la base de datos

            if(error) {
                return res.status(500).json({
                  ok : false,
                  message : 'Error del servidor',
                  errors : error
                });
            }

            // creamos el token
            let token = jwt.sign(
              { usuario : usuarioGuardado }, SEED, { expiresIn : '4h' });

            res.status(201).json({
                ok : true,
                usuario : usuarioGuardado,
                id : usuarioGuardado._id,
                token,
                menu : obtenerMenu(usuarioGuardado.role)
            });
          });
      }
    });
  });


  // login normal
  app.post('/', (req, res) => {
    let body = req.body;

    Usuario.findOne({ email : body.email }, (error, usuarioExistente) => {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error en base de datos',
            errors : error
          });
      }

      if(!usuarioExistente) {
          return res.status(404).json({
            ok : false,
            message : 'El correo es incorrecto',
          });
      }

      if(!bcrypt.compareSync(body.password, usuarioExistente.password)){
          return res.status(404).json({
            ok : false,
            message : 'La contraseña es incorrecta',
          });
      }

      // generamos el token
      let token = jwt.sign({
          usuario : usuarioExistente
          }, SEED, { expiresIn : '4h'} );

      res.status(200).json({
          ok : true,
          usuario : usuarioExistente,
          id : usuarioExistente._id,
          token,
          menu : obtenerMenu(usuarioExistente.role)
      });
    });
  });


  // funcion para devolver el menu que se mostrara en el sidebar, dependiendo de que tipo de usuario es
  function obtenerMenu(role){
    let menu = [{
        titulo : 'Principal',
        icono : 'mdi mdi-gauge',

        submenu : [
          { titulo : 'Dashboard', url : '/dashboard' },
          { titulo : 'ProgressBar', url : '/progress' },
          { titulo : 'Graficas', url : '/graficas1' },
          { titulo: 'Promesas', url : '/promesas' },
          { titulo: 'Rxjs', url : '/rxjs' }
        ]},

      {
        titulo : 'Mantenimientos',
        icono : 'mdi mdi-folder-lock-open',

        submenu : [
          // { titulo : 'Usuarios', url : '/usuarios' },
          { titulo : 'Hospitales', url : '/hospitales' },
          { titulo : 'Medicos', url : '/medicos' }
        ]
      }];

      // si el usuario es ADMIN_ROLE agregamos al array de submenu en su posicion 2 una nueva opcion Usuarios
      if( role === 'ADMIN_ROLE'){
          menu[1].submenu.unshift({ titulo : 'Usuarios', url : '/usuarios' });
      }

      return menu;

  };


  module.exports = app;
