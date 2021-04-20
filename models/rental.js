const mongoose=require('mongoose');
const Joi=require('joi');
const {customerSchema}=require('./customer');

const rentalSchema= new mongoose.Schema({

    customer:{
        type:customerSchema,
        required: true
    },
    movie : {
        type: new mongoose.Schema({
            title: {
                type: String,
                required:true,
                minlength:1,
                maxlength:255
            },
            dailyRentalRate: {
                type: Number,
                required:true,
                min:1,
                max:255
            }
        }),
        required: true
    },
    dateOut:{
        type : Date,
        default :Date.now,
        required :true
    },
    dateReturned :{
        type :Date
    },
    rentalRate:{
        type :Number
    }
});

const Rental = mongoose.model('Rental',rentalSchema);

const joiSchema={
    customerId:Joi.string().required(),
    movieId : Joi.string().required(),  

}
function validateSchema(inp)
{
    return Joi.validate(inp,joiSchema);
}

module.exports.Rental=Rental;
module.exports.validateSchema=validateSchema;
module.exports.rentalSchema=rentalSchema;