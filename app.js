  //  requires
  let colors = require('colors'); // colores en la console de comandos
  let express = require('express');
  let mongoose = require('mongoose');

  // inicializar variables
  let app = express();

  // conexion BD
  // mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser:true})

          .then(() => {
            console.log('Conexion a la base de datos establecida'.gray);
          })
          .catch(error => console.log(error));

  // rutas
  app.get('/', (req, res, next) => {
    res.status(200).json({
      ok : true,
      message : 'Bienvenido'
     });
  });


  // escuchar peticiones
  app.listen(3000, () => {
    console.log('Servidor Corriendo en el puerto 3000'.magenta);
git
