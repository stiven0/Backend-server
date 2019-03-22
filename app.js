  //  requires
  let colors = require('colors'); // colores en la console de comandos
  let express = require('express');
  let mongoose = require('mongoose');
  let bodyParser = require('body-parser');

  // inicializar variables
  let app = express();

  // middlewares bodyParser
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({extended:false}));
  app.use(bodyParser.json());

  // importar rutas
  let appRoutes = require('./routes/app');
  let appRoutesUser = require('./routes/usuario');
  let appLogin = require('./routes/login');

  // conexion BD
  mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser:true, useCreateIndex:true})

          .then(() => {
            console.log('Conexion a la base de datos establecida'.gray);
          })
          .catch(error => console.log(error));

  // Rutas
  app.use('/usuario', appRoutesUser);
  app.use('/login', appLogin);
  app.use('/', appRoutes);

  // escuchar peticiones
  app.listen(3000, () => {
    console.log('Servidor Corriendo en el puerto 3000'.magenta);
 });
