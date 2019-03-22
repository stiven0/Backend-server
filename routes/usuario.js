
  let express = require('express');
  let app = express();

  // brypt
  let bcrypt = require('bcrypt');

  // modelo usuario
  let Usuario = require('../models/usuario');

  // middleware-token
  let middlewareToken = require('../middlewares/token');

  // ruta para obtener todos los usuarios
  app.get('/', (req, res) => {

    Usuario.find({}, 'nombre email img role')
    .exec((error, usuariosEncontrados) => {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error en base de datos',
            errors : error
          });
      }

      if(usuariosEncontrados.length === 0 ) {
          return res.status(404).json({
            ok : false,
            message : 'No existen usuarios en este momento'
          });
      }

      res.status(200).json({
        ok : true,
        usuarios : usuariosEncontrados
      });

    });

  });

  // metodo para guardar un usuario en la base de datos
  app.post('/', (req, res) => {

    let datos = req.body;

    let user = new Usuario({
      nombre : datos.nombre,
      email : datos.email,
      password : bcrypt.hashSync(datos.password, 10),
      img : datos.img,
      role : datos.role
    });

    user.save((error, usuarioGuardado) => {

      if(error) {
          return res.status(400).json({
            ok : false,
            message : 'Error al crear usuario',
            errors : error
          });
      }

      res.status(201).json({
        ok : true,
        user : usuarioGuardado
      });

    });
  });

  // actualizar un usuario
  app.put('/:id', middlewareToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Usuario.findById(id, (error, usuarioEncontrado) => { // buscar el usuario por id

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error al buscar usuario',
            errors : error
          });
      }

      if(!usuarioEncontrado) {
          return res.status(404).json({
            ok : false,
            message : 'El usuario no existe',
            errors : error
          });
      }

      // datos a actualizar
      usuarioEncontrado.nombre = body.nombre;
      usuarioEncontrado.email = body.email;
      usuarioEncontrado.role = body.role;

      usuarioEncontrado.save((error, usuarioGuardado) => { // guardar los datos nuevos

        if(error) {
            return res.status(400).json({
              ok : false,
              message : 'Error al actualizar usuario',
              errors : error
            });
        }

        res.status(200).json({
          ok : true,
          usuario : usuarioGuardado
        });
      });
    });
  });

  // borrar un usuario
  app.delete('/:usuarioId', middlewareToken, (req, res) => {

    let id = req.params.usuarioId;

    Usuario.findByIdAndDelete(id, (error, usuarioEliminado) => {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error en la base de datos',
            errors : error
          });
      }

      if(!usuarioEliminado) {
          return res.status(400).json({
            ok : false,
            message : 'Error no fue posible eliminar el usuario',
            errors : error
          });
      }

      res.status(200).json({
        ok : true,
        message : 'El usuario se ha eliminado correctamente'
      });
    });
  });



  module.exports = app;
