
  let jwt = require('jsonwebtoken');

  let SEED = require('../config/config').SEED;

  let middlewareToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, SEED, (error, decoded) => {

      if(error) {
         return res.status(401).json({
           ok : false,
           message : 'Token invalido'
         });
      }

      req.usuario = decoded.usuario;
      next();
    });

  };

  // verifica admin
  let verificaADMIN_ROLE = (req, res, next) => {

    let usuario = req.usuario;

    if(usuario.role === 'ADMIN_ROLE'){
        next();
        return;
    } else {

      return res.status(401).json({
        ok : false,
        message : 'Token invalido'
      });
    }

  };

  // verificar que el usuario sea el mismo o sea ADMIN_ROLE
  let verificaUsuario = (req, res, next) => {
    let id = req.params.id;
    let usuario = req.usuario;

    if( id === usuario._id || usuario.role === 'ADMIN_ROLE' ){
        next();
    } else {
      return res.status(401).json({
        ok : false,
        message : 'No esta permitido'
      });
    }

  };



  module.exports = { middlewareToken, verificaADMIN_ROLE, verificaUsuario };
