
  let express = require('express');
  let app = express();

  let Medico = require('../models/medico');

  // middleware-token
  let {middlewareToken} = require('../middlewares/token');

  app.get('/', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .skip(desde)
    .limit(5)
    .exec((error, medicosEncontrados) => {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error en base de datos',
            errors : error
          });
      }

      if(medicosEncontrados.length === 0 ) {
          return res.status(404).json({
            ok : false,
            message : 'Error no hay medicos para mostrar',
          });
      }

      Medico.countDocuments({}, (error, conteo) => {

        res.status(200).json({
          ok : true,
          medicos : medicosEncontrados,
          total : conteo
        });
      });

    });
  });

  // retornar un medico
  app.get('/:id', (req, res) => {
    let id = req.params.id;

    Medico.findById(id)
    .populate('usuario', 'nombre email img')
    .populate('hospital')
    .exec((error, medicoEncontrado) => {

      if(error){
          return res.status(500).json({
            ok: false,
            error : 'Error en base de datos',
            errors : error
          });
      }

      if(!medicoEncontrado){
          return res.status(404).json({
            ok : false,
            message : 'No existe este medico'
          });
      }

      res.json({
        ok : true,
        medico : medicoEncontrado
      });

    });
  });

  // guardar un nuevo medico
  app.post('/', middlewareToken, (req, res) => {

    let body = req.body;

    let medico = new Medico({
      nombre : body.nombre,
      usuario : req.usuario._id,
      hospital : body.hospital
    });

    medico.save((error, medicoCreado) => {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error en base de datos',
            errors : error
          });
      }

      res.status(200).json({
        ok : true,
        medico : medicoCreado
      });
    });
  });

  // actualizar un medico
  app.put('/:id', middlewareToken, (req, res) => {

    let medicoId = req.params.id;
    let datos = req.body;

    Medico.findById(medicoId, (error, medicoDB) => {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error en base de datos',
            errors : error
          });
      }

      if(!medicoDB) {
          return res.status(500).json({
            ok : false,
            message : 'Error este medico no esta disponible',
          });
      }

      medicoDB.nombre = datos.nombre;
      medicoDB.usuario = req.usuario._id;
      medicoDB.hospital = datos.hospital;

      medicoDB.save((error, medicoActualizado) => {

        if(error) {
            return res.status(500).json({
              ok : false,
              message : 'Error en base de datos',
              errors : error
            });
        }

        res.status(200).json({
          ok : true,
          Medico : medicoActualizado
        });
      });
    });
  });

  // borrar un medico
  app.delete('/:id', middlewareToken, (req, res) => {

    let medicoId = req.params.id;

    Medico.findByIdAndDelete(medicoId, (error, medicoBorrado) => {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error en base de datos',
            errors : error
          });
      }

      if(!medicoBorrado) {
          return res.status(400).json({
            ok : false,
            message : 'Error el medico a borrar no esta disponible',
          });
      }

      res.status(200).json({
        ok : true,
        medico : medicoBorrado
      });
    });

  });

  module.exports = app;
