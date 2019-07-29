const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
var uniqueValidator = require('mongoose-unique-validator');
 
const inscripcionSchema = new Schema({
    _id:{
        type: String,
        require:true,
        unique: true
    },
    id:{
        type: Number,
        require: true
    },
    curso:{
        type: String, 
        required: true,
    },
    documento:{
        type: Number,
        require: true
    },
    estudiante:{ 
        type: String, 
        required: true,
    },
});

inscripcionSchema.plugin(uniqueValidator);

const Inscripcion =  mongoose.model('Inscripcion',inscripcionSchema)

module.exports = Inscripcion;