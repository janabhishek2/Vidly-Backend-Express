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
    const res=  Joi.validate(inp,joiSchema);
    const objectValidation=mongoose.Types.ObjectId.isValid(inp.customerId) && mongoose.Types.ObjectId.isValid(inp.movieId);
    if(!objectValidation)
    {
        res.error+="ObjectId is not Correct";
    }
    return res;
}

module.exports.Customer=Customer;
module.exports.validateSchema=validateSchema;
module.exports.customerSchema=customerSchema;
