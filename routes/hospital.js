
  let express = require('express');
  let app = express();

  // modelo Hospital
  let Hospital = require('../models/hospital');

  // middleware token
  let middlewareToken = require('../middlewares/token');

  // retornar todos los hospitales
  app.get('/', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .populate('usuario', 'nombre email')
    .skip(desde)
    .limit(5)
    .exec((error, hospitalesEncontrados)=> {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error en base de datos',
            errors : error
          });
      }

      if(hospitalesEncontrados.length === 0 ) {
          return res.status(404).json({
            ok : false,
            message : 'Error no hay hospitales para mostrar',
          });
      }

      Hospital.countDocuments({}, (error, conteo) => {

        res.status(200).json({
          ok : true,
          Hospital : hospitalesEncontrados,
          total : conteo
        });
      });
    });
  });

  // metodo para guardar un hospital en la base de datos
  app.post('/', middlewareToken, (req, res) => {

    let body = req.body;

    let hospital = new Hospital({
      nombre : body.nombre,
      usuario : req.usuario._id
    });

    hospital.save((error, hospitalGuardado) => {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error en base de datos',
            errors : error
          });
      }

      if(!hospitalGuardado) {
          return res.status(400).json({
            ok : false,
            message : 'Error al guardar los datos',
          });
      }

      res.status(200).json({
        ok : true,
        hospital : hospitalGuardado
      });
    });
  });

  // metodo para actualizar los datos de un hospital
  app.put('/:id', middlewareToken, (req, res) => {

    let hospitalId = req.params.id;
    let datos = req.body;

    Hospital.findById(hospitalId, (error, hospitalDB) => {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error en base de datos',
            errors : error
          });
      }

      if(!hospitalDB) {
          return res.status(400).json({
            ok : false,
            message : 'Error el hospital buscado no esta disponible',
          });
      }

      hospitalDB.nombre = datos.nombre;
      hospitalDB.usuario = req.usuario._id;

      hospitalDB.save((error, hospitalActualizado) => {

        if(error) {
            return res.status(400).json({
              ok : false,
              message : 'Error al actualizar los datos del hospital',
              errors : error
            });
        }

        res.status(200).json({
          ok : true,
          Hospital : hospitalActualizado
        });
      });
    });
  });

  // metodo para borrar un hospital de la base de datos
  app.delete('/:id', middlewareToken, (req, res) => {

    let hospitalId = req.params.id;

    Hospital.findByIdAndDelete(hospitalId, (error, hospitalBorrado) => {

      if(error) {
          return res.status(500).json({
            ok : false,
            message : 'Error en base de datos',
            errors : error
          });
      }

      if(!hospitalBorrado) {
          return res.status(400).json({
            ok : false,
            message : 'Error el hospital a borrar no esta disponible',
          });
      }

      res.status(200).json({
        ok : true,
        hospital : hospitalBorrado
      });
    });
  });



  module.exports = app;
