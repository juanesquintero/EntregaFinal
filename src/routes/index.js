const express = require('express')
const app = express()
const path = require('path')
//Para retilizar html o plantillas
const hbs = require('hbs')
//para encriptar y descriptar contraseñas 
const bcrypt =  require('bcrypt')
//JWT para manejo de session
const jwt = require('jsonwebtoken');
//Multer para subir archivos
const multer  = require('multer')
//SendGrid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//Schemas y modelos 
const Usuario =  require('../models/usuario')
const Curso = require('../models/curso')
const Inscripcion = require('../models/inscripcion')

//Directorios
const dirPartials = path.join(__dirname,'../../template/partials')
const dirViews = path.join(__dirname,'../../template/views')

//Helpers Views Partials
require('../helpers/helpers')
app.set('views',dirViews)
app.set('view engine', 'hbs')
hbs.registerPartials(dirPartials)

//ENDPOINT
app.get('/',(req,res)=>{
    res.render('index')
})
app.get('/chat',(req,res)=>{
    Usuario.findById(req.usuario,(err,result)=>{
        if(err) return res.render('mensaje',{mensaje:err})
        if(result){
            let avatar = result.avatar ? result.avatar.toString("base64") : null
            res.render('chat',{
                avatar: avatar,
                nombre: res.locals.nombre,
            })
        }else{
            res.render('mensaje',{
                mensaje:'<div class="alert alert-danger">\
                        <strong>ERROR!</strong> Sesion terminada.\
                        </div>'
            })
        }
    })   
})

//Cursos
app.get('/crearCurso',(req,res)=>{
    res.render('crearCurso')
})
app.get('/modificarCurso',(req,res)=>{
    Curso.find({}).exec((err, results)=>{
        if(err) return res.render('mensaje',{mensaje: err})
        res.render('modificarCurso',{
            listado : results
        })
    })
})
app.post('/modificarCurso',(req,res)=>{
    let {id, nombre, descripcion, intensidad, valor, modalidad} = req.body
    Curso.findOneAndUpdate({id: id},{
        nombre: nombre,
        descripcion: descripcion,
        intensidad: intensidad,
        valor: valor,
        modalidad: modalidad,
    },{new:true, runValidators: true, context: 'query' },(err, result)=>{
        if(err) return res.render('mensaje',{mensaje: err})
        if(result){
            res.render('mensaje',{
                mensaje: 'Curso <b>'+result.nombre+'</b> Modificado!',
            })
        }
    });

})

app.get('/cursos',(req,res)=>{
    Curso.find({}).exec((err, results)=>{
        if(err) return res.render('mensaje',{mensaje: err})
        res.render('cursos',{
            listado : results
        })
    })
})
app.post('/crearCurso',(req,res)=>{
    let {id, nombre, intensidad, valor, descripcion, modalidad} = req.body
    Curso.findOne({id: id},(err,result)=>{
        if(err) res.render('mensaje',{mensaje:err})
        if(result){
             res.render('mensaje',{
                mensaje:'<div class="alert alert-danger">\
                        <strong>ERROR!</strong> ID de Curso repetido.\
                        </div>'
            })
        } 
    })
    let curso = new Curso({
        id: id,
        nombre: nombre,
        intensidad: intensidad,
        valor: valor,
        descripcion: descripcion,
        modalidad: modalidad,
    });
    curso.save((err, result)=>{
        if(err) res.render('mensaje',{mensaje:err}) 
        if(result){
            res.render('mensaje',{
                mensaje:'Curso <b>'+ result.nombre+'</b> creado!'
            }) 
        }
    })
})

const mailInscritos = (listado) =>{
    listado.forEach(inscripcion => {
        Usuario.find({documento: inscripcion.documento},(err, result)=>{
            if(err) return res.render('mensaje',{mensaje: err})
            const msg= {
                to: result[0].email,
                from: 'juanquinteropardo@gmail.com',
                subject: 'Cambio de estado en curso '+inscripcion.curso+'!!',
                text:   'Hola '+inscripcion.estudiante+'\n nos alegra de que hayas escogido al TdeA para aprender de '+inscripcion.curso+
                        ' te informamos que el curso cambio de estado de disponibilidad.'+
                        '\nSaludos!'
            }
            sgMail.send(msg)
        }) 
    });
}

app.post('/actualizarCurso',(req,res)=>{
    let {id} = req.body
    Curso.findOne({id: id},(err,result)=>{
        let newEstado
        if(err) res.render('mensaje',{mensaje: err,})
        if(result){
            if(result.estado == "cerrado") newEstado = "disponible"
            else newEstado = "cerrado"
        } 
        Curso.findOneAndUpdate({id: id},{estado: newEstado},{new:true, runValidators: true, context: 'query' },(err, result)=>{
            if(err) return res.render('mensaje',{mensaje: err})
            if(result){
                Inscripcion.find({id: id}).exec((err, results)=>{
                    if(err) return res.render('mensaje',{mensaje: err}) 
                    mailInscritos(results)
                })
                res.render('mensaje',{mensaje: 'Curso <b>'+result.nombre+'</b> cambio de estado!'})
            } 
        });
    })
})

//Inscripciones
app.get('/inscribir',(req,res)=>{
    Curso.find({}).exec((err, results)=>{
        if(err) return res.render('mensaje',{mensaje: err}) 
        Usuario.findById(req.usuario,(err, result)=>{
            if(err) res.render('mensaje',{mensaje: err})
            res.render('inscribir',{
                listado: results,
                documento: result.documento,
                telefono: result.telefono,
                email: result.email
            })
        })
    })  
})
app.post('/inscribir',(req,res)=>{
    let {documento,id,nombre} = req.body
    let _id = documento+'|'+id
    Inscripcion.findOne({_id:_id},(err,result)=>{
        if(err) res.render('mensaje',{mensaje:err})
        if(result){
             res.render('mensaje',{
                mensaje:'<div class="alert alert-danger">\
                        <strong>ERROR!</strong>Ya se encuentra inscrito en este Curso.\
                        </div>'
            })
        } 
    })
    Curso.findOne({id:id},(err, result)=>{
        if(err) res.render('mensaje',{mensaje: err})
        let curso
        if(result) curso = result.nombre
        let inscripcion = new Inscripcion({
            _id: _id,
            documento:documento,
            estudiante: nombre,
            id: result.id,
            curso: curso,
        });
        inscripcion.save((err, result)=>{
            if(err) res.render('mensaje',{mensaje:err}) 
            if(result){
                res.render('mensaje',{
                    mensaje:'Estudiante <b>'+ result.estudiante+'</b> inscrito en <b>'+result.curso+'</b>!'
                }) 
            }
        })
    })
})
app.get('/inscritos',(req,res)=>{
    Inscripcion.find({}).exec((err, inscritos)=>{
        if(err) return res.render('mensaje',{mensaje: err})
        Curso.find({},(err, cursos)=>{
            if(err) return res.render('mensaje',{mensaje: err})
            // console.log(cursos,inscritos)
            res.render('inscritos',{
                cursos : cursos,
                inscritos: inscritos
            })
        })
    })
})
app.post('/eliminarInscrito',(req,res)=>{
    let {curso, estudiante, nomCurso} = req.body
    let _id = estudiante+'|'+curso

    Inscripcion.deleteOne({_id: _id},(err, result)=>{
        if(err) return res.render('mensaje',{mensaje: err})
        Usuario.find({documento: estudiante},(err, result)=>{
            if(err) return res.render('mensaje',{mensaje: err})
            console.log(result)
            const msg= {
                to: result[0].email,
                from: 'juanquinteropardo@gmail.com',
                subject: 'Inscripcion a '+nomCurso+' Eliminada!!',
                text:   'Hola '+result[0].nombre+'\n lamentamos informarte que, se ha eliminado tu inscripcion al curso '+nomCurso+
                        ' por favor comunicate con el coordinador por el foro para mas infomacion.'+
                        '\n Saludos!'
            }
            sgMail.send(msg)
        }) 
        res.redirect('/inscritos')
    })
})

//USUARIO 
app.get('/registrar',(req,res)=>{
    res.render('registrar')
})

var upload = multer({
    limits:{
        fileSize: 10000000,
    },
    fileFilter (req, file, cb) {
        if(!file.originalname.match(/\.(jpg|png|jpeg|JPG|JPEG|PNG)$/)){
            return cb(new Error('NO ES UN ARCHIVO VALIDO'))
        }
        cb(null, true)
      }
})

app.post('/registrar',upload.single('archivo'),(req,res)=>{
    // console.log(req.file)
    let {documento, nombre, password, rol, telefono, email, archivo} = req.body
    let usuario =  new Usuario({
        documento, documento,
        nombre: nombre,
        password: bcrypt.hashSync(password, 10) ,
        rol: rol,
        telefono: telefono,
        email: email,
        avatar: req.file.buffer
    })
    //Sengrid mail de bienvenida
    const msg= {
        to: req.body.email,
        from: 'juanquinteropardo@gmail.com',
        subject: 'Te damos la Bienvenida!!',
        text:   'Felicidades ya te encuentras registrad@ en el sistema de gestion los curso de extension del TdeA.'+
                '\nQue estas esperando para matricularte a uno de nuestros cursos, mira ya mismo nuestras ofertas!! '+
                '\nTe Esperamos.'
    }
    usuario.save((err, result)=>{
        if(err) {
            if(err.name == 'ValidationError'){
                res.render('mensaje',{
                    mensaje: '<div class="alert alert-danger">\
                        <strong>ERROR!</strong> Documento o Nombre de usuario repetido.</div>'
                    })
            }
            res.render('mensaje',{mensaje: err})
        }else{
            //Send Grid mail
            sgMail.send(msg)
            let avatar = result.avatar ? result.avatar.toString("base64") : null
            res.render('mensaje',{
                mensaje: 'Usuario <b>'+result.nombre+'</b> registrad@ en el sistema',
                avatar: avatar
            })
        }
    })
})
app.post('/ingresar',(req,res)=>{
    let {nombre, password} = req.body
    Usuario.findOne({nombre: nombre},(err, result)=>{
        if(err) return res.render('mensaje',{mensaje:err})
        if(!result) {
            return res.render('mensaje',{
                mensaje: "Usuario No encontrado",
            })
        }
        if(!bcrypt.compareSync(password, result.password)){
            return res.render('mensaje',{
                mensaje: "Contraseña incorrecta",
            })
        }  
        req.session.usuario = result._id
        req.session.nombre = result.nombre
        req.session.rol = result.rol

        res.redirect('/ingresar/'+result._id)
    })  
})
app.get('/ingresar/:_id',(req,res)=>{
    let _id = req.params._id
    Usuario.findById(_id,(err,result)=>{
        let avatar = result.avatar ? result.avatar.toString("base64") : null
        if(err) res.render('mensaje',{mensaje:err})
        else{
            res.render('mensaje',{
                mensaje: "<p>Bienvenido al sistema <b>"+ result.nombre +"</b></p> " ,
                avatar: avatar ,
            })  
        }
    })  
})
app.get('/salir',(req,res)=>{
    req.session.usuario = false
    res.redirect('/')
})

//Culquier otra cosa
app.get('*',(req,res)=>{
    res.render('error')
})

module.exports =  app