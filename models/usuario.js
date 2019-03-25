
  let mongoose = require('mongoose');
  let uniqueValidator = require('mongoose-unique-validator');

  let Schema = mongoose.Schema;

  // roles validos
  let roleValidos = {
    values : ['USER_ROLE', 'ADMIN_ROLE'],
    message : '{VALUE} No es un rol permitido' // mensaje de error
  };

  let usuarioSchema = new Schema({

    nombre : {
      type : String,
      required : [true, 'El nombre es necesario']
    },

    email : {
      type : String,
      unique : true,
      required : [true, 'El correo es necesario']
    },

    password : {
      type : String,
      required : [this.google === false, 'La contraseña es necesaria'],
    },

    img : {
      type : String,
      required : false
    },

    role : {
      type : String,
      required : true,
      default : 'USER_ROLE',
      enum : roleValidos // utilizar roles validos
    },

    google : {
      type : Boolean,
      defaul : false
    }

  });

  usuarioSchema.methods.toJSON = function(){ // no retornar la contraseña
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  usuarioSchema.plugin(uniqueValidator, { message : '{PATH} debe ser unico' });

  module.exports = mongoose.model('Usuario', usuarioSchema);
