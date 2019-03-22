
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

  }

  module.exports = middlewareToken;
