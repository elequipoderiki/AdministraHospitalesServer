var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    
    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if(tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'tipo de coleccion no es valida',
            errors: {message: 'tipo de coleccion no es valida'}
        });
    }

    if( !req.files){
        return res.status(500).json({
            ok: false,
            mensaje: 'no selecciono imagen',
            errors: {message: 'debe seleccionar imagen'}
        });
    }

    //obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];
    
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if(extensionesValidas.indexOf( extensionArchivo) < 0){
        return res.status(500).json({
            ok: false,
            mensaje: 'extension no valida',
            errors: {message: 'las extensiones validas son '+ extensionesValidas.join(',')}
        });
    }

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'error al mover archivo imagen',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res){
    if(tipo ==='usuarios'){
        Usuario.findById(id, (err, usuario) => {
            if(!usuario){
                return res.status(400).json({
                    ok:true,
                    mensaje: 'usuario no existe',
                    errors: {message: 'usuario no existe'}
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo, (err)=>{
                    if(err) throw err;
                });
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
            
                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error al guardar imagen en usuario',
                        errors: err
                    });        
                }
                
                usuarioActualizado.password = '';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de usuario actualizado',
                    usuario:  usuarioActualizado 
                });
            });
        });
    }
    if(tipo ==='medicos'){
        Medico.findById(id, (err, medico) => {
            if(!medico){
                return res.status(400).json({
                    ok:true,
                    mensaje: 'medico no existe',
                    errors: {message: 'medico no existe'}
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo, (err)=>{
                    if(err) throw err;
                });
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
            
                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error al guardar imagen en medico',
                        errors: err
                    });        
                }
                
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de medico actualizado',
                    medico:  medicoActualizado 
                });
            });
        });

    }
    if(tipo ==='hospitales'){
        Hospital.findById(id, (err, hospital) => {
            if(!hospital){
                return res.status(400).json({
                    ok:true,
                    mensaje: 'hospital no existe',
                    errors: {message: 'hospital no existe'}
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo, (err)=>{
                    if(err) throw err;
                });
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
            
                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error al guardar imagen en hospital',
                        errors: err
                    });        
                }
                
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de hospital actualizado',
                    hospital:  hospitalActualizado 
                });
            });
        });

    }
}

module.exports = app;