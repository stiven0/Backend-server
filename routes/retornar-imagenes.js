
  let express = require('express');
  let app = express();

  let fs = require('fs');
  let path = require('path');

  // rutas
  app.get('/:tipo/:imagen', (req, res, next) => {

    let tipo = req.params.tipo;
    let img = req.params.imagen;

    let pathImg = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);
    let pathNoImg = path.resolve(__dirname,'../assets/no-img.jpg');

    // comprobar si la imagen existe
    if(fs.existsSync(pathImg)){
        return res.sendFile(pathImg)

        // si la imagen no existe
    } else {
        return res.sendFile(pathNoImg);
    }



  });

  module.exports = app;
