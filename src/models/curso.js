const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
var uniqueValidator = require('mongoose-unique-validator');
 
const cursoSchema = new Schema({
    id:{ 
        type: Number, 
        required: true,
        unique: true,
    },
    nombre:{ 
        type: String, 
        required: true,
        unique: true,
        trim: true,
    },
    modalidad:{ 
        type: String, 
        required: false,
        trim: true,
    },
    intensidad : {
        type: Number,
        required: true,
        min:[1,'Ingrese una intensidad mayor'],
        default: 1
    },
    descripcion : {
        type: String,
        required: false,
        default: ""
    },
    valor: {
        type: Number,
        required: true,
        min:[0,'Ingrese un valor 0'],
        default: 0
    },
    estado:{
        type: String,
        required: false,
        enum:['disponible','cerrado'],
        default: "disponible"
    },
});

cursoSchema.plugin(uniqueValidator);

const Curso =  mongoose.model('Curso',cursoSchema)

module.exports = Curso;