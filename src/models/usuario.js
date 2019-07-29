const mongoose = require('mongoose')
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
 
const usuarioSchema = new Schema({
    documento:{ 
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
    password:{ 
        type: String, 
        required: true,
        trim: true,
    },
    email:{ 
        type: String, 
        required: true,
        trim: true,
    },
    telefono : {
        type: Number,
        required: true,
    },
    avatar:{
        type: Buffer,
    },
    rol:{
        type: String, 
        required: true,
        trim: true,
        enum: ['Coordinador','Aspirante']
    }
});

usuarioSchema.plugin(uniqueValidator);

const Usuario =  mongoose.model('Usuario',usuarioSchema)

module.exports = Usuario;