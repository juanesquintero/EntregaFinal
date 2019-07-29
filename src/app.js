require('./config/config')
const express = require('express')
const app = express()
const path = require('path')
const mongoose =  require('mongoose')
const bodyParser =  require('body-parser')
const session = require('express-session')
 
const server = require('http').createServer(app);
const io = require('socket.io')(server);


//Node local storage
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    var localStorage = new LocalStorage('./scratch');
    localStorage.getItem('chat.txt') ? null  : localStorage.setItem('chat.txt','');
} 

//Directorios
const dirPublic = path.join(__dirname,'../public')
const dirNode_modules = path.join(__dirname,'../node_modules')
app.use(express.static(dirPublic))
app.use('/js',express.static(dirNode_modules+'/popper.js'))
app.use('/js',express.static(dirNode_modules+'/jquery'))

// Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.use((req,res,next)=>{
    // VARIABLES DE SESION
    if(req.session.usuario){
        res.locals.sesion = true,
        res.locals.nombre = req.session.nombre
        res.locals.rol = req.session.rol
        req.usuario = req.session.usuario  
    }
    next()
})

app.use(bodyParser.urlencoded({extended: false}))

app.use(require('./routes/index'))

mongoose.connect(process.env.URI, {useNewUrlParser: true},(err, result)=>{
    if(err) return console.log(err)
    return console.log('Conectado a Mongo')
});

io.on('connection', client => {
    console.log('Un cliente se ha conectado al chat')
    client.on("mensaje", (mensaje, callback)=>{
        let chat = localStorage.getItem('chat.txt')
        let texto = chat +'<br><b>'+mensaje.nombre + '</b> : ' +mensaje.mensaje
        localStorage.setItem('chat.txt',texto)
        io.emit("mensaje", texto)
        callback()
    })

    client.on("inicio", ()=>{
        let chat = localStorage.getItem('chat.txt')
        io.emit("inicio", chat)
    })
});

//Port 
server.listen(process.env.PORT,()=>{
    console.log('escuchando por el puerto '+process.env.PORT)
})