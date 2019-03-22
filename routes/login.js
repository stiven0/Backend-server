
  let express = require('express');
  let app = express();

  let SEED = require('../config/config').SEED;

  // brypt
  let bcrypt = require('bcrypt');
  // jwt
  let jwt = require('jsonwebtoken');

  // modelo usuario
  let Usuario = require('../models/usuario');

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
          }, SEED, { expiresIn : '24h'} );

      res.status(200).json({
          ok : true,
          usuario : usuarioExistente,
          token
      });
    });
  });


  module.exports = app;
