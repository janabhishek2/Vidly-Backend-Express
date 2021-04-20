const Joi=require('joi');
const mongoose=require('mongoose');

const customerSchema= new mongoose.Schema({
    isGold : {
        type : Boolean,
        required :true
    },
    name : {
        type : String,
        required:true,
        minlength:1,
        maxlength:25,
        trim:true,
    },
    phone : {
        type:String,
        required:true,
        minlength:10,
        maxlength:10,
        trim:true
    }

})
const Customer=mongoose.model('Customer',customerSchema);

const joiSchema={
    isGold:Joi.boolean().required(),
    name :Joi.string().min(1).max(25).required(),
    phone : Joi.string().min(10).max(10).required()

}
function validateSchema(inp)
{
    return Joi.validate(inp,joiSchema);
}

module.exports.Customer=Customer;
module.exports.validateSchema=validateSchema;
