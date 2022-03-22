var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

//==========================
//verficar token
//==========================
exports.verficaToken = function(req, res, next) {

    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
      if(err){
          return res.status(401).json({
            ok: false,
            mensaje: 'token incorrecto',
            errors: err
        });
      }

      req.usuario = decoded.usuario;
      next();
    });
}
  
//==========================
//verficar admin
//==========================
exports.verficaADMIN_ROLE = function(req, res, next) {

    var usuario =req.usuario;
    if(usuario.role === 'ADMIN_ROLE'){
      next();
      return;
    } else {
      return res.status(401).json({
        ok: false,
        mensaje: 'token incorrecto - no es administrador',
        errors: {message: 'no es administrador'}
      });
    }
}

//==========================
//verficar admin o mismo usuario
//==========================
exports.verficaADMIN_o_MismoUsuario = function(req, res, next) {

    var usuario =req.usuario;
    var id = req.params.id;

    if(usuario.role === 'ADMIN_ROLE' || usuario._id === id){
      next();
      return;
    } else {
      return res.status(401).json({
        ok: false,
        mensaje: 'token incorrecto - no es administrador ni es el mismo usuario',
        errors: {message: 'no es administrador'}
      });
    }
}
  