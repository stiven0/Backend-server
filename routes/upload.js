  // ruta para subir archivos a la base de datos

  let express = require('express');
  let fileUpload = require('express-fileupload');
  let app = express();

  let path = require('path');
  let fs = require('fs');

  let Usuario = require('../models/usuario');
  let Medico = require('../models/medico');
  let Hospital = require('../models/hospital');

  app.use(fileUpload());

  // rutas
  app.put('/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // tipos de coleccion
    let coleccionesValidas = ['medicos', 'hospitales', 'usuarios'];

    // validacion de tipos
    if(coleccionesValidas.includes(tipo) === false){
          return res.status(400).json({
            ok : false,
            message : 'Coleccion invalida',
          });
    }

    // verificar si viene un archivo
    if(!req.files){
          return res.status(400).json({
            ok : false,
            message : 'Debes subir una imagen',
          });
    }

    // obtenr archivo subido
    let archivo = req.files.imagen;
    let nombreCortado = archivo.name.split('.');
    let extensionArchivo = nombreCortado[nombreCortado.length -1];

    // arreglo de imagenes validas
    let imagenesValidas = ['jpg', 'png', 'jpeg', 'gif'];

    // comprobar si la imagene subida es valida
    if(imagenesValidas.includes(extensionArchivo) === false){

        return res.status(400).json({
          ok : false,
          message : 'Archivo subido invalido, solo se permiten estensiones, ' + imagenesValidas.join(', ')
        });

    } else {

       // nombre archivo personalizado
       let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

       // mover el archivo
      let path = `./uploads/${ tipo }/${ nombreArchivo }`;

       archivo.mv( path, (error) => {

         if(error){
             return res.status(500).json({
               ok : false,
               message : 'Error al intentar mover el archivo',
               errors : error
             });
         }

         subirPorTipo(tipo, id, nombreArchivo, res);

       });
    }


  });

  // funcion para subir imagen al servidor dependiendo de su tipo
  function subirPorTipo(tipo, id, nombreArchivo, res) {

    if( tipo === 'usuarios' ){

        Usuario.findById(id, (error, usuarioDB) => {

          if(!usuarioDB){
              fs.unlinkSync(`./uploads/usuarios/${ nombreArchivo }`);
              return res.status(400).json({
                ok : false,
                message : 'Error este usuario no existe'
              });
          }

          let pathViejo = `./uploads/usuarios/${ usuarioDB.img }`;

          //  si existe elimina la imagen anterior
          if(fs.existsSync(pathViejo)){
              fs.unlinkSync(pathViejo);
          }

          // actualizar imagen
          usuarioDB.img = nombreArchivo;

          usuarioDB.save((error, usuarioActualizado) => {

            if(error){
                return res.status(500).json({
                  ok : false,
                  message : 'Error al intentar subir el archivo',
                  errors : error
                });
            }

            return res.status(200).json({
                  ok : true,
                  message : 'Imagen subida existosamente',
                  usuario : usuarioActualizado
                });
          });

        });

    }

    if( tipo === 'medicos' ){

      Medico.findById(id, (error, usuarioDB) => {

        if(!usuarioDB){
            fs.unlinkSync(`./uploads/medicos/${ nombreArchivo }`);
            return res.status(400).json({
              ok : false,
              message : 'Error este medico no existe'
            });
        }

        let pathViejo = `./uploads/medicos/${ usuarioDB.img }`;

        if(fs.existsSync(pathViejo)) {
            fs.unlinkSync(pathViejo);
        }

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((error, usuarioActualizado) => {

          if(error) {
              return res.status(500).json({
                ok : false,
                message : 'Error al intentar subir el archivo',
                errors : error
              });
          }

          return res.status(200).json({
                ok : true,
                message : 'Imagen subida existosamente',
                medico : usuarioActualizado
          });

        });


      });

    }
    if( tipo === 'hospitales' ){

      Hospital.findById(id, (error, usuarioDB) => {

        if(!usuarioDB){
            fs.unlinkSync(`./uploads/hospitales/${ nombreArchivo }`);
            return res.status(400).json({
              ok : false,
              message : 'Error este hospital no existe'
            });
        }

        let pathViejo = `./uploads/hospitales/${ usuarioDB.img }`;

        if(fs.existsSync(pathViejo)){
            fs.unlinkSync(pathViejo);
        }

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((error, usuarioActualizado) => {

          if(error) {
              return res.status(500).json({
                ok : false,
                message : 'Error al intentar subir el archivo',
                errors : error
              });
          }

          return res.status(200).json({
            ok : true,
            message : 'Imagen subida existosamente',
            hospital : usuarioActualizado

          });
        });
      });

    }


  };


  module.exports = app;
