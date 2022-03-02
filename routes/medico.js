var express = require("express");
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Medico = require("../models/medico");

//==========================================
//obtener todos los medicos
//==========================================

app.get("/", (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
  .skip(desde)
  .limit(5)
  .populate('usuario', 'nombre email')
  .populate('hospital')
  .exec((err, medicos) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "error cargando medico",
        errors: err,
      });
    }

    Medico.count({}, (err, conteo)=>{
      res.status(200).json({
        ok: true,
        medicos: medicos,
        total: conteo
      });
    });
  });
});

//================================================
//actualizar medico
//================================================

app.put('/:id', mdAutenticacion.verficaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico)=>{
      
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "error al buscar medico",
        errors: err,
      });
    }    

    if(!medico){
      return res.status(400).json({
        ok: false,
        mensaje: 'el medico con el id' + id + 'no existe',
        errors: { message: 'no existe un medico con ese id'}
      });
    }

    medico.nombre = body.nombre;
    medico.hospital = body.hospital;
    medico.usuario = req.usuario._id;

    medico.save( (err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "error al actualizar medico",
          errors: err,
        });
      }    
      
      res.status(200).json({
        ok: true,
        medico: medicoGuardado,
      });  
    });

  });

});

//===============================================
//crear un nuevo medico
//================================================

app.post("/", mdAutenticacion.verficaToken, (req, res) => {
  var body = req.body;

  var medico = new Medico({
    nombre : body.nombre,
    hospital: body.hospital,
    usuario: req.usuario._id

  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "error al crear medico",
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      medico: medicoGuardado,
    });
  });

});

//================================================
//borrar un medico
//================================================

app.delete('/:id', mdAutenticacion.verficaToken, (req, res) =>{
  var id = req.params.id;
  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "error al borrar medico",
        errors: err,
      });
    }

    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "no existe un medico con ese id",
        errors: {message: 'no existe un medico con ese id'} ,
      });
    }

    res.status(200).json({
      ok: true,
      medico: medicoBorrado,
    });

  });
});

module.exports = app;
