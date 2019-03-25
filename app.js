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
  let appHospital = require('./routes/hospital');
  let appMedico = require('./routes/medico');
  let appBusqueda = require('./routes/busqueda');
  let appUpload = require('./routes/upload');
  let appImagenes = require('./routes/retornar-imagenes');

  // conexion BD
  mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser:true, useCreateIndex:true})

          .then(() => {
            console.log('Conexion a la base de datos establecida'.gray);
          })
          .catch(error => console.log(error));

  // server index config
  // let serveIndex = require('serve-index');
  // app.use(express.static(__dirname + '/'));
  // app.use('/uploads', serveIndex(__dirname + '/uploads'));

  // Rutas
  app.use('/usuario', appRoutesUser);
  app.use('/login', appLogin);
  app.use('/hospital', appHospital);
  app.use('/medico', appMedico);
  app.use('/busqueda', appBusqueda);
  app.use('/upload', appUpload);
  app.use('/img', appImagenes);
  app.use('/', appRoutes);

  // escuchar peticiones
  app.listen(3000, () => {
    console.log('Servidor Corriendo en el puerto 3000'.magenta);
 });
