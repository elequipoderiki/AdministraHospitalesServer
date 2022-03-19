var express = require("express");
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Hospital = require("../models/hospital");

//==========================================
//obtener todos los hospitales
//==========================================

app.get("/", (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
  .skip(desde)
  .limit(5)
  .populate('usuario', 'nombre email')
  .exec((err, hospitales) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "error cargando hospital",
        errors: err,
      });
    }

    Hospital.count({}, (err, conteo) => {
      res.status(200).json({
        ok: true,
        hospitales: hospitales,
        total: conteo
      });
    });
  });
});


//================================================
// obtener hospital por id
//================================================
app.get('/:id', (req, res) => {
	var id = req.params.id;
	Hospital.findById(id)
		.populate('usuario', 'nombre img email')
		.exec((err, hospital) => {
			if(err) {
				return res.status(500).json({
					ok: false,
					mensaje: 'error al buscar hospital',
					errors: err
				});
			}
			if (!hospital){
				return res.status(400).json({
					ok: false,
					mensaje: 'el hospital con el id '+id+' no existe',
					errors: {message: 'no existe un hospital con ese id'}					
			  });
		  }
      res.status(200).json({
        ok: true,
        hospital: hospital
      });
    });	
});


//================================================
//actualizar hospital
//================================================

app.put('/:id', mdAutenticacion.verficaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital)=>{
      
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "error al buscar hospital",
        errors: err,
      });
    }    

    if(!hospital){
      return res.status(400).json({
        ok: false,
        mensaje: 'el hospital con el id' + id + 'no existe',
        errors: { message: 'no existe un hospital con ese id'}
      });
    }

    hospital.nombre = body.nombre;
    //hospital.img = body.img;
    hospital.usuario = req.usuario._id;

    hospital.save( (err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "error al actualizar hospital",
          errors: err,
        });
      }    
      
      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado,
      });  
    });

  });

});

//===============================================
//crear un nuevo hospital
//================================================

app.post("/", mdAutenticacion.verficaToken, (req, res) => {
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "error al crear hospital",
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado,
    });
  });

});

//================================================
//borrar un hospital
//================================================

app.delete('/:id', mdAutenticacion.verficaToken, (req, res) =>{
  var id = req.params.id;
  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "error al borrar hospital",
        errors: err,
      });
    }

    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "no existe un hospital con ese id",
        errors: {message: 'no existe un hospital con ese id'} ,
      });
    }

    res.status(200).json({
      ok: true,
      hospital: hospitalBorrado,
    });

  });
});

module.exports = app;
