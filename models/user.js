const mongoose=require('mongoose');
const Joi=require('joi');

const userSchema=new mongoose.Schema({
    name :{
        type:String,
        minlength:1,
        maxlength:20,
        required:true,
    },
    email:{
        type:String,
        maxlength:255,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:4,
        maxlength:1024
    }
});

const User=mongoose.model('User',userSchema);

const joiSchema={
    name:Joi.string().min(1).max(20).required(),
    email:Joi.string().min(5).max(255).required().email(),
    password : Joi.string().min(4).max(255).required()
}

function validateSchema(inp)
{
    return Joi.validate(inp,joiSchema);
}

module.exports.User=User;
module.exports.validateSchema=validateSchema;
