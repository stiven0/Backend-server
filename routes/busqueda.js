
  let express = require('express');
  let app = express();

  let Hospital = require('../models/hospital');
  let Medico = require('../models/medico');
  let Usuario = require('../models/usuario');

  // busqueda por coleccion
  app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    let termino = req.params.busqueda;
    let tabla = req.params.tabla;
    let regex = new RegExp(termino, 'i');

    let promesa;

    // switch - case para determinar en que coleccion buscar
    switch (tabla) {

      case 'usuarios':
        promesa = buscarUsuarios(termino, regex);
        break;

      case 'medicos':
        promesa = buscarMedicos(termino, regex);
        break;

      case 'hospitales':
        promesa = buscarHospitales(termino, regex);
        break;

      default:
        return res.status(404).json({
          ok : false,
          message : 'No existe esta coleccion'
        });
    }

    promesa.then(response => {
            res.status(200).json({
              ok : true,
              [tabla] : response
            });
    })
    .catch(error => {
      return  res.status(500).json({
        message : error
      });
    });

  });

  // ruta para realizar busqueda en todas las colecciones
  app.get('/todo/:busqueda', (req, res) => {

    let termino = req.params.busqueda;
    let regex = new RegExp(termino, 'i');

    // Promise.all - para retornar todas las promesas que esten entre las []
    Promise.all([
                buscarHospitales(termino, regex),
                buscarMedicos(termino, regex),
                buscarUsuarios(termino, regex)
              ])
              // en el response vendra un array de con los resultados de las promesas ejecutadas
             .then(response => {

               res.status(200).json({
                   ok : true,
                   hospitales : response[0],
                   medicos : response[1],
                   usuarios : response[2]
               })
             })
             .catch(error => {
               return res.status(500).json({
                 ok : false,
                 error : error
               });
             });

    });

    // funcion que retornara una promesa con los resultados de la busqueda de los hospitales
    function buscarHospitales(termino, regex) {

      return new Promise((resolve, reject) => {

        Hospital.find({ nombre : regex })
          .populate('usuario', 'nombre email')
          .exec((error, hospitalesEncontrados) => {

            if(error) {
                reject('Error al cargar hospitales', error);
            } else {
                resolve(hospitalesEncontrados);
            }

          });
        });

    }

    // funcion que retornara una promesa con los resultados de la busqueda de los medicos
    function buscarMedicos(termino, regex) {

      return new Promise((resolve, reject) => {

        Medico.find({ nombre : regex })
          .populate('usuario', 'nombre email')
          .populate('hospital')
          .exec((error, medicosEncontrados) => {

            if(error) {
                reject('Error al cargar los medicos', error);
            } else {
                resolve(medicosEncontrados);
            }
          })
        });
    }

    // funcion que retornara una promesa con los resultados de la busqueda de los usuarios
    function buscarUsuarios(termino, regex) {

      return new Promise((resolve, reject) => {

        Usuario.find()
                // .or - para buscar en dos propiedades de la misma coleccion
               .or([ { 'nombre' : regex }, { 'email' : regex } ])
               .exec((error, usuariosEncontrados) => {

                 if(error) {
                     reject('Error al cargar los usuarios', error);
                 } else {
                     resolve(usuariosEncontrados);
                 }

               });
      });
    }


  module.exports = app;
